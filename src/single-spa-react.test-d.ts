import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import "../types/single-spa-react";
import singleSpaReact, {
  ReactAppOrParcel,
  SingleSpaContext,
} from "../types/single-spa-react";
import Parcel, { ParcelCompProps } from "../types/parcel";
import { AppProps, LifeCycleFn, mountRootParcel } from "single-spa";
import { expectType } from "tsd";

class ErrorBoundary extends React.Component<AppProps & any, ErrorState> {
  render() {
    return React.createElement("div", null, "hi");
  }
  componentDidCatch(err: Error, errInfo: React.ErrorInfo) {}
}

interface ErrorState {}

const lifecylesUntypedProps = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: (props) => React.createElement("div", null, "hi"),
  suppressComponentDidCatchWarning: false,
  parcelCanUpdate: true,
  errorBoundaryClass: ErrorBoundary,
  renderType: "createRoot",
});

singleSpaReact({
  React,
  ReactDOMClient,
  loadRootComponent: () =>
    Promise.resolve((props) => React.createElement("div", null, "hi")),
});

const lifecycles1 = singleSpaReact<Hi>({
  React,
  ReactDOMClient,
  rootComponent: (props: AppProps & Hi) =>
    React.createElement("div", null, "hi"),
  domElementGetter(props: Hi & AppProps) {
    return document.getElementById(props.name) as HTMLElement;
  },
  errorBoundary(err: Error, errInfo: React.ErrorInfo, props: AppProps & Hi) {
    return React.createElement("div", null, "An error occurred");
  },
});

expectType<ReactAppOrParcel<Hi>>(lifecycles1);
expectType<LifeCycleFn<Hi>>(lifecycles1.bootstrap);
expectType<LifeCycleFn<Hi>>(lifecycles1.mount);
expectType<LifeCycleFn<Hi>>(lifecycles1.unmount);
expectType<LifeCycleFn<Hi> | undefined>(lifecycles1.update);

type Hi = {
  hi: string;
};

React.createElement<ParcelCompProps<Hi>>(Parcel, {
  config: lifecycles1,
  mountParcel: mountRootParcel,
  wrapWith: "div",
  wrapStyle: { backgroundColor: "red" },
  wrapClassName: "blue",
  appendTo: document.createElement("div"),
  parcelDidMount() {},
  handleError(err: Error) {},
  hi: "there",
});

React.createElement(Parcel, {
  config: lifecylesUntypedProps,
});

React.createElement(Parcel, {
  config: lifecylesUntypedProps,
  hi: "there",
});

const context1 = React.useContext(SingleSpaContext);
const context2 = React.useContext(SingleSpaContext) as AppProps & Hi;

expectType<string>(context1.name);
expectType<any>(context1.singleSpa);
expectType<AppProps["mountParcel"]>(context1.mountParcel);
expectType<any>(context1.customProp);
expectType<string>(context2.hi);
