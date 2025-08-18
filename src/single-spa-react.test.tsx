import { createElement, useEffect } from "react";
import singleSpaReact from "./single-spa-react";
import { test, expect } from "@jest/globals";
import { createRoot, hydrateRoot } from "react-dom/client";
import { AppProps, mountRootParcel } from "single-spa";

test("throws error with no opts passed in", () => {
  expect(singleSpaReact).toThrow(/requires an opts/);
});

test("throws error with missing createRoot", () => {
  expect(() => singleSpaReact({})).toThrow(/createRoot/);
});

test("throws error with missing renderReactNode", () => {
  expect(() => singleSpaReact({ createRoot })).toThrow(/renderReactNode/);
});

test("throws an error with missing createElement", () => {
  expect(() =>
    singleSpaReact({
      createRoot,
      renderReactNode: (props) => <div />,
    }),
  ).toThrow(/createElement/);
});

test("throws an error with missing useEffect", () => {
  expect(() =>
    singleSpaReact({
      createRoot,
      createElement,
      renderReactNode: (props) => <div />,
    }),
  ).toThrow(/useEffect/);
});

test(`can mount and unmount a react application to the DOM`, async () => {
  const lifecycles = singleSpaReact({
    createElement,
    createRoot,
    useEffect,
    renderReactNode(props) {
      return createElement("div", null, "Content");
    },
  });

  const props: AppProps = {
    name: "test",
    mountParcel: mountRootParcel,
  };

  await lifecycles.init(props);
  await lifecycles.mount(props);
  expect(document.getElementById(`single-spa-application:test`)).toBeDefined();
  expect(
    document.getElementById(`single-spa-application:test`)?.textContent,
  ).toEqual("Content");
  await lifecycles.unmount(props);
  expect(document.getElementById(`single-spa-application:test`)).toBe(null);
});

test(`can hydrate a react application`, async () => {
  const domElement = document.createElement("div");
  domElement.appendChild(
    Object.assign(document.createElement("div"), { textContent: "Content" }),
  );
  document.body.appendChild(domElement);

  const lifecycles = singleSpaReact({
    domElementGetter: () => domElement,
    createElement,
    hydrateRoot,
    useEffect,
    renderReactNode(props) {
      return createElement("div", null, "Content");
    },
  });

  const props: AppProps = {
    name: "test",
    mountParcel: mountRootParcel,
  };

  await lifecycles.init(props);
  await lifecycles.mount(props);
  expect(domElement.textContent).toEqual("Content");
  await lifecycles.unmount(props);
  expect(document.body.contains(domElement)).toBe(false);
});
