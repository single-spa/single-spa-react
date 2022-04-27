import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { AppProps, CustomProps, LifeCycleFn } from "single-spa";

export const SingleSpaContext: React.Context<CustomProps & AppProps>;

export interface ReactAppOrParcel<ExtraProps> {
  bootstrap: LifeCycleFn<ExtraProps>;
  mount: LifeCycleFn<ExtraProps>;
  unmount: LifeCycleFn<ExtraProps>;
  update?: LifeCycleFn<ExtraProps>;
}

export interface SingleSpaReactOpts<RootComponentProps> {
  React: typeof React;
  ReactDOMClient: typeof ReactDOMClient;
  rootComponent?: React.ElementType<RootComponentProps>;
  loadRootComponent?: (props?: any) => Promise<React.ElementType<any>>;
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
    | "hydrateRoot"
    | (() => "createRoot" | "hydrateRoot");
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
