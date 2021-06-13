import singleSpaReact from "./single-spa-react.js";
import "@testing-library/jest-dom/extend-expect";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as scheduler from "scheduler";

jest.mock("scheduler", () => require("scheduler/unstable_mock"));

describe("single-spa-react", () => {
  let rootComponent, props;

  beforeAll(() => {
    jest.spyOn(ReactDOM, "render");
    jest.spyOn(ReactDOM, "hydrate");
    jest.spyOn(ReactDOM, "createRoot");
    jest.spyOn(ReactDOM, "unmountComponentAtNode");
    jest.spyOn(console, "warn");

    // Mock all the variations of createRoot that arer not on the installed version of react-dom
    ReactDOM.unstable_createRoot = jest.fn().mockImplementation(function () {
      return ReactDOM.createRoot.apply(this, arguments);
    });

    ReactDOM.createBlockingRoot = jest.fn().mockImplementation(function () {
      return ReactDOM.createRoot.apply(this, arguments);
    });

    ReactDOM.unstable_createBlockingRoot = jest
      .fn()
      .mockImplementation(function () {
        return ReactDOM.createRoot.apply(this, arguments);
      });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    rootComponent = function TestRoot(props) {
      React.useEffect(() => {
        props.wasMounted();
        return () => {
          props.wasUnmounted();
        };
      }, [props]);
      return <button>Button {props.name}</button>;
    };

    props = {
      name: "test",
      wasMounted: jest.fn(),
      wasUnmounted: jest.fn(),
    };
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it(`throws an error if you don't pass required opts`, () => {
    expect(() => singleSpaReact()).toThrow();
    expect(() => singleSpaReact({})).toThrow();
    expect(() => singleSpaReact({ ReactDOM, rootComponent })).toThrow();
    expect(() => singleSpaReact({ React, rootComponent })).toThrow();
    expect(() => singleSpaReact({ React, ReactDOM })).toThrow();
  });

  it(`mounts and unmounts a React component, passing through the single-spa props`, async () => {
    props.why = "hello";
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
    });

    let button;

    expect(props.wasMounted).not.toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();
    expect(ReactDOM.render).not.toHaveBeenCalled();

    await lifecycles.bootstrap();
    await lifecycles.mount(props);

    await flushScheduler();

    expect(ReactDOM.render).toHaveBeenCalled();
    expect(props.wasMounted).toHaveBeenCalled();
    const container = document.getElementById("single-spa-application:test");
    expect(container).toBeInTheDocument();
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasUnmounted).not.toHaveBeenCalled();

    expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
    await lifecycles.unmount(props);

    await flushScheduler();

    expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalled();
    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'hydrate'`, async () => {
    props.why = "hello";
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      renderType: "hydrate",
    });

    let button;

    expect(ReactDOM.hydrate).not.toHaveBeenCalled();
    expect(ReactDOM.hydrate).not.toHaveBeenCalled();
    expect(props.wasMounted).not.toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();

    await lifecycles.bootstrap();
    await lifecycles.mount(props);
    await flushScheduler();

    expect(ReactDOM.hydrate).toHaveBeenCalled();
    let container = document.getElementById("single-spa-application:test");
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasMounted).toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();

    await lifecycles.unmount(props);
    await flushScheduler();

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'createRoot'`, async () => {
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      renderType: "createRoot",
    });

    let button;

    await lifecycles.bootstrap();

    const mountPromise = lifecycles.mount(props);

    await flushScheduler();

    await mountPromise;

    let container = document.getElementById("single-spa-application:test");
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasMounted).toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();
    expect(ReactDOM.createRoot).toHaveBeenCalled();

    const unmountPromise = lifecycles.unmount(props);

    await flushScheduler();

    await unmountPromise;

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
    // In React 18, root.unmount() is called instead of unmountComponentAtNode
    expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'unstable_createRoot'`, async () => {
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      renderType: "unstable_createRoot",
    });

    let button;

    await lifecycles.bootstrap();

    const mountPromise = lifecycles.mount(props);

    await flushScheduler();

    await mountPromise;

    let container = document.getElementById("single-spa-application:test");
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasMounted).toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();
    expect(ReactDOM.unstable_createRoot).toHaveBeenCalled();

    const unmountPromise = lifecycles.unmount(props);

    await flushScheduler();

    await unmountPromise;

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
    // In React 18, root.unmount() is called instead of unmountComponentAtNode
    expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'createBlockingRoot'`, async () => {
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      renderType: "createBlockingRoot",
    });

    let button;

    await lifecycles.bootstrap();

    const mountPromise = lifecycles.mount(props);

    await flushScheduler();

    await mountPromise;

    let container = document.getElementById("single-spa-application:test");
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasMounted).toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();
    expect(ReactDOM.createBlockingRoot).toHaveBeenCalled();

    const unmountPromise = lifecycles.unmount(props);

    await flushScheduler();

    await unmountPromise;

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
    // In React 18, root.unmount() is called instead of unmountComponentAtNode
    expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'unstable_createBlockingRoot'`, async () => {
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      renderType: "unstable_createBlockingRoot",
    });

    let button;

    await lifecycles.bootstrap();

    const mountPromise = lifecycles.mount(props);

    await flushScheduler();

    await mountPromise;

    let container = document.getElementById("single-spa-application:test");
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasMounted).toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();
    expect(ReactDOM.unstable_createBlockingRoot).toHaveBeenCalled();
    expect(ReactDOM.createBlockingRoot).not.toHaveBeenCalled();

    const unmountPromise = lifecycles.unmount(props);

    await flushScheduler();

    await unmountPromise;

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
    // In React 18, root.unmount() is called instead of unmountComponentAtNode
    expect(ReactDOM.unmountComponentAtNode).not.toHaveBeenCalled();
  });

  it(`chooses the parcel dom element over other dom element getters`, async () => {
    const optsDomElementGetter = () => "optsDomElementGetter";
    let opts = {
      React,
      ReactDOM,
      rootComponent,
      domElementGetter: optsDomElementGetter,
    };
    let propsDomEl = document.createElement("div");
    let propsDomElGetter = document.createElement("div");
    let propsDomElementGetter = () => propsDomElGetter;
    props.domElement = propsDomEl;
    props.domElementGetter = propsDomElementGetter;

    const lifecycles = singleSpaReact(opts);

    let button;

    await lifecycles.bootstrap(props);
    await lifecycles.mount(props);
    button = propsDomEl.querySelector("button");
    expect(button).toBeTruthy();
    expect(button.textContent).toEqual("Button test");

    await lifecycles.unmount(props);
    button = propsDomEl.querySelector("button");
    expect(button).toBeFalsy();
  });

  it(`correctly handles two parcels using the same configuration`, async () => {
    let opts = { React, ReactDOM, rootComponent };

    let props1 = { ...props, domElement: document.createElement("div") };
    let props2 = { ...props, domElement: document.createElement("div") };
    const lifecycles = singleSpaReact(opts);

    await lifecycles.bootstrap(props);

    await lifecycles.mount(props1);

    expect(props1.domElement.querySelector("button") instanceof Node).toBe(
      true
    );
    expect(props2.domElement.querySelector("button") instanceof Node).toBe(
      false
    );

    await lifecycles.unmount(props1);

    expect(props1.domElement.querySelector("button") instanceof Node).toBe(
      false
    );
    expect(props2.domElement.querySelector("button") instanceof Node).toBe(
      false
    );

    // simulate another parcel using the same configuration
    await lifecycles.bootstrap();
    await lifecycles.mount(props2);

    expect(props1.domElement.querySelector("button") instanceof Node).toBe(
      false
    );
    expect(props2.domElement.querySelector("button") instanceof Node).toBe(
      true
    );

    await lifecycles.unmount(props2);

    expect(props1.domElement.querySelector("button") instanceof Node).toBe(
      false
    );
    expect(props2.domElement.querySelector("button") instanceof Node).toBe(
      false
    );
  });

  it(`allows you to provide a domElementGetter as an opt`, async () => {
    let domEl = document.createElement("div");

    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter() {
        return domEl;
      },
    });

    await lifecycles.bootstrap(props);

    expect(domEl.querySelector("button") instanceof Node).toBe(false);

    await lifecycles.mount(props);

    expect(domEl.querySelector("button") instanceof Node).toBe(true);

    await lifecycles.unmount(props);

    expect(domEl.querySelector("button") instanceof Node).toBe(false);
  });

  it(`allows you to provide a domElementGetter as a prop`, async () => {
    let domEl = document.createElement("div");
    props.domElementGetter = () => domEl;

    const lifecycles = singleSpaReact({ React, ReactDOM, rootComponent });

    await lifecycles.bootstrap(props);
    expect(domEl.querySelector("button") instanceof Node).toBe(false);

    await lifecycles.mount(props);
    expect(domEl.querySelector("button") instanceof Node).toBe(true);

    await lifecycles.unmount(props);
    expect(domEl.querySelector("button") instanceof Node).toBe(false);
  });

  it(`doesn't throw an error if unmount is not called with a dom element or dom element getter`, async () => {
    const opts = { React, ReactDOM, rootComponent };
    const domEl = document.createElement("div");
    props.domElementGetter = jest.fn().mockImplementation(() => domEl);

    const lifecycles = singleSpaReact(opts);

    await lifecycles.bootstrap(props);

    await lifecycles.mount(props);
    expect(props.domElementGetter).toHaveBeenCalledTimes(1);
    // The domElementGetter should no longer be required after mount is finished
    delete props.domElementGetter;

    // Shouldn't throw even though domElementGetter is gone
    await lifecycles.unmount(props);
  });

  it(`warns if you are using react >=16 but don't implement componentDidCatch`, async () => {
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
    });

    await lifecycles.bootstrap(props);
    expect(console.warn).not.toHaveBeenCalled();

    await lifecycles.mount(props);
    expect(console.warn).toHaveBeenCalled();

    await lifecycles.unmount(props);
  });

  it(`does not warn if you are using react 15 but don't implement componentDidCatch`, async () => {
    const originalVersion = React.version;

    React.version = "15.4.1";
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
    });

    await lifecycles.bootstrap(props);
    expect(console.warn).not.toHaveBeenCalled();

    await lifecycles.mount(props);
    expect(console.warn).not.toHaveBeenCalled();

    await lifecycles.unmount(props);

    React.version = originalVersion;
  });

  // https://github.com/single-spa/single-spa/issues/604
  it(`does not throw an error if a customProps prop is provided`, async () => {
    const parcelConfig = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
    });
    const normalProps = { ...props, foo: "bar", name: "app1" };
    await parcelConfig.bootstrap(normalProps);
    await parcelConfig.mount(normalProps);
    await parcelConfig.unmount(normalProps);

    const unusualProps = {
      ...props,
      name: "app2",
      customProps: { foo: "bar" },
    };
    await parcelConfig.bootstrap(unusualProps);
    await parcelConfig.mount(unusualProps);
    await parcelConfig.unmount(unusualProps);
  });

  describe("error boundaries", () => {
    it(`should not log a warning when root component has componentDidCatch`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: class RootComponent extends React.Component {
          componentDidCatch() {}
          render() {
            return <button></button>;
          }
        },
      });

      await lifecycles.bootstrap(props);
      await lifecycles.mount(props);
      await lifecycles.unmount(props);
    });

    it(`should log a warning when rootComponent is class without componentDidCatch`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: class RootComponent extends React.Component {
          render() {
            return <button></button>;
          }
        },
      });

      expect(console.warn).not.toHaveBeenCalled();
      await lifecycles.bootstrap(props);
      expect(console.warn).not.toHaveBeenCalled();

      await lifecycles.mount(props);
      expect(console.warn).toHaveBeenCalled();

      await lifecycles.unmount(props);
      expect(console.warn).toHaveBeenCalled();
    });

    it(`should log a warning with function component`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: function foo() {
          return <button>Hello</button>;
        },
      });

      await lifecycles.bootstrap(props);
      expect(console.warn).not.toHaveBeenCalled();

      await lifecycles.mount(props);
      expect(console.warn).toHaveBeenCalled();

      await lifecycles.unmount(props);
      expect(console.warn).toHaveBeenCalled();
    });

    it(`should not log a warning when errorBoundary opts is passed in`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: function foo() {
          return <button>Test</button>;
        },
        errorBoundary() {
          return null;
        },
      });

      await lifecycles.bootstrap(props);
      expect(console.warn).not.toHaveBeenCalled();

      await lifecycles.mount(props);
      expect(console.warn).not.toHaveBeenCalled();

      await lifecycles.unmount(props);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it(`should call opts.errorBoundary during an error boundary handler`, async () => {
      const opts = {
        React,
        ReactDOM,
        rootComponent: function Foo() {
          const [shouldThrow, setShouldThrow] = React.useState(false);

          if (shouldThrow) {
            throw Error("Triggering errorr boundary");
          }

          return <button onClick={handleClick}>Test</button>;

          function handleClick() {
            setShouldThrow(true);
          }
        },
        errorBoundary: jest.fn().mockReturnValue(<p>An error occurred</p>),
      };

      const lifecycles = singleSpaReact(opts);

      await lifecycles.bootstrap(props);

      await lifecycles.mount(props);

      const container = document.getElementById("single-spa-application:test");

      expect(container.querySelector("button") instanceof Node).toBe(true);
      expect(container.querySelector("p") instanceof Node).toBe(false);

      document
        .getElementById("single-spa-application:test")
        .querySelector("button")
        .click();

      await flushScheduler();

      expect(container.querySelector("button") instanceof Node).toBe(false);
      expect(container.querySelector("p") instanceof Node).toBe(true);

      await lifecycles.unmount(props);
    });
  });

  describe(`domElementGetter`, () => {
    it(`provides a default implementation of domElementGetter if you don't provide one`, async () => {
      props.name = "k_ruel";
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent,
        // No domElementGetter
      });

      await lifecycles.bootstrap(props);
      await lifecycles.mount(props);
      expect(
        document.getElementById("single-spa-application:k_ruel")
      ).toBeInTheDocument();
      await lifecycles.unmount(props);
    });

    it(`passes props to the domElementGetter`, async () => {
      const opts = {
        React,
        ReactDOM,
        rootComponent,
        domElementGetter: jest.fn(),
      };
      const lifecycles = singleSpaReact(opts);

      opts.domElementGetter.mockReturnValue(document.createElement("div"));

      await lifecycles.bootstrap(props);
      await lifecycles.mount(props);
      expect(opts.domElementGetter).toHaveBeenCalledWith(props);
      await lifecycles.unmount(props);
    });
  });
});

function flushScheduler() {
  return Promise.resolve().then(() => {
    scheduler.unstable_flushAll();
  });
}
