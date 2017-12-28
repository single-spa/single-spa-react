const defaultOpts = {
  // required opts
  React: null,
  ReactDOM: null,
  rootComponent: null,
  domElementGetter: null,
  suppressComponentDidCatchWarning: false,
}

export default function singleSpaReact(userOpts) {
  if (typeof userOpts !== 'object') {
    throw new Error(`single-spa-react requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.React) {
    throw new Error(`single-spa-react must be passed opts.React`);
  }

  if (!opts.ReactDOM) {
    throw new Error(`single-spa-react must be passed opts.ReactDOM`);
  }

  if (!opts.rootComponent) {
    throw new Error(`single-spa-react must be passed opts.rootComponent`);
  }

  if (!opts.domElementGetter) {
    throw new Error(`single-spa-react must be passed opts.domElementGetter function`);
  }

  return {
    bootstrap: bootstrap.bind(null, opts),
    mount: mount.bind(null, opts),
    unmount: unmount.bind(null, opts),
  };
}

function bootstrap(opts) {
  return Promise.resolve();
}

function mount(opts, props) {
  return new Promise((resolve, reject) => {
    const whenFinished = resolve;
    const renderedComponent = opts.ReactDOM.render(opts.React.createElement(opts.rootComponent), getRootDomEl(opts), whenFinished);
    if (!renderedComponent.componentDidCatch && !opts.suppressComponentDidCatchWarning) {
      console.warn(`the rootComponent for "${props.childAppName}" that was passed to single-spa-react should implement componentDidCatch.`);
    }
  })
}

function unmount(opts) {
  return Promise
    .resolve()
    .then(() => {
      opts.ReactDOM.unmountComponentAtNode(getRootDomEl(opts));
    })
}

function getRootDomEl(opts) {
  const el = opts.domElementGetter();
  if (!el) {
    throw new Error(`single-spa-react: domElementGetter function did not return a valid dom element`);
  }

  return el;
}
