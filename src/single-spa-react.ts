import { chooseDomElementGetter } from "dom-element-getter-helpers";
import type { DomElementGetterOpts } from "dom-element-getter-helpers";
import type { ReactNode, createElement, useEffect } from "react";
import type {
  createRoot,
  hydrateRoot,
  RootOptions,
  Root,
} from "react-dom/client";
import type { AppProps, LifeCycles } from "single-spa";

export type SingleSpaReactOpts = DomElementGetterOpts & {
  createElement;
  useEffect;
  renderReactNode: ((props) => ReactNode) | ((props) => Promise<ReactNode>);
  createRoot?;
  hydrateRoot?;
  rootOptions?: RootOptions;
};

export default function singleSpaReact<ExtraProps = {}>(
  opts: SingleSpaReactOpts,
): LifeCycles<ExtraProps> {
  if (!opts) {
    throw Error(
      `single-spa-react: singleSpaReact() function requires an opts object passed as argument`,
    );
  }

  if (
    typeof opts.createRoot !== "function" &&
    typeof opts.hydrateRoot !== "function"
  ) {
    throw Error(
      `single-spa-react: opts.createRoot or opts.hydrateRoot must be defined`,
    );
  }

  if (typeof opts.renderReactNode !== "function") {
    throw Error(`single-spa-react: opts.renderReactNode must be defined`);
  }

  if (typeof opts.createElement !== "function") {
    throw Error(`single-spa-react: opts.createElement must be defined`);
  }

  if (typeof opts.useEffect !== "function") {
    throw Error(`single-spa-react: opts.useEffect must be defined`);
  }

  const instances = {};

  const SingleSpaRoot = (rootProps) => {
    opts.useEffect(() => {
      console.log("render finished");
      rootProps.renderFinished();
    });

    return rootProps.children;
  };

  return {
    async init(props: AppProps & ExtraProps) {},
    async mount(props: AppProps & ExtraProps) {
      let renderFinished, renderFailed;
      const renderFinishedPromise = new Promise((resolve, reject) => {
        renderFinished = resolve;
        renderFailed = reject;
      });

      function onUncaughtError(error, errorInfo) {
        console.error(`single-spa-react: error mounting '${props.name}'`);
        console.error(error);
        console.error(errorInfo);
        renderFailed(error);
      }

      const domElement = chooseDomElementGetter(opts, props)();
      const childNode: ReactNode = await opts.renderReactNode(props);
      const rootOptions: RootOptions = {
        identifierPrefix: props.name,
        onUncaughtError,
        ...(opts.rootOptions ?? {}),
      };
      const reactElement = opts.createElement(SingleSpaRoot, {
        renderFinished,
        children: childNode,
      });

      console.log("domElement", domElement.id);

      let root: Root;
      if (opts.createRoot) {
        root = opts.createRoot(domElement, rootOptions);
        root.render(reactElement);
      } else {
        root = opts.hydrateRoot(domElement, reactElement, rootOptions);
      }

      instances[props.name] = root;

      await renderFinishedPromise;
    },
    async update(props: AppProps & ExtraProps) {
      const reactRoot = instances[props.name];
      const reactElement: ReactNode = await opts.renderReactNode(props);

      let renderFinished;
      const renderPromise = new Promise((resolve) => {
        renderFinished = resolve;
      });

      reactRoot.render(
        opts.createElement(SingleSpaRoot, {
          renderFinished,
          children: reactElement,
        }),
      );

      await renderPromise;
    },
    async unmount(props: AppProps & ExtraProps) {
      instances[props.name].unmount();
      const domElement = chooseDomElementGetter(opts, props)();
      if (domElement.domElementGetterHelpers) {
        domElement.remove();
      }
      delete instances[props.name];
    },
  };
}
