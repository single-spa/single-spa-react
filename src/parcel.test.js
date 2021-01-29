import React from "react";
import ReactDOM from "react-dom";
import Parcel from "./parcel.js";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import singleSpaReact from "./single-spa-react";

document.body.appendChild = jest.fn();

describe(`<Parcel />`, () => {
  let config,
    mountParcel = jest.fn(),
    parcel,
    props;

  beforeAll(() => {
    singleSpaReact({ React, ReactDOM, rootComponent: () => {} });
  });

  beforeEach(() => {
    config = {
      bootstrap: jest.fn(),
      mount: jest.fn(),
      unmount: jest.fn(),
    };

    parcel = {
      loadPromise: jest.fn(),
      bootstrapPromise: jest.fn(),
      mountPromise: Promise.resolve(),
      unmountPromise: jest.fn(),
      getStatus: jest.fn(),
      unmount: jest.fn(),
      update: jest.fn(),
    };

    mountParcel.mockReset();
    mountParcel.mockReturnValue(parcel);

    document.body.appendChild.mockReset();

    props = { mountParcel, config };
  });

  it(`throws an error if you try to render the component without a config`, () => {
    expect(() => {
      shallow(<Parcel />);
    }).toThrow();
  });

  it(`renders a div by default`, () => {
    const wrapper = render(<Parcel {...props} />);
    expect(wrapper.find("div").length).toBe(1);
  });

  it(`renders a div wrap with style`, () => {
    const wrapper = render(
      <Parcel {...props} wrapStyle={{ height: "100px" }} />
    );
    expect(
      /style\=\"height\:\s{1}100px;\"/.test(wrapper.find("div").html())
    ).toBe(true);
  });

  it(`renders a diw wrap with className`, () => {
    const wrapper = render(<Parcel {...props} wrapClassName="wrapper" />);
    expect(wrapper.find("div").hasClass("wrapper")).toBe(true);
  });

  it(`calls the mountParcel prop when it mounts`, () => {
    const wrapper = render(<Parcel {...props} />);
    return wrapper.instance().nextThingToDo.then(() => {
      expect(mountParcel).toHaveBeenCalled();
    });
  });

  it(`renders nothing if you pass in the appendTo prop`, () => {
    const wrapper = render(<Parcel {...props} appendTo={document.body} />);
    return wrapper.instance().nextThingToDo.then(() => {
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  it(`calls parcelDidMount prop when the parcel finishes mounting`, () => {
    const parcelDidMount = jest.fn();
    const wrapper = render(
      <Parcel {...props} parcelDidMount={parcelDidMount} />
    );

    expect(parcelDidMount).not.toHaveBeenCalled();

    return wrapper.instance().nextThingToDo.then(() => {
      expect(parcelDidMount).toHaveBeenCalled();
    });
  });

  it(`doesn't update the parcel a second or third time until previous parcel updates complete`, (done) => {
    const wrapper = render(<Parcel {...props} />);
    const inst = wrapper.instance();

    let numParcelUpdateCalls = 0;
    let firstParcelUpdateFinished = false;
    let secondParcelUpdateFinished = false;

    parcel.update.mockImplementation(() => {
      switch (++numParcelUpdateCalls) {
        case 1:
          return firstParcelUpdate();
        case 2:
          return secondParcelUpdate();
        case 3:
          return thirdParcelUpdate();
        default:
          fail("Parcel update should only be called thrice");
          break;
      }
    });

    function firstParcelUpdate() {
      return new Promise((resolve) => {
        /* Don't resolve this promise for a while to make sure that the second update
         * Doesn't start until the first finishes
         */
        setTimeout(() => {
          firstParcelUpdateFinished = true;
          resolve();
        }, 100);
      });
    }

    function secondParcelUpdate() {
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(firstParcelUpdateFinished).toBe(true);
          secondParcelUpdateFinished = true;
          resolve();
        }, 100);
      });
    }

    function thirdParcelUpdate() {
      return Promise.resolve().then(() => {
        expect(firstParcelUpdateFinished).toBe(true);
        expect(secondParcelUpdateFinished).toBe(true);
        done();
      });
    }

    function triggerComponentDidUpdate() {
      wrapper.setProps(props);
    }

    // not once
    triggerComponentDidUpdate();

    // not twice
    triggerComponentDidUpdate();

    // but thrice!
    triggerComponentDidUpdate();
  });

  it(`calls mountParcel with the all the React props`, () => {
    const wrapper = render(<Parcel {...props} />);
    // We need to wait for a microtask to finish before the Parcel component will have called mountParcel
    return Promise.resolve().then(() => {
      expect(mountParcel).toHaveBeenCalled();
      const parcelProps = mountParcel.mock.calls[0][1];
      expect(parcelProps.domElement).toBeInstanceOf(HTMLDivElement);
    });
  });

  it(`lets you not pass in a mountParcel prop if the SingleSpaContext is set with one`, () => {
    // this creates the SingleSpaContext
    const appLifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent() {
        return null;
      },
    });

    const wrapper = render(
      <SingleSpaContext.Provider value={mountParcel}>
        <Parcel config={config} />
      </SingleSpaContext.Provider>
    );

    return wrapper.instance().nextThingToDo.then(() => {
      expect(mountParcel).toHaveBeenCalled();
    });
  });
});
