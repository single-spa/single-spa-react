import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppProps, CustomProps, LifeCycleFn } from "single-spa";

export const SingleSpaContext: React.Context<CustomProps & AppProps>;

export interface SingleSpaReactOpts<RootComponentProps> {
  React: typeof React;
  ReactDOM: typeof ReactDOM;
  rootComponent?:
    | React.ComponentClass<RootComponentProps, any>
    | React.FunctionComponent<RootComponentProps>;
  loadRootComponent?: (
    props: RootComponentProps
  ) => Promise<
    | React.ComponentClass<RootComponentProps, any>
    | React.FunctionComponent<RootComponentProps>
  >;
  errorBoundary?: (
    err: Error,
    errInfo: React.ErrorInfo,
    props: RootComponentProps
  ) => React.ReactElement;
  errorBoundaryClass?: React.ComponentClass<RootComponentProps>;
  parcelCanUpdate?: boolean;
  suppressComponentDidCatchWarning?: boolean;
  domElementGetter?: (props: RootComponentProps) => HTMLElement;
  renderType?:
    | "createRoot"
    | "unstable_createRoot"
    | "createBlockingRoot"
    | "unstable_createBlockingRoot"
    | "hydrate"
    | "render"
    | (() =>
        | "createRoot"
        | "unstable_createRoot"
        | "createBlockingRoot"
        | "unstable_createBlockingRoot"
        | "hydrate"
        | "render");
}

export interface ReactAppOrParcel<ExtraProps> {
  bootstrap: LifeCycleFn<ExtraProps>;
  mount: LifeCycleFn<ExtraProps>;
  unmount: LifeCycleFn<ExtraProps>;
  update?: LifeCycleFn<ExtraProps>;
}

export default function singleSpaReact<ExtraProps = {}>(
  opts: SingleSpaReactOpts<ExtraProps & AppProps>
): ReactAppOrParcel<ExtraProps>;
