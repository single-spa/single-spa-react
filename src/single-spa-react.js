/* We don't import parcel.component.js from this file intentionally. See comment
 * in that file for why
 */

// React context that gives any react component the single-spa props
export let SingleSpaContext = null

const defaultOpts = {
  // required opts
  React: null,
  ReactDOM: null,
  rootComponent: null,
  loadRootComponent: null,
  domElementGetter: null,
  suppressComponentDidCatchWarning: false,

  // optional opts
  domElementGetter: null, // only can be omitted if provided as a custom prop
  parcelCanUpdate: true, // by default, allow parcels created with single-spa-react to be updated
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

  if (!opts.rootComponent && !opts.loadRootComponent) {
    throw new Error(`single-spa-react must be passed opts.rootComponent or opts.loadRootComponent`);
  }

  if (!SingleSpaContext && opts.React.createContext) {
    SingleSpaContext = opts.React.createContext()
  }

  const lifecycles = {
    bootstrap: bootstrap.bind(null, opts),
    mount: mount.bind(null, opts),
    unmount: unmount.bind(null, opts),
  };

  if (opts.parcelCanUpdate) {
    lifecycles.update = update.bind(null, opts)
  }

  return lifecycles
}

function bootstrap(opts, props) {
  if (opts.rootComponent) {
    // This is a class or stateless function component
    return Promise.resolve()
  } else {
    // They passed a promise that resolves with the react component. Wait for it to resolve before mounting
    return opts
      .loadRootComponent()
      .then(resolvedComponent => {
        opts.rootComponent = resolvedComponent
      })
  }
}

function mount(opts, props) {
  return new Promise((resolve, reject) => {

    if (!opts.rootComponent.prototype.componentDidCatch && !opts.suppressComponentDidCatchWarning && atLeastReact16(opts.React)) {
      console.warn(`single-spa-react: ${props.name || props.appName || props.childAppName}'s rootComponent should implement componentDidCatch to avoid accidentally unmounting the entire single-spa application.`);
    }

    const domElementGetter = chooseDomElementGetter(opts, props)

    if (!domElementGetter) {
      throw new Error(`Cannot mount react application '${props.appName || props.name}' without a domElementGetter provided in either opts or props`)
    }

    const whenFinished = function() {
      resolve(this);
    };


    const rootComponentElement = opts.React.createElement(opts.rootComponent, props)
    const elementToRender = SingleSpaContext ? opts.React.createElement(SingleSpaContext.Provider, {value: props}, rootComponentElement) : rootComponentElement
    const domElement = getRootDomEl(domElementGetter)
    const renderedComponent = reactDomRender({elementToRender, domElement, whenFinished, opts})
    opts.domElement = domElement
  })
}

function unmount(opts, props) {
  return Promise
    .resolve()
    .then(() => {
      opts.ReactDOM.unmountComponentAtNode(opts.domElement);
    })
}

function update(opts, props) {
  return new Promise((resolve, reject) => {
    const whenFinished = function() {
      resolve(this);
    };

    const rootComponentElement = opts.React.createElement(opts.rootComponent, props)
    const elementToRender = SingleSpaContext ? opts.React.createElement(SingleSpaContext.Provider, {value: props}, rootComponentElement) : rootComponentElement
    const renderedComponent = reactDomRender({elementToRender, domElement:opts.domElement, whenFinished, opts})
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
  props = props && props.customProps ? props.customProps : props
  if (props.domElement) {
    return () => props.domElement
  } else if (props.domElementGetter) {
    return props.domElementGetter
  } else {
    return opts.domElementGetter
  }
}

function reactDomRender({opts, elementToRender, domElement, whenFinished}) {
  if(opts.renderType === 'createRoot') {
    return opts.ReactDOM.createRoot(domElement).render(elementToRender, whenFinished)
  }

  if(opts.renderType === 'hydrate') {
    return opts.ReactDOM.hydrate(elementToRender, domElement, whenFinished)
  }

  // default to this if 'renderType' is null or doesn't match the other options
  return opts.ReactDOM.render(elementToRender, domElement, whenFinished)
}
