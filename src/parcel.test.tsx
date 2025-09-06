import { createElement, useEffect } from "react";
import Parcel from "./parcel";
import singleSpaReact from "./single-spa-react";
import { mountRootParcel, AppOrParcelStatus } from "single-spa";
import { render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";

test(`render a parcel with mountRootParcel`, async () => {
  let mountResolve;
  const mountPromise = new Promise((resolve) => {
    mountResolve = resolve;
  });

  let mountedParcel;

  const mountParcel = (...args) => {
    mountedParcel = mountRootParcel(...args);
    return mountedParcel;
  };

  function Parent(props) {
    return (
      <Parcel
        config={props.parcelConfig}
        mountParcel={mountParcel}
        parcelDidMount={mountResolve}
      />
    );
  }

  const parcelConfig = singleSpaReact({
    createRoot,
    createElement,
    useEffect,
    renderReactNode() {
      return <div>Parcel content</div>;
    },
  });

  const { unmount } = render(<Parent parcelConfig={parcelConfig} />);

  await mountPromise;

  expect(mountedParcel.getStatus()).toBe(AppOrParcelStatus.MOUNTED);

  expect(await screen.findByText("Parcel content")).toBeDefined();

  unmount();

  expect(await screen.queryByText("Parcel content")).toBe(null);

  await mountedParcel.unmountPromise;

  expect(mountedParcel.getStatus()).toBe(AppOrParcelStatus.NOT_MOUNTED);
});

test(`render a parcel with config loading function`, async () => {
  let mountResolve;
  const mountPromise = new Promise((resolve) => {
    mountResolve = resolve;
  });

  let mountedParcel;

  const mountParcel = (...args) => {
    mountedParcel = mountRootParcel(...args);
    return mountedParcel;
  };

  function Parent(props) {
    return (
      <Parcel
        config={async () => props.parcelConfig}
        mountParcel={mountParcel}
        parcelDidMount={mountResolve}
      />
    );
  }

  const parcelConfig = singleSpaReact({
    createRoot,
    createElement,
    useEffect,
    renderReactNode() {
      return <div>Parcel content</div>;
    },
  });

  const { unmount } = render(<Parent parcelConfig={parcelConfig} />);

  await mountPromise;

  expect(mountedParcel.getStatus()).toBe(AppOrParcelStatus.MOUNTED);

  expect(await screen.findByText("Parcel content")).toBeDefined();

  unmount();

  expect(await screen.queryByText("Parcel content")).toBe(null);

  await mountedParcel.unmountPromise;

  expect(mountedParcel.getStatus()).toBe(AppOrParcelStatus.NOT_MOUNTED);
});

test(`throws an error when loading function for config doesn't return a promise`, async () => {
  function Parent(props) {
    return (
      <Parcel config={() => props.parcelConfig} mountParcel={mountRootParcel} />
    );
  }

  const parcelConfig = singleSpaReact({
    createRoot,
    createElement,
    useEffect,
    renderReactNode() {
      return <div>Parcel content</div>;
    },
  });

  expect(() => render(<Parent parcelConfig={parcelConfig} />)).toThrow(
    /did not return a promise/,
  );
});

test(`throws an error when loading function for config resolves with a non-object`, async () => {
  let configResolve;

  const configPromise = new Promise((resolve) => {
    configResolve = resolve;
  });

  let handledErr;

  function Parent(props) {
    return (
      <Parcel
        config={async () => {
          configResolve();
          return "";
        }}
        mountParcel={mountRootParcel}
        handleError={(err) => {
          handledErr = err;
        }}
      />
    );
  }

  render(<Parent />);

  await configPromise;

  expect(handledErr).toBeDefined();
  expect(handledErr.message).toMatch(/did not resolve with a parcel config/);
});

test(`re-renders`, async () => {
  let mountResolve;
  const mountPromise = new Promise((resolve) => {
    mountResolve = resolve;
  });

  let mountedParcel;

  const mountParcel = (...args) => {
    mountedParcel = mountRootParcel(...args);
    return mountedParcel;
  };

  let updateResolve;
  const updatePromise = new Promise((resolve) => {
    updateResolve = resolve;
  });

  function Parent({ parcelConfig, ...props }) {
    return (
      <Parcel
        config={parcelConfig}
        mountParcel={mountParcel}
        parcelDidMount={mountResolve}
        parcelDidUpdate={updateResolve}
        {...props}
      />
    );
  }

  const parcelConfig = singleSpaReact({
    createRoot,
    createElement,
    useEffect,
    renderReactNode(props) {
      return <div>Content: {props.prop1}</div>;
    },
  });

  const { unmount, rerender } = render(
    <Parent parcelConfig={parcelConfig} prop1="1" />,
  );

  await mountPromise;

  expect(mountedParcel.getStatus()).toBe(AppOrParcelStatus.MOUNTED);

  expect(await screen.findByText("Content: 1")).toBeDefined();

  rerender(<Parent parcelConfig={parcelConfig} prop1="2" />);

  await updatePromise;

  expect(await screen.queryByText("Content: 2")).toBeDefined();

  unmount();

  await mountedParcel.unmountPromise;

  expect(mountedParcel.getStatus()).toBe(AppOrParcelStatus.NOT_MOUNTED);
});
