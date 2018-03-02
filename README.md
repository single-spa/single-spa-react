# single-spa-react

Generic lifecycle hooks for React applications that are registered as [applications](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#registered-applications) of [single-spa](https://github.com/CanopyTax/single-spa).

## Example
In addition to this Readme, example usage of single-spa-react can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/react/react.app.js) project.

## Quickstart

First, in the [single-spa application](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#registered-applications), run `npm install --save single-spa-react`. Then, create an entry file for the application:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import rootComponent from './path-to-root-component.js';
import singleSpaReact from 'single-spa-react';

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent,
  domElementGetter: () => document.getElementById('main-content'),
});

export const bootstrap = [
  reactLifecycles.bootstrap,
];

export const mount = [
  reactLifecycles.mount,
];

export const unmount = [
  reactLifecycles.unmount,
];
```

## Options

All options are passed to single-spa-react via the `opts` parameter when calling `singleSpaReact(opts)`. The following options are available:

- `React`: (required) The main React object, which is generally either exposed onto the window or is available via `require('react')` `import React from 'react'`.
- `ReactDOM`: (required) The main ReactDOMbject, which is available via `require('react-dom')` `import ReactDOM from 'react-dom'`.
- `rootComponent`: (required) The top level React component which will be rendered
- `domElementGetter`: (required) A function that takes in no arguments and returns a DOMElement. This dom element is where the React application will be bootstrapped, mounted, and unmounted.
- `suppressComponentDidCatchWarning`: (optional) A boolean that indicates if single-spa-react should warn when the rootComponent does not implement componentDidCatch. Defaults to false.

## Notes

For react@>=16, it is best practice to have each single-spa application's root application implement componentDidCatch in order to avoid
the entire application unmounting unexpectedly when an error occurs. single-spa-react will warn to the console if componentDidCatch is not
implemented. See https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html for more details.
