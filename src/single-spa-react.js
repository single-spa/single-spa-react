export function defaultReactApp(config) {
    if (typeof config !== 'object') {
        throw new Error(`A config object must be provided`);
    }
    if (typeof config.rootElementGetter !== 'function') {
        throw new Error(`The config object must have a rootElementGetter function`);
    }
    return {
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

                    ReactDOMPromise
                    .then((ReactDOM) => ReactDOM.unmountComponentAtNode(rootElement))
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
