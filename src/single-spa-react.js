const defaultOpts = {
  // required opts
  React: null,
  ReactDOM: null,
  rootComponent: null,
  domElementGetter: null,
  suppressComponentDidCatchWarning: false,

  // optional opts
  domElementGetter: null, // only can be omitted if provided as a custom prop
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
    const domElementGetter = chooseDomElementGetter(opts, props)

    if (!domElementGetter) {
      throw new Error(`Cannot mount react application '${props.appName || props.name}' without a domElementGetter provided in either opts or props`)
    }

    const whenFinished = function() {
      resolve(this);
    };
    const renderedComponent = opts.ReactDOM.render(opts.React.createElement(opts.rootComponent, props), getRootDomEl(domElementGetter), whenFinished);
    if (!renderedComponent.componentDidCatch && !opts.suppressComponentDidCatchWarning && atLeastReact16(opts.React)) {
      console.warn(`single-spa-react: ${props.name || props.appName || props.childAppName}'s rootComponent should implement componentDidCatch to avoid accidentally unmounting the entire single-spa application.`);
    }
  })
}

function unmount(opts, props) {
  return Promise
    .resolve()
    .then(() => {
      const domElementGetter = chooseDomElementGetter(opts, props)

      if (!domElementGetter) {
        throw new Error(`Cannot unmount react application '${props.appName || props.name}' without a domElementGetter provided in either opts or props`)
      }

      opts.ReactDOM.unmountComponentAtNode(getRootDomEl(domElementGetter));
    })
}

function getRootDomEl(domElementGetter) {
  const el = domElementGetter();
  if (!el) {
    throw new Error(`single-spa-react: domElementGetter function did not return a valid dom element`);
  }

  return el;
}

function atLeastReact16(React) {
  if (React && typeof React.version === 'string' && React.version.indexOf('.') >= 0) {
    const majorVersionString = React.version.slice(0, React.version.indexOf('.'));
    try {
      return Number(majorVersionString) >= 16;
    } catch(err) {
      return false;
    }
  } else {
    return false;
  }
}

function chooseDomElementGetter(opts, props) {
  return props && props.customProps && props.customProps.domElementGetter ? props.customProps.domElementGetter : opts.domElementGetter
}
