import * as React from "react";
import { AppProps, CustomProps, LifeCycleFn } from "single-spa";

declare const SingleSpaContext: React.Context<CustomProps & AppProps>;

type DeprecatedRenderTypes =
  | "createBlockingRoot"
  | "unstable_createRoot"
  | "unstable_createBlockingRoot";

type LegacyRenderType = "hydrate" | "render";

type RenderType = "createRoot" | "hydrateRoot" | LegacyRenderType;

interface SingleSpaReactOpts<RootComponentProps> {
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

interface ReactAppOrParcel<ExtraProps> {
  bootstrap: LifeCycleFn<ExtraProps>;
  mount: LifeCycleFn<ExtraProps>;
  unmount: LifeCycleFn<ExtraProps>;
  update?: LifeCycleFn<ExtraProps>;
}

declare function singleSpaReact<ExtraProps = {}>(
  opts: SingleSpaReactOpts<ExtraProps & AppProps>
): ReactAppOrParcel<ExtraProps>;

declare namespace singleSpaReact {
  /**
   * Prevents typescript from requiring accessing the default export with ".default", which is not required.
   * For more information see https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/MissingExportEquals.md
   */
  const _default: typeof singleSpaReact;
  export { _default as default };

  export {
    SingleSpaContext,
    SingleSpaReactOpts,
    ReactAppOrParcel,
    DeprecatedRenderTypes,
    LegacyRenderType,
    RenderType,
  };
}

export = singleSpaReact;
