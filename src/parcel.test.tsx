// @ts-nocheck

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client"; // React >= 18
import Parcel from "./Parcel";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import singleSpaReact, { SingleSpaContext } from "./single-spa-react";
import { jest } from "@jest/globals";

describe(`<Parcel />`, () => {
  let config,
    mountParcel = jest.fn(),
    parcel,
    props;

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

    props = { mountParcel, config };
    jest.spyOn(console, "error").mockReturnValue(undefined);
  });

  it(`throws an error if you try to render the component without a config`, () => {
    expect(() => {
      render(<Parcel />);
    }).toThrow();
  });

  it(`renders a div by default`, () => {
    expect(document.querySelector("div")).not.toBeInTheDocument();
    const wrapper = render(<Parcel {...props} />);
    expect(document.querySelector("div")).toBeInTheDocument();
  });

  it(`renders a div wrap with style`, () => {
    const wrapper = render(
      <Parcel {...props} wrapStyle={{ height: "100px" }} />
    );
    expect(document.querySelector(`div[style]`).style.height).toEqual("100px");
  });

  it(`renders a div wrap with className`, () => {
    const wrapper = render(<Parcel {...props} wrapClassName="wrapper" />);
    expect(document.querySelector("div.wrapper")).toBeInTheDocument();
  });

  it(`calls the mountParcel prop when it mounts`, async () => {
    const wrapper = render(<Parcel {...props} />);
    await waitFor(() => expect(mountParcel).toHaveBeenCalled());
  });

  it(`renders inside the append to`, async () => {
    const appendTo = document.body.appendChild(
      document.createElement("section")
    );
    expect(document.querySelector("section div")).not.toBeInTheDocument();
    const wrapper = render(<Parcel {...props} appendTo={appendTo} />);
    await waitFor(() =>
      expect(document.querySelector("section div")).toBeInTheDocument()
    );
  });

  it(`calls parcelDidMount prop when the parcel finishes mounting`, async () => {
    const parcelDidMount = jest.fn();
    const wrapper = render(
      <Parcel {...props} parcelDidMount={parcelDidMount} />
    );

    expect(parcelDidMount).not.toHaveBeenCalled();

    await waitFor(() => expect(parcelDidMount).toHaveBeenCalled());
  });

  it(`doesn't update the parcel a second or third time until previous parcel updates complete`, (done) => {
    const wrapper = render(<Parcel {...props} />);

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
      wrapper.rerender(<Parcel {...props} />);
    }

    // not once
    triggerComponentDidUpdate();

    // not twice
    triggerComponentDidUpdate();

    // but thrice!
    triggerComponentDidUpdate();
  });

  it(`calls mountParcel with all the React props`, async () => {
    const wrapper = render(<Parcel {...props} />);
    // We need to wait for a microtask to finish before the Parcel component will have called mountParcel
    await waitFor(() => expect(mountParcel).toHaveBeenCalled());
    const parcelProps = mountParcel.mock.calls[0][1];
    expect(parcelProps.domElement).toBeInstanceOf(HTMLDivElement);
  });

  it(`lets you not pass in a mountParcel prop if the SingleSpaContext is set with one (React <18)`, async () => {
    // this creates the SingleSpaContext
    singleSpaReact({
      React,
      ReactDOM,
      rootComponent() {
        return null;
      },
    });

    render(
      <SingleSpaContext.Provider value={{ mountParcel }}>
        <Parcel config={config} />
      </SingleSpaContext.Provider>
    );

    await waitFor(() => expect(mountParcel).toHaveBeenCalled());
  });

  it(`lets you not pass in a mountParcel prop if the SingleSpaContext is set with one (React >=18)`, async () => {
    // this creates the SingleSpaContext
    singleSpaReact({
      React,
      ReactDOMClient,
      rootComponent() {
        return null;
      },
    });

    const wrapper = render(
      <SingleSpaContext.Provider value={{ mountParcel }}>
        <Parcel config={config} />
      </SingleSpaContext.Provider>
    );

    await waitFor(() => expect(mountParcel).toHaveBeenCalled());
  });
});
