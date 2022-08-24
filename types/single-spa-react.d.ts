import * as React from "react";
import { AppProps, CustomProps, LifeCycleFn } from "single-spa";

export const SingleSpaContext: React.Context<CustomProps & AppProps>;

type DeprecatedRenderTypes =
  | "createBlockingRoot"
  | "unstable_createRoot"
  | "unstable_createBlockingRoot";

type LegacyRenderType = "hydrate" | "render";

type RenderType =
  // React 18
  "createRoot" | "hydrateRoot" | LegacyRenderType;

export interface SingleSpaReactOpts<RootComponentProps> {
  React: any;
  ReactDOM?: {
    [T in LegacyRenderType]?: any;
  };
  ReactDOMClient?: {
    [T in RenderType]?: any;
  };
  rootComponent?:
    | React.ComponentClass<RootComponentProps, any>
    | React.FunctionComponent<RootComponentProps>;
  loadRootComponent?: (
    props?: RootComponentProps
  ) => Promise<React.ElementType<typeof props>>;
  errorBoundary?: (
    err: Error,
    errInfo: React.ErrorInfo,
    props: RootComponentProps
  ) => React.ReactElement;
  errorBoundaryClass?: React.ComponentClass<RootComponentProps>;
  parcelCanUpdate?: boolean;
  suppressComponentDidCatchWarning?: boolean;
  domElementGetter?: (props: RootComponentProps) => HTMLElement;
  renderType?: RenderType | (() => RenderType);
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
