/* We don't import parcel.component.js from this file intentionally. See comment
 * in that file for why
 */

import { chooseDomElementGetter } from "dom-element-getter-helpers";

// React context that gives any react component the single-spa props
export let SingleSpaContext = null;

// This try/catch exists mostly to prevent rollup from thinking that SingleSpaContext
// is null and then doing optimizations in parcel.js that cause bugs.
// See https://github.com/single-spa/single-spa-react/issues/105

try {
  // single-spa-react is usable as a global script, as a systemjs module, and other
  // situations where require() is unavailable. This is why we require the user to
  // pass in opts.React and opts.ReactDOM - to avoid the mess of "how do i properly load react".
  // However, in situations where require() is available, we can use it this way to create
  // the react context. The try/catch defensiveness keeps single-spa-react working in
  // as many situations as possible.
  SingleSpaContext = require("react").createContext();
} catch {
  // ignore
}

const defaultOpts = {
  // required opts
  React: null,
  ReactDOMClient: null,

  // required - one or the other
  rootComponent: null,
  loadRootComponent: null,

  // optional opts
  renderType: "createRoot",
  errorBoundary: null,
  errorBoundaryClass: null,
  domElementGetter: null,
  parcelCanUpdate: true, // by default, allow parcels created with single-spa-react to be updated
  suppressComponentDidCatchWarning: false,
  domElements: {},
  renderResults: {},
  updateResolves: {},
};

export default function singleSpaReact(userOpts) {
  if (typeof userOpts !== "object") {
    throw new Error(`single-spa-react requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.React) {
    throw new Error(`single-spa-react must be passed opts.React`);
  }

  if (!opts.ReactDOMClient) {
    throw new Error(`single-spa-react must be passed opts.ReactDOMClient`);
  }

  if (!opts.rootComponent && !opts.loadRootComponent) {
    throw new Error(
      `single-spa-react must be passed opts.rootComponent or opts.loadRootComponent`
    );
  }

  if (opts.errorBoundary && typeof opts.errorBoundary !== "function") {
    throw Error(
      `The errorBoundary opt for single-spa-react must either be omitted or be a function that returns React elements`
    );
  }

  if (!SingleSpaContext && opts.React.createContext) {
    SingleSpaContext = opts.React.createContext();
  }

  opts.SingleSpaRoot = createSingleSpaRoot(opts);

  const lifecycles = {
    bootstrap: bootstrap.bind(null, opts),
    mount: mount.bind(null, opts),
    unmount: unmount.bind(null, opts),
  };

  if (opts.parcelCanUpdate) {
    lifecycles.update = update.bind(null, opts);
  }

  return lifecycles;
}

function bootstrap(opts, props) {
  if (opts.rootComponent) {
    // This is a class or stateless function component
    return Promise.resolve();
  } else {
    // They passed a promise that resolves with the react component. Wait for it to resolve before mounting
    return opts.loadRootComponent(props).then((resolvedComponent) => {
      opts.rootComponent = resolvedComponent;
    });
  }
}

function mount(opts, props) {
  return new Promise((resolve, reject) => {
    if (
      !opts.suppressComponentDidCatchWarning &&
      atLeastReact16(opts.React) &&
      !opts.errorBoundary
    ) {
      if (!opts.rootComponent.prototype) {
        console.warn(
          `single-spa-react: ${
            props.name || props.appName || props.childAppName
          }'s rootComponent does not implement an error boundary.  If using a functional component, consider providing an opts.errorBoundary to singleSpaReact(opts).`
        );
      } else if (!opts.rootComponent.prototype.componentDidCatch) {
        console.warn(
          `single-spa-react: ${
            props.name || props.appName || props.childAppName
          }'s rootComponent should implement componentDidCatch to avoid accidentally unmounting the entire single-spa application.`
        );
      }
    }

    const whenMounted = function () {
      resolve(this);
    };

    const elementToRender = getElementToRender(opts, props, whenMounted);
    const domElement = chooseDomElementGetter(opts, props)();
    const renderResult = reactDomRender({
      elementToRender,
      domElement,
      opts,
    });
    opts.domElements[props.name] = domElement;
    opts.renderResults[props.name] = renderResult;
  });
}

function unmount(opts, props) {
  return new Promise((resolve) => {
    opts.unmountFinished = resolve;
    const root = opts.renderResults[props.name];
    const unmountResult = root.unmount();
    delete opts.domElements[props.name];
    delete opts.renderResults[props.name];
  });
}

