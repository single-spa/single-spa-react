import * as React from "react";
import {
  ParcelConfig,
  ParcelProps,
  Parcel as SingleSpaParcel,
} from "single-spa";

interface ParcelCompProps<ExtraProps = {}> {
  config: ParcelConfig<ExtraProps>;
  mountParcel?: (
    parcelConfig: ParcelConfig,
    parcelProps: ParcelProps & ExtraProps
  ) => SingleSpaParcel;
  wrapWith?: string;
  wrapStyle?: React.CSSProperties;
  wrapClassName?: string;
  appendTo?: HTMLElement;
  parcelDidMount?: () => any;
  handleError?: (err: Error) => any;
  [extraProp: string]: any;
}

interface ParcelState {
  hasError: boolean;
}

declare class Parcel<ExtraProps = {}> extends React.Component<
  ParcelCompProps<ExtraProps>,
  ParcelState
> {}

export = Parcel;

declare namespace Parcel {
  export { ParcelCompProps, ParcelState };
}
