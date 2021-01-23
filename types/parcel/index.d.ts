import * as React from "react";
import {
  ParcelConfig,
  ParcelProps,
  Parcel as SingleSpaParcel,
} from "single-spa";

export interface ParcelCompProps<ExtraProps = {}> {
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

export default class Parcel<ExtraProps = {}> extends React.Component<
  ParcelCompProps<ExtraProps>,
  ParcelState
> {}
