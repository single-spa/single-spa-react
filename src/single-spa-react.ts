import {
  chooseDomElementGetter,
  type DomElementGetterOpts,
} from "dom-element-getter-helpers";
import type { ReactNode } from "react";
import type {
  createRoot,
  hydrateRoot,
  RootOptions,
  Root,
} from "react-dom/client";

export interface SingleSpaReactOpts extends DomElementGetterOpts {
  createRoot: typeof createRoot;
  hydrateRoot: typeof hydrateRoot;
  rootOptions?: RootOptions;
  createReactNode: ((props) => ReactNode) | ((props) => Promise<ReactNode>);
}

export default function singleSpaReact(opts: SingleSpaReactOpts) {
  if (!opts) {
    throw Error(
      `single-spa-react: singleSpaReact() function requires an opts object passed as argument`,
    );
  }

  if (
    typeof opts.createRoot !== "function" ||
    typeof opts.hydrateRoot !== "function"
  ) {
    throw Error(
      `single-spa-react: opts.createRoot or opts.hydrateRoot must be defined`,
    );
  }

  if (typeof opts.createReactNode !== "function") {
    throw Error(`single-spa-react: opts.createReactNode must be defined`);
  }

  const instances = {};

  return {
    async init() {},
    async mount(props) {
      const domElement = chooseDomElementGetter(opts, props)();
      const reactElement: ReactNode = await opts.createReactNode(props);
      const rootOptions: RootOptions = {
        identifierPrefix: props.name,
        ...(opts.rootOptions ?? {}),
      };
      let root: Root;
      if (opts.createRoot) {
        root = opts.createRoot(domElement, rootOptions);
        root.render(reactElement);
      } else {
        root = opts.hydrateRoot(domElement, reactElement, rootOptions);
      }

      instances[props.name] = root;
    },
    async unmount(props) {
      instances[props.name].unmount();
      delete instances[props.name];
    },
  };
}
