require("@testing-library/jest-dom/extend-expect");
const { useEffect } = require("react");
const React = require("react");
const ReactDOMClient = require("react-dom/client");
const { act } = require("react-dom/test-utils");

describe("single-spa-react", () => {
  let rootComponent, props, singleSpaReact;

  beforeAll(async () => {
    singleSpaReact = (await import("./single-spa-react.js")).default;
    jest.spyOn(ReactDOMClient, "createRoot");
    jest.spyOn(ReactDOMClient, "hydrateRoot");
    jest.spyOn(console, "warn");
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
    expect(() => singleSpaReact({ ReactDOMClient, rootComponent })).toThrow();
    expect(() => singleSpaReact({ React, rootComponent })).toThrow();
    expect(() => singleSpaReact({ React, ReactDOMClient })).toThrow();
  });

  it(`mounts and unmounts a React component, passing through the single-spa props`, async () => {
    props.why = "hello";
    const lifecycles = singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent,
    });

    let button;

    expect(props.wasMounted).not.toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();

    await lifecycles.bootstrap();
    await act(async () => {
      lifecycles.mount(props);
    });

    expect(props.wasMounted).toHaveBeenCalled();
    const container = document.getElementById(`single-spa-application:test`);
    expect(container).toBeInTheDocument();
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasUnmounted).not.toHaveBeenCalled();

    await act(async () => {
      lifecycles.unmount(props);
    });

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'hydrateRoot'`, async () => {
    props.why = "hello";
    const lifecycles = singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent,
      renderType: "hydrateRoot",
    });

    let button;

    expect(ReactDOMClient.hydrateRoot).not.toHaveBeenCalled();
    expect(props.wasMounted).not.toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();

    await lifecycles.bootstrap();
    await act(async () => {
      lifecycles.mount(props);
    });

    expect(ReactDOMClient.hydrateRoot).toHaveBeenCalled();
    let container = document.getElementById("single-spa-application:test");
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasMounted).toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();

    await act(async () => {
      lifecycles.unmount(props);
    });

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'createRoot'`, async () => {
    const lifecycles = singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent,
      renderType: "createRoot",
    });

    let button;

    await lifecycles.bootstrap();

    await act(async () => {
      lifecycles.mount(props);
    });

    let container = document.getElementById("single-spa-application:test");
    button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toEqual("Button test");
    expect(props.wasMounted).toHaveBeenCalled();
    expect(props.wasUnmounted).not.toHaveBeenCalled();
    expect(ReactDOMClient.createRoot).toHaveBeenCalled();

    await act(async () => {
      lifecycles.unmount(props);
    });

    expect(props.wasUnmounted).toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
  });

  it(`chooses the parcel dom element over other dom element getters`, async () => {
    const optsDomElementGetter = () => "optsDomElementGetter";
    let opts = {
      React,
      ReactDOMClient,
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
    await act(async () => {
      lifecycles.mount(props);
    });
    button = propsDomEl.querySelector("button");
    expect(button).toBeTruthy();
    expect(button.textContent).toEqual("Button test");

    await act(async () => {
      lifecycles.unmount(props);
    });
    button = propsDomEl.querySelector("button");
    expect(button).toBeFalsy();
  });

  it(`correctly handles two parcels using the same configuration`, async () => {
    let opts = { React, ReactDOMClient, rootComponent };

    let props1 = { ...props, domElement: document.createElement("div") };
    let props2 = { ...props, domElement: document.createElement("div") };
    const lifecycles = singleSpaReact(opts);

    await lifecycles.bootstrap(props);

    await act(async () => {
      lifecycles.mount(props1);
    });

    expect(props1.domElement.querySelector("button") instanceof Node).toBe(
      true
    );
    expect(props2.domElement.querySelector("button") instanceof Node).toBe(
      false
    );

    await act(async () => {
      lifecycles.unmount(props1);
    });

    expect(props1.domElement.querySelector("button") instanceof Node).toBe(
      false
    );
    expect(props2.domElement.querySelector("button") instanceof Node).toBe(
      false
    );

    // simulate another parcel using the same configuration
    await lifecycles.bootstrap();
    await act(async () => {
      lifecycles.mount(props2);
    });

    expect(props1.domElement.querySelector("button") instanceof Node).toBe(
      false
    );
    expect(props2.domElement.querySelector("button") instanceof Node).toBe(
      true
    );

    await act(async () => {
      lifecycles.unmount(props2);
    });

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
      ReactDOMClient,
      rootComponent,
      domElementGetter() {
        return domEl;
      },
    });

    await lifecycles.bootstrap(props);

    expect(domEl.querySelector("button") instanceof Node).toBe(false);

    await act(async () => {
      lifecycles.mount(props);
    });

    expect(domEl.querySelector("button") instanceof Node).toBe(true);

    await act(async () => {
      lifecycles.unmount(props);
    });

    expect(domEl.querySelector("button") instanceof Node).toBe(false);
  });

  it(`allows you to provide a domElementGetter as a prop`, async () => {
    let domEl = document.createElement("div");
    props.domElementGetter = () => domEl;

    const lifecycles = singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent,
    });

    await lifecycles.bootstrap(props);
    expect(domEl.querySelector("button") instanceof Node).toBe(false);

    await act(async () => {
      lifecycles.mount(props);
    });
    expect(domEl.querySelector("button") instanceof Node).toBe(true);

    await act(async () => {
      lifecycles.unmount(props);
    });
    expect(domEl.querySelector("button") instanceof Node).toBe(false);
  });

  it(`doesn't throw an error if unmount is not called with a dom element or dom element getter`, async () => {
    const opts = { React, ReactDOMClient, rootComponent };
    const domEl = document.createElement("div");
    props.domElementGetter = jest.fn().mockImplementation(() => domEl);

    const lifecycles = singleSpaReact(opts);

    await lifecycles.bootstrap(props);

    await act(async () => {
      lifecycles.mount(props);
    });
    expect(props.domElementGetter).toHaveBeenCalledTimes(1);
    // The domElementGetter should no longer be required after mount is finished
    delete props.domElementGetter;

    // Shouldn't throw even though domElementGetter is gone
    await act(async () => {
      lifecycles.unmount(props);
    });
  });

  it(`warns if you are using react >=16 but don't implement componentDidCatch`, async () => {
    const lifecycles = singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent,
    });

    await lifecycles.bootstrap(props);
    expect(console.warn).not.toHaveBeenCalled();

    await act(async () => {
      lifecycles.mount(props);
    });
    expect(console.warn).toHaveBeenCalled();

    await act(async () => {
      lifecycles.unmount(props);
    });
  });

  it(`does not warn if you are using react 15 but don't implement componentDidCatch`, async () => {
    const originalVersion = React.version;

    React.version = "15.4.1";
    const lifecycles = singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent,
    });

    await lifecycles.bootstrap(props);
    expect(console.warn).not.toHaveBeenCalled();

    await act(async () => {
      lifecycles.mount(props);
    });
    expect(console.warn).not.toHaveBeenCalled();

    await act(async () => {
      lifecycles.unmount(props);
    });

    React.version = originalVersion;
  });

  // https://github.com/single-spa/single-spa/issues/604
  it(`does not throw an error if a customProps prop is provided`, async () => {
    const parcelConfig = singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent,
    });
    const normalProps = { ...props, foo: "bar", name: "app1" };
    await parcelConfig.bootstrap(normalProps);
    await act(async () => {
      parcelConfig.mount(normalProps);
    });
    await act(async () => {
      parcelConfig.unmount(normalProps);
    });

    const unusualProps = {
      ...props,
      name: "app2",
      customProps: { foo: "bar" },
    };
    await parcelConfig.bootstrap(unusualProps);
    await act(async () => {
      parcelConfig.mount(unusualProps);
    });
    await act(async () => {
      parcelConfig.unmount(unusualProps);
    });
  });

  describe("error boundaries", () => {
    it(`should not log a warning when root component has componentDidCatch`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOMClient,
        rootComponent: class RootComponent extends React.Component {
          componentDidCatch() {}
          render() {
            return <button></button>;
          }
        },
      });

      await lifecycles.bootstrap(props);
      await act(async () => {
        lifecycles.mount(props);
      });
      await act(async () => {
        lifecycles.unmount(props);
      });
    });

    it(`should log a warning when rootComponent is class without componentDidCatch`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOMClient,
        rootComponent: class RootComponent extends React.Component {
          render() {
            return <button></button>;
          }
        },
      });

      expect(console.warn).not.toHaveBeenCalled();
      await lifecycles.bootstrap(props);
      expect(console.warn).not.toHaveBeenCalled();

      await act(async () => {
        lifecycles.mount(props);
      });
      expect(console.warn).toHaveBeenCalled();

      await act(async () => {
        lifecycles.unmount(props);
      });
      expect(console.warn).toHaveBeenCalled();
    });

    it(`should log a warning with function component`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOMClient,
        rootComponent: function foo() {
          return <button>Hello</button>;
        },
      });

      await lifecycles.bootstrap(props);
      expect(console.warn).not.toHaveBeenCalled();

      await act(async () => {
        lifecycles.mount(props);
      });
      expect(console.warn).toHaveBeenCalled();

      await act(async () => {
        lifecycles.unmount(props);
      });
      expect(console.warn).toHaveBeenCalled();
    });

    it(`should not log a warning when errorBoundary opts is passed in`, async () => {
      const lifecycles = singleSpaReact({
        React,
        ReactDOMClient,
        rootComponent: function foo() {
          return <button>Test</button>;
        },
        errorBoundary() {
          return null;
        },
      });

      await lifecycles.bootstrap(props);
      expect(console.warn).not.toHaveBeenCalled();

      await act(async () => {
        lifecycles.mount(props);
      });
      expect(console.warn).not.toHaveBeenCalled();

      await act(async () => {
        lifecycles.unmount(props);
      });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it(`should call opts.errorBoundary during an error boundary handler`, async () => {
      const opts = {
        React,
        ReactDOMClient,
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

      await act(async () => {
        lifecycles.mount(props);
      });

      const container = document.getElementById("single-spa-application:test");

      expect(container.querySelector("button") instanceof Node).toBe(true);
      expect(container.querySelector("p") instanceof Node).toBe(false);

      act(() => {
        document
          .getElementById("single-spa-application:test")
          .querySelector("button")
          .click();
      });

      expect(container.querySelector("button") instanceof Node).toBe(false);
      expect(container.querySelector("p") instanceof Node).toBe(true);

      await act(async () => {
        lifecycles.unmount(props);
      });
    });

    // https://github.com/single-spa/single-spa-react/issues/119
    it(`allows errorBoundary to be passed in as a prop`, async () => {
      const opts = {
        React,
        ReactDOMClient,
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
      };

      props.errorBoundary = jest.fn().mockReturnValue(<p>An error occurred</p>);

      const lifecycles = singleSpaReact(opts);

      await lifecycles.bootstrap(props);

      await act(async () => {
        lifecycles.mount(props);
      });

      const container = document.getElementById("single-spa-application:test");

      expect(container.querySelector("button") instanceof Node).toBe(true);
      expect(container.querySelector("p") instanceof Node).toBe(false);

      act(() => {
        document
          .getElementById("single-spa-application:test")
          .querySelector("button")
          .click();
      });

      expect(container.querySelector("button") instanceof Node).toBe(false);
      expect(container.querySelector("p") instanceof Node).toBe(true);

      await act(async () => {
        lifecycles.unmount(props);
      });
    });

    it(`allows errorBoundaryClass to be passed in as an opt`, async () => {
      class ErrorBoundary extends React.Component {
        state = {
          error: false,
        };
        render() {
          if (this.state.error) {
            return <p>An error occurred</p>;
          } else {
            return this.props.children;
          }
        }
        componentDidCatch() {
          this.setState({
            error: true,
          });
        }
      }

      const opts = {
        React,
        ReactDOMClient,
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
      };

      props.errorBoundaryClass = ErrorBoundary;

      const lifecycles = singleSpaReact(opts);

      await lifecycles.bootstrap(props);

      await act(async () => {
        lifecycles.mount(props);
      });

      const container = document.getElementById("single-spa-application:test");

      expect(container.querySelector("button") instanceof Node).toBe(true);
      expect(container.querySelector("p") instanceof Node).toBe(false);

      act(() => {
        document
          .getElementById("single-spa-application:test")
          .querySelector("button")
          .click();
      });

      expect(container.querySelector("button") instanceof Node).toBe(false);
      expect(container.querySelector("p") instanceof Node).toBe(true);

      await act(async () => {
        lifecycles.unmount(props);
      });
    });

    it(`allows errorBoundaryClass to be passed in as a prop`, async () => {
      class ErrorBoundary extends React.Component {
        state = {
          error: false,
        };
        render() {
          if (this.state.error) {
            return <p>An error occurred</p>;
          } else {
            return this.props.children;
          }
        }
        componentDidCatch() {
          this.setState({
            error: true,
          });
        }
      }

      const opts = {
        React,
        ReactDOMClient,
        rootComponent: function Foo() {
          const [shouldThrow, setShouldThrow] = React.useState(false);

          if (shouldThrow) {
            throw Error("Triggering error boundary");
          }

          return <button onClick={handleClick}>Test</button>;

          function handleClick() {
            setShouldThrow(true);
          }
        },
        errorBoundaryClass: ErrorBoundary,
      };

      const lifecycles = singleSpaReact(opts);

      await lifecycles.bootstrap(props);

      await act(async () => {
        lifecycles.mount(props);
      });

      const container = document.getElementById("single-spa-application:test");

      expect(container.querySelector("button") instanceof Node).toBe(true);
      expect(container.querySelector("p") instanceof Node).toBe(false);

      act(() => {
        document
          .getElementById("single-spa-application:test")
          .querySelector("button")
          .click();
      });

      expect(container.querySelector("button") instanceof Node).toBe(false);
      expect(container.querySelector("p") instanceof Node).toBe(true);

      await act(async () => {
        lifecycles.unmount(props);
      });
    });
  });

  describe(`domElementGetter`, () => {
    it(`provides a default implementation of domElementGetter if you don't provide one`, async () => {
      props.name = "k_ruel";
      const lifecycles = singleSpaReact({
        React,
        ReactDOMClient,
        rootComponent,
        // No domElementGetter
      });

      await lifecycles.bootstrap(props);
      await act(async () => {
        lifecycles.mount(props);
      });

      expect(
        document.getElementById("single-spa-application:k_ruel")
      ).toBeInTheDocument();
      await act(async () => {
        lifecycles.unmount(props);
      });
    });

    it(`passes props to the domElementGetter`, async () => {
      const opts = {
        React,
        ReactDOMClient,
        rootComponent,
        domElementGetter: jest.fn(),
      };
      const lifecycles = singleSpaReact(opts);

      opts.domElementGetter.mockReturnValue(document.createElement("div"));

      await lifecycles.bootstrap(props);
      await act(async () => {
        lifecycles.mount(props);
      });
      expect(opts.domElementGetter).toHaveBeenCalledWith(props);
      await act(async () => {
        lifecycles.unmount(props);
      });
    });
  });

  describe(`update lifecycle`, () => {
    // https://github.com/single-spa/single-spa-react/issues/117
    it("ReactDOMClient.createRoot", async () => {
      const opts = {
        React,
        ReactDOMClient,
        rootComponent,
      };
      const lifecycles = singleSpaReact(opts);

      await lifecycles.bootstrap(props);
      await act(async () => {
        lifecycles.mount(props);
      });
      await act(async () => {
        lifecycles.update(props);
      });
      await act(async () => {
        lifecycles.unmount(props);
      });
    });

    it("Does not unmount/remount the React component during updates", async () => {
      let rootComponentUnmounted = false;

      const opts = {
        React,
        ReactDOMClient,
        rootComponent: function (props) {
          useEffect(() => {
            return () => {
              rootComponentUnmounted = true;
            };
          }, []);

          return <div>hello</div>;
        },
        renderType: "createRoot",
        suppressComponentDidCatchWarning: true,
      };
      const lifecycles = singleSpaReact(opts);
      await lifecycles.bootstrap(props);

      await act(async () => {
        lifecycles.mount(props);
      });

      expect(rootComponentUnmounted).toBe(false);

      await act(async () => {
        lifecycles.update(props);
      });

      expect(rootComponentUnmounted).toBe(false);

      await act(async () => {
        lifecycles.unmount(props);
      });
    });
  });

  describe(`renderType as function`, () => {
    it(`mounts and unmounts a React component with a 'renderType' function that initially evaluates to 'hydrateRoot' and then 'createRoot'`, async () => {
      const opts = {
        React,
        ReactDOMClient,
        rootComponent,
        renderType: jest.fn(),
      };
      opts.renderType.mockReturnValueOnce("hydrateRoot");
      const lifecycles = singleSpaReact(opts);

      expect(ReactDOMClient.hydrateRoot).not.toHaveBeenCalled();
      expect(props.wasMounted).not.toHaveBeenCalled();
      expect(props.wasUnmounted).not.toHaveBeenCalled();
      expect(opts.renderType).not.toHaveBeenCalled();

      await lifecycles.bootstrap();
      await act(async () => {
        lifecycles.mount(props);
      });

      expect(ReactDOMClient.hydrateRoot).toHaveBeenCalled();
      expect(opts.renderType).toHaveBeenCalled();
      expect(opts.renderType).toHaveReturnedWith("hydrateRoot");

      await act(async () => {
        lifecycles.unmount(props);
      });

      opts.renderType.mockReturnValueOnce("createRoot");

      expect(ReactDOMClient.hydrateRoot).toHaveBeenCalledTimes(1);
      expect(opts.renderType).toHaveBeenCalledTimes(1);

      await lifecycles.bootstrap();
      await act(async () => {
        lifecycles.mount(props);
      });

      expect(opts.renderType).toHaveBeenCalled();
      expect(opts.renderType).toHaveReturnedWith("createRoot");

      await act(async () => {
        lifecycles.unmount(props);
      });
    });
  });
});
