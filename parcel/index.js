'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _singleSpaReact = require('../lib/single-spa-react.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* This import statement requires a peer or dev dependency on react that is fulfilled at runtime.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * To avoid duplicate bundling of react, we do not do this inside of single-spa-react.js.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * We also do not set up the prop types in this file to avoid requiring the user of the library
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * to have prop-types installed and in their browser bundle, since not everyone uses prop types.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Parcel = function (_React$Component) {
  _inherits(Parcel, _React$Component);

  function Parcel(props) {
    _classCallCheck(this, Parcel);

    var _this = _possibleConstructorReturn(this, (Parcel.__proto__ || Object.getPrototypeOf(Parcel)).call(this, props));

    _this.handleRef = function (el) {
      _this.el = el;
    };

    _this.addThingToDo = function (action, thing) {
      if (_this.state.hasError && action !== 'unmount') {
        // In an error state, we don't do anything anymore except for unmounting
        return;
      }

      _this.nextThingToDo = (_this.nextThingToDo || Promise.resolve()).then(function () {
        if (_this.unmounted && action !== 'unmount') {
          // Never do anything once the react component unmounts
          return;
        }

        return thing.apply(undefined, arguments);
      }).catch(function (err) {
        _this.nextThingToDo = Promise.resolve(); // reset so we don't .then() the bad promise again
        _this.setState({ hasError: true });

        if (err && err.message) {
          err.message = 'During \'' + action + '\', parcel threw an error: ' + err.message;
        }

        if (_this.props.handleError) {
          _this.props.handleError(err);
        } else {
          setTimeout(function () {
            throw err;
          });
        }

        // No more things to do should be done -- the parcel is in an error state
        throw err;
      });
    };

    _this.getCustomProps = function () {
      var customProps = Object.assign({}, _this.props);

      delete customProps.mountParcel;
      delete customProps.config;
      delete customProps.wrapWith;
      delete customProps.appendTo;
      delete customProps.handleError;

      return customProps;
    };

    _this.state = {
      hasError: false
    };

    if (!props.config) {
      throw new Error('single-spa-react\'s Parcel component requires the \'config\' prop to either be a parcel config or a loading function that returns a promise. See https://github.com/CanopyTax/single-spa-react');
    }
    return _this;
  }

  _createClass(Parcel, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.addThingToDo('mount', function () {
        if (!_this2.mountParcel) {
          throw new Error('<Parcel /> was not passed a mountParcel prop, nor is it rendered where mountParcel is within the React context');
        }
        var domElement = void 0;
        if (_this2.el) {
          domElement = _this2.el;
        } else {
          _this2.createdDomElement = domElement = document.createElement(_this2.props.wrapWith);
          _this2.props.appendTo.appendChild(domElement);
        }
        _this2.parcel = _this2.mountParcel(_this2.props.config, _extends({ domElement: domElement }, _this2.getCustomProps()));
        return _this2.parcel.mountPromise;
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _this3 = this;

      this.addThingToDo('update', function () {
        if (_this3.parcel && _this3.parcel.update) {
          _this3.parcel.update(_this3.getCustomProps());
        }
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var _this4 = this;

      this.addThingToDo('unmount', function () {
        if (_this4.parcel && _this4.parcel.getStatus() === "MOUNTED") {
          return _this4.parcel.unmount();
        }
      });

      if (this.createdDomElement) {
        this.createdDomElement.parentNode.removeChild(this.createdDomElement);
      }

      this.unmounted = true;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      if (this.props.appendTo) {
        if (_singleSpaReact.SingleSpaContext && _singleSpaReact.SingleSpaContext.Consumer) {
          return _react2.default.createElement(
            _singleSpaReact.SingleSpaContext.Consumer,
            null,
            function (_ref) {
              var mountParcel = _ref.mountParcel;

              console.log('mountParcel = ', mountParcel);
              _this5.mountParcel = mountParcel;

              return null;
            }
          );
        } else {
          return null;
        }
      } else {
        var reactElement = _react2.default.createElement(this.props.wrapWith, { ref: this.handleRef });

        if (_singleSpaReact.SingleSpaContext && _singleSpaReact.SingleSpaContext.Consumer) {
          return _react2.default.createElement(
            _singleSpaReact.SingleSpaContext.Consumer,
            null,
            function (_ref2) {
              var mountParcel = _ref2.mountParcel;

              _this5.mountParcel = mountParcel;

              return reactElement;
            }
          );
        } else {
          // react@<16.3, or not being rendered within a single-spa application
          return reactElement;
        }
      }
    }
  }]);

  return Parcel;
}(_react2.default.Component);

Parcel.defaultProps = {
  wrapWith: 'div'
};
exports.default = Parcel;


function looksLikeParcelConfig(config) {
  return config && typeof config.mount === 'function' && typeof config.unmount === 'function' && typeof config.bootstrap === 'function';
}

function isThenable(obj) {
  return obj && typeof obj.then === 'function';
}

//# sourceMappingURL=index.js.map