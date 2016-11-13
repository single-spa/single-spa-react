# single-spa-react

Generic lifecycle hooks for React applications that are registered as [child applications](https://github.com/CanopyTax/single-spa/blob/master/docs/child-applications.md) of [single-spa](https://github.com/CanopyTax/single-spa).

## Example
In addition to the Readme here, an example can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/react/react.app.js) project.

## Quickstart

First, in the child application, run `npm install --save single-spa-react` (or `jspm install npm:single-spa-react` if your child application is managed by jspm). Then, in your [child app's entry file](https://github.com/CanopyTax/single-spa/blob/docs-1/docs/configuring-child-applications.md#the-entry-file), do the following:

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