function update(opts, props) {
  return new Promise((resolve) => {
    if (!opts.updateResolves[props.name]) {
      opts.updateResolves[props.name] = [];
    }

    opts.updateResolves[props.name].push(resolve);

    const elementToRender = getElementToRender(opts, props, null);
    const renderRoot = opts.renderResults[props.name];

    renderRoot.render(elementToRender);
  });
}

function atLeastReact16(React) {
  if (
    React &&
    typeof React.version === "string" &&
    React.version.indexOf(".") >= 0
  ) {
    const majorVersionString = React.version.slice(
      0,
      React.version.indexOf(".")
    );
    try {
      return Number(majorVersionString) >= 16;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

function reactDomRender({ opts, elementToRender, domElement }) {
  const renderType =
    typeof opts.renderType === "function" ? opts.renderType() : opts.renderType;

  if (renderType === "hydrateRoot") {
    const root = opts.ReactDOMClient[renderType](domElement, elementToRender);
    return root;
  }

  if (renderType === "createRoot") {
    const root = opts.ReactDOMClient[renderType](domElement);
    root.render(elementToRender);
    return root;
  }

  return null; // no root means no updates
}

function getElementToRender(opts, props, mountFinished) {
  const rootComponentElement = opts.React.createElement(
    opts.rootComponent,
    props
  );

  let elementToRender = SingleSpaContext
    ? opts.React.createElement(
        SingleSpaContext.Provider,
        { value: props },
        rootComponentElement
      )
    : rootComponentElement;

  if (
    opts.errorBoundary ||
    props.errorBoundary ||
    opts.errorBoundaryClass ||
    props.errorBoundaryClass
  ) {
    opts.errorBoundaryClass =
      opts.errorBoundaryClass ||
      props.errorBoundaryClass ||
      createErrorBoundary(opts, props);
    elementToRender = opts.React.createElement(
      opts.errorBoundaryClass,
      props,
      elementToRender
    );
  }

  // https://github.com/single-spa/single-spa-react/issues/112
  elementToRender = opts.React.createElement(
    opts.SingleSpaRoot,
    {
      ...props,
      mountFinished,
      updateFinished() {
        if (opts.updateResolves[props.name]) {
          opts.updateResolves[props.name].forEach((r) => r());
          delete opts.updateResolves[props.name];
        }
      },
      unmountFinished() {
        setTimeout(opts.unmountFinished);
      },
    },
    elementToRender
  );

  return elementToRender;
}

function createErrorBoundary(opts, props) {
  // Avoiding babel output for class syntax and super()
  // to avoid bloat
  function SingleSpaReactErrorBoundary(props) {
    // super
    opts.React.Component.apply(this, arguments);

    this.state = {
      caughtError: null,
      caughtErrorInfo: null,
    };

    SingleSpaReactErrorBoundary.displayName = `SingleSpaReactErrorBoundary(${props.name})`;
  }

  SingleSpaReactErrorBoundary.prototype = Object.create(
    opts.React.Component.prototype
  );

  SingleSpaReactErrorBoundary.prototype.render = function () {
    if (this.state.caughtError) {
      const errorBoundary = opts.errorBoundary || props.errorBoundary;

      return errorBoundary(
        this.state.caughtError,
        this.state.caughtErrorInfo,
        this.props
      );
    } else {
      return this.props.children;
    }
  };

  SingleSpaReactErrorBoundary.prototype.componentDidCatch = function (
    err,
    info
  ) {
    this.setState({
      caughtError: err,
      caughtErrorInfo: info,
    });
  };

  return SingleSpaReactErrorBoundary;
}

function createSingleSpaRoot(opts) {
  // This is a class component, since we need a mount hook and single-spa-react supports React@15 (no useEffect available)
  function SingleSpaRoot(_props) {
    SingleSpaRoot.displayName = `SingleSpaRoot(${_props.name})`;
  }

  SingleSpaRoot.prototype = Object.create(opts.React.Component.prototype);
  SingleSpaRoot.prototype.componentDidMount = function () {
    setTimeout(this.props.mountFinished);
  };
  SingleSpaRoot.prototype.componentWillUnmount = function () {
    setTimeout(this.props.unmountFinished);
  };
  SingleSpaRoot.prototype.render = function () {
    // componentDidUpdate doesn't seem to be called during root.render() for updates
    setTimeout(this.props.updateFinished);

    return this.props.children;
  };

  return SingleSpaRoot;
}
