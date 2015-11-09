'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultReactApp = defaultReactApp;

function _instanceof(left, right) { if (right != null && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { return obj && obj.constructor === Symbol ? "symbol" : typeof obj; }

function defaultReactApp(config) {
    if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) !== 'object') {
        throw new Error('A config object must be provided');
    }
    if (typeof config.rootElementGetter !== 'function') {
        throw new Error('The config object must have a rootElementGetter function');
    }
    if (typeof config.mountApp !== 'function') {
        throw new Error('The config object must have a mountApp function');
    }
    return {
        applicationWasMounted: function applicationWasMounted() {
            return new Promise(function (resolve) {
                if (config.React) window.React = config.React;
                if (config.ReactDOM) window.ReactDOM = config.ReactDOM;
                config.mountApp();
                resolve();
            });
        },
        applicationWillUnmount: function applicationWillUnmount() {
            return new Promise(function (resolve) {
                var rootElementGetter = config.rootElementGetter();
                var rootElementPromise = undefined;
                if (_instanceof(rootElementGetter, Promise)) {
                    rootElementPromise = rootElementGetter;
                } else {
                    //just a synchronous function
                    rootElementPromise = new Promise(function (resolve) {
                        return resolve(rootElementGetter);
                    });
                }
                rootElementPromise.then(function (rootElement) {
                    var ReactDOMPromise = undefined;
                    if (typeof config.ReactDOMGetter === 'function') {
                        ReactDOMPromise = config.ReactDOMGetter();
                        if (!_instanceof(ReactDOMPromise, Promise)) {
                            //it's just a synchronous function call, not a promise
                            ReactDOMPromise = new Promise(function (resolve) {
                                return resolve(ReactDOMPromise);
                            });
                        }
                    } else if (window.ReactDOM) {
                        ReactDOMPromise = new Promise(function (resolve) {
                            return resolve(window.ReactDOM);
                        });
                    } else if (window.React && window.React.unmountComponentAtNode) {
                        //old school React has all the ReactDOM funcs on the React obj
                        ReactDOMPromise = new Promise(function (resolve) {
                            return resolve(window.React);
                        });
                    } else {
                        throw new Error('Could not unmount React application because no ReactDOM object was provided in the single spa config');
                    }

                    if (window.React) {
                        config.React = window.React;
                    }
                    if (window.ReactDOM) {
                        config.ReactDOM = window.ReactDOM;
                    }

                    ReactDOMPromise.then(function (ReactDOM) {
                        return ReactDOM.unmountComponentAtNode(rootElement);
                    }).then(function () {
                        return delete window.React;
                    }).then(function () {
                        return delete window.ReactDOM;
                    }).then(function () {
                        return resolve();
                    }).catch(function (ex) {
                        throw ex;
                    });
                }).catch(function (ex) {
                    throw ex;
                });
            });
        }
    };
}

//# sourceMappingURL=single-spa-react.dist.js.map