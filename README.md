# single-spa-react
[![Build Status](https://travis-ci.org/CanopyTax/single-spa-react.svg?branch=master)](https://travis-ci.org/CanopyTax/single-spa-react)

Generic lifecycle hooks for React applications that are registered as either [single-spa applications](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#registered-applications) or [single-spa](https://github.com/CanopyTax/single-spa) parcels.

## Example
In addition to this Readme, example usage of single-spa-react can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/react/react.app.js) project.

## Quickstart

First, in the [single-spa application](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#registered-applications), run `npm install --save single-spa-react`. Note that alternatively
you can use single-spa-react by adding `<script src="https://unpkg.com/single-spa-react"></script>` and accessing the singleSpaReact global variable.

Then, create an entry file for the application:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import rootComponent from './path-to-root-component.js';
// Note that SingleSpaContext is a react@16.3 (if available) context that provides the singleSpa props
import singleSpaReact, {SingleSpaContext} from 'single-spa-react';

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
- `rootComponent`: (required) The top level React component which will be rendered. Can be omitted only if `loadRootComponent` is provided.
- `loadRootComponent`: (optional) A loading function that returns a promise that resolves with the parcel. This takes the place of the `rootComponent` opt, when provided. It is intended to help people
   who want to lazy load the source code for their root component. The source code will be lazy loaded during the bootstrap lifecycle.
- `suppressComponentDidCatchWarning`: (optional) A boolean that indicates if single-spa-react should warn when the rootComponent does not implement componentDidCatch. Defaults to false.
- `domElementGetter`: (optional) A function that takes in no arguments and returns a DOMElement. This dom element is where the React application will be bootstrapped, mounted, and unmounted.
  Note that this opt can only be omitted when domElementGetter is passed in as a [custom prop](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md#custom-props) or if `domElement`
  is passed as prop. So you must either do `singleSpaReact({..., domElementGetter: function() {return ...}})`, `singleSpa.registerApplication(name, app, activityFn, {domElementGetter: function() {...}})`,
  or `singleSpaReact({..., domElement})`.
- `parcelCanUpdate`: (optional) A boolean that controls whether an update lifecycle will be created for the returned parcel. Note that option does not impact single-spa applications, but only parcels.
  It is true by default.
- `renderType`: (optional) ENUM of one of the following: [ 'render', 'hydrate', 'createRoot' ]. Defaults to `'render'`. Allows you to choose which ReactDOM render method you want to use for your application.

## Notes

For react@>=16, it is best practice to have each single-spa application's root application implement componentDidCatch in order to avoid
the entire application unmounting unexpectedly when an error occurs. single-spa-react will warn to the console if componentDidCatch is not
implemented. See https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html for more details.

## SingleSpaContext

## Parcels
single-spa-react can also be used to create a single-spa parcel (instead of a single-spa application). To do so, simply call singleSpaReact() the same as for an application, except without a
domElementGetter (since those are provided by the code that will mount the parcel).

Additionally, single-spa-react provides a `<Parcel>` component to make using framework agnostic single-spa parcels easier. This allows you to put the parcel into your render method's jsx, instead of having to implement componentDidMount and componentWillUnmount.
You can use the Parcel component either by npm installing the library and importing `single-spa-react/parcel` or by adding `<script src="https://unpkg.com/single-spa-react/parcel"></script>` and then accessing the Parcel component with `window.Parcel.default`.

#### Parcel props
- `config` (required): Either a single-spa parcel config object, or a "loading function" that returns a Promise that resolves with the parcel config.
- `wrapWith` (optional): A string [tagName](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName).`<Parcel>` will create a dom node of that type for the parcel to be mounted into. Defaults to `div`
- `appendTo` (optional): A dom element to append the parcel to. By default, this is not needed because the parcel will be mounted in the DOM that the `<Parcel>` component was rendered into. Useful for appending parcels to document.body or other separate parts of the dom.
- `mountParcel` (sometimes required, sometimes not): The `mountParcel` function provided by single-spa. In general, it is preferred to use an application's mountParcel function instead of the
   single-spa's root mountParcel function, so that single-spa can keep track of the parent-child relationship and automatically unmount the application's parcels when the application unmounts.
   Note that if the `<Parcel>` component is being rendered by a single-spa application that uses single-spa-react, it is **unnecessary** to pass in the prop, since `<Parcel>` can get the prop
   from [SingleSpaContext](#singlespacontext)
- `handleError` (optional): A function that will be called with errors thrown by the parcel. If not provided, errors will be thrown on the window, by default.
- `parcelDidMount` (optional): A function that will be called when the parcel finishes loading and mounting.

#### Examples
```jsx
import Parcel from 'single-spa-react/parcel'
import * as parcelConfig from './my-parcel.js'

// config is required. The parcel will be mounted inside of the
// of a div inside of the react component tree
<Parcel
  config={parcelConfig}

  wrapWith="div"
  handleError={err => console.error(err)}

  customProp1="customPropValue2"
  customProp2="customPropValue2"
/>

// If you pass in an appendTo prop, the parcel will be mounted there instead of
// to a dom node inside of the current react component tree
<Parcel>
  config={parcelConfig}
  wrapWith="div"
  appendTo={document.body}
/>

// You can also pass in a "loading function" as the config.
// The loading function must return a promise that resolves with the parcel config.
// The parcel will be mounted once the promise resolves.
<Parcel
  config={() => import('./my-parcel.js')}
  wrapWith="div"
/>

// If you are rendering the Parcel component from a single-spa application, you do not need to pass a mountParcel prop.
// But if you have a separate react component tree that is not rendered by single-spa-react, you **must** pass in a mountParcel prop
// In general, it is preferred to use an application's mountParcel function instead of the single-spa's root mountParcel function,
// so that single-spa can keep track of the parent-child relationship and automatically unmount the application's parcels when the application
// unmounts
<Parcel
  mountParcel={singleSpa.mountParcel}
  config={parcelConfig}
  wrapWith="div"
/>
```
