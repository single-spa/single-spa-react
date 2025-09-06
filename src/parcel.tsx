import {
  type Context,
  createContext,
  createElement,
  DetailedHTMLProps,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { AppProps, ParcelConfig, mountRootParcel } from "single-spa";

export type SingleSpaReactParcelProps = {
  config: ParcelConfig | (() => Promise<ParcelConfig>);
  parcelDidMount?: () => void;
  parcelDidUpdate?: () => void;
  handleError?: () => void;
  wrapWith?: string;
  wrapWithProps?: DetailedHTMLProps;
  mountParcel?: mountRootParcel;
  singleSpaContext?: Context<AppProps>;
};

const defaultContext = createContext<AppProps>({
  name: "test",
});

export default function SingleSpaReactParcel({
  config: configProp,
  mountParcel,
  singleSpaContext,
  parcelDidMount,
  parcelDidUpdate,
  handleError,
  wrapWith = "div",
  wrapWithProps = {},
  ...parcelProps
}: SingleSpaReactParcelProps) {
  const [config, setConfig] = useState<ParcelConfig>();
  const context = useContext<AppProps>(singleSpaContext ?? defaultContext);
  const containerRef = useRef();
  const [parcel, setParcel] = useState();
  const [updatePromise, setUpdatePromise] = useState();
  const definedMountParcel = mountParcel ?? context.mountParcel;

  if (!definedMountParcel) {
    throw Error(
      `single-spa-react: <Parcel /> component requires either mountParcel or singleSpaContext prop`,
    );
  }

  useLoadConfig();
  useMountUnmountParcel();
  useUpdateParcel();
  useParcelDidMount();

  return createElement(wrapWith, {
    ref: containerRef,
    ...wrapWithProps,
  });

  function useLoadConfig() {
    useEffect(() => {
      if (!configProp) {
        throw Error(
          `single-spa-react: Parcel component requires a config prop`,
        );
      }

      if (typeof configProp === "function") {
        let aborted = false;
        const configPromise = configProp();
        if (!(configPromise instanceof Promise)) {
          throw Error(
            `single-spa-react: Parcel's config() loading function did not return a promise`,
          );
        }

        configPromise.then((config) => {
          if (aborted) {
            return;
          }

          if (typeof config !== "object") {
            const errMessage = `single-spa-react: Parcel's config() loading function returned a promise that did not resolve with a parcel config`;

            if (handleError) {
              handleError(new Error(errMessage));
            } else {
              throw Error(errMessage);
            }
          }

          setConfig(config);
        });

        return () => {
          aborted = true;
        };
      } else {
        setConfig(configProp);
      }
    }, [configProp]);
  }

  function useMountUnmountParcel() {
    useLayoutEffect(() => {
      if (config && containerRef.current) {
        const parcel = definedMountParcel(config, {
          domElement: containerRef.current,
          ...parcelProps,
        });
        setParcel(parcel);

        return () => {
          parcel.unmount();
        };
      }
    }, [config, definedMountParcel, containerRef.current]);
  }

  function useUpdateParcel() {
    useEffect(() => {
      if (parcel?.update) {
        parcel.update(parcelProps).then(parcelDidUpdate, handleError);
      }
    }, [parcel, parcelProps]);
  }

  function useParcelDidMount() {
    useEffect(() => {
      if (parcel?.mountPromise) {
        parcel.mountPromise.then(parcelDidMount, handleError);
      }
    }, [parcel?.mountPromise, parcelDidMount, handleError]);
  }
}
