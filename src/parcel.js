/* This import statement requires a peer or dev dependency on react that is fulfilled at runtime.
 * To avoid duplicate bundling of react, we do not do this inside of single-spa-react.js.
 * We also do not set up the prop types in this file to avoid requiring the user of the library
 * to have prop-types installed and in their browser bundle, since not everyone uses prop types.
 */
import React from 'react'
import {SingleSpaContext} from '../lib/single-spa-react.js'

export default class Parcel extends React.Component {
  static defaultProps = {
    wrapWith: 'div',
    parcelDidMount: () => {},
  }
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
    }

    if (!props.config) {
      throw new Error(`single-spa-react's Parcel component requires the 'config' prop to either be a parcel config or a loading function that returns a promise. See https://github.com/CanopyTax/single-spa-react`)
    }
  }
  componentDidMount() {
    this.addThingToDo('mount', () => {
      const mountParcel = this.props.mountParcel || this.mountParcel
      if (!mountParcel) {
        throw new Error(`
				  <Parcel /> was not passed a mountParcel prop, nor is it rendered where mountParcel is within the React context.
				  If you are using <Parcel /> within a module that is not a single-spa application, you will need to import mountRootParcel from single-spa and pass it into <Parcel /> as a mountParcel prop	
				`)
      }
      let domElement;
      if (this.el) {
        domElement = this.el
      } else {
        this.createdDomElement = domElement = document.createElement(this.props.wrapWith)
        this.props.appendTo.appendChild(domElement)
      }
      this.parcel = mountParcel(this.props.config, {domElement, ...this.getParcelProps()})
      this.parcel.mountPromise.then(this.props.parcelDidMount)
      return this.parcel.mountPromise
    })
  }
  componentDidUpdate() {
    this.addThingToDo('update', () => {
      if (this.parcel && this.parcel.update) {
        return this.parcel.update(this.getParcelProps())
      }
    })
  }
  componentWillUnmount() {
    this.addThingToDo('unmount', () => {
      if (this.parcel && this.parcel.getStatus() === "MOUNTED") {
        return this.parcel.unmount()
      }
    })

    if (this.createdDomElement) {
      this.createdDomElement.parentNode.removeChild(this.createdDomElement)
    }

    this.unmounted = true
  }
  render() {
    if (this.props.appendTo) {
      if (SingleSpaContext && SingleSpaContext.Consumer) {
        return (
          <SingleSpaContext.Consumer>
            {(context) => {
              this.mountParcel = context ? context.mountParcel : null

              return null
            }}
          </SingleSpaContext.Consumer>
        )
      } else {
        return null
      }
    } else {
      const children = SingleSpaContext && SingleSpaContext.Consumer
        ? (
          <SingleSpaContext.Consumer>
            {(context) => {
              this.mountParcel = context ? context.mountParcel : null

              return null
            }}
          </SingleSpaContext.Consumer>
        )
        : undefined

      return React.createElement(this.props.wrapWith, {ref: this.handleRef}, children)
    }
  }
  handleRef = el => {
    this.el = el
  }
  addThingToDo = (action, thing) => {
    if (this.state.hasError && action !== 'unmount') {
      // In an error state, we don't do anything anymore except for unmounting
      return
    }

    this.nextThingToDo = (this.nextThingToDo || Promise.resolve())
      .then((...args) => {
        if (this.unmounted && action !== 'unmount') {
          // Never do anything once the react component unmounts
          return
        }

        return thing(...args)
      })
      .catch(err => {
        this.nextThingToDo = Promise.resolve() // reset so we don't .then() the bad promise again
        this.setState({hasError: true})

        if (err && err.message) {
          err.message = `During '${action}', parcel threw an error: ${err.message}`
        }

        if (this.props.handleError) {
          this.props.handleError(err)
        } else {
          setTimeout(() => {throw err})
        }

        // No more things to do should be done -- the parcel is in an error state
        throw err
      })
  }
  getParcelProps = () => {
    const parcelProps = {...this.props}

    delete parcelProps.mountParcel
    delete parcelProps.config
    delete parcelProps.wrapWith
    delete parcelProps.appendTo
    delete parcelProps.handleError
    delete parcelProps.parcelDidMount

    return parcelProps
  }
}
