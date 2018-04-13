import PropTypes from 'prop-types'
import Parcel from './parcel'

Parcel.propTypes = {
  // Required
  config: PropTypes.oneOfType([
    // A config object
    PropTypes.shape({
      bootstrap: PropTypes.func.isRequired,
      mount: PropTypes.func.isRequired,
      unmount: PropTypes.func.isRequired,
      update: PropTypes.func,
      name: PropTypes.string,
    }).isRequired,

    // a loading function
    PropTypes.func,
  ]),

  // Optional
  mountParcel: PropTypes.func.isRequired, // Required if it is not available from SingleSpaContext (i.e., when parcel is not rendered by a single-spa application)
  wrapWith: PropTypes.string, // e.g., 'div' or 'span'. Defaults to div
  handleError: PropTypes.func, // errors are just thrown if no handleError function is called
  appendTo: PropTypes.any, // if you want to append to something besides a dom element created by the Parcel component
}
