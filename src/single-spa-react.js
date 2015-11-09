export function defaultReactApp(config) {
    if (typeof config !== 'object') {
        throw new Error(`A config object must be provided`);
    }
    if (typeof config.rootElementGetter !== 'function') {
        throw new Error(`The config object must have a rootElementGetter function`);
    }
    if (typeof config.mountApp !== 'function') {
        throw new Error(`The config object must have a mountApp function`);
    }
    return {
        applicationWasMounted: function() {
            return new Promise((resolve) => {
                if (config.React)
                    window.React = config.React;
                if (config.ReactDOM)
                    window.ReactDOM = config.ReactDOM;
                config.mountApp();
                resolve();
            });
        },
        applicationWillUnmount: function() {
            return new Promise((resolve) => {
                const rootElementGetter = config.rootElementGetter();
                let rootElementPromise;
                if (rootElementGetter instanceof Promise) {
                    rootElementPromise = rootElementGetter;
                } else {
                    //just a synchronous function
                    rootElementPromise = new Promise((resolve) => resolve(rootElementGetter));
                }
                rootElementPromise
                .then((rootElement) => {
                    let ReactDOMPromise;
                    if (typeof config.ReactDOMGetter === 'function') {
                        ReactDOMPromise = config.ReactDOMGetter();
                        if (!(ReactDOMPromise instanceof Promise)) {
                            //it's just a synchronous function call, not a promise
                            ReactDOMPromise = new Promise((resolve) => resolve(ReactDOMPromise));
                        }
                    } else if (window.ReactDOM) {
                        ReactDOMPromise = new Promise((resolve) => resolve(window.ReactDOM));
                    } else if (window.React && window.React.unmountComponentAtNode) {
                        //old school React has all the ReactDOM funcs on the React obj
                        ReactDOMPromise = new Promise((resolve) => resolve(window.React));
                    } else {
                        throw new Error(`Could not unmount React application because no ReactDOM object was provided in the single spa config`);
                    }

                    if (window.React) {
                        config.React = window.React;
                    }
                    if (window.ReactDOM) {
                        config.ReactDOM = window.ReactDOM;
                    }

                    ReactDOMPromise
                    .then((ReactDOM) => ReactDOM.unmountComponentAtNode(rootElement))
                    .then(() => delete window.React)
                    .then(() => delete window.ReactDOM)
                    .then(() => resolve())
                    .catch((ex) => {
                        throw ex;
                    });
                })
                .catch((ex) => {
                    throw ex;
                });
            })
        }
    }
}
