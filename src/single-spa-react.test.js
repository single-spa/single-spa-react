import singleSpaReact from './single-spa-react.js'

describe('single-spa-react', () => {
  let React, ReactDOM, rootComponent, domElement, domElementGetter, componentInstance, createdReactElement

  beforeEach(() => {
    React = {
      createElement: jest.fn(() => {
        return createdReactElement
      }),
      version: '16.2.0',
    },
    ReactDOM = {
      render: jest.fn((reactEl, domEl, cbk) => {
        cbk()
        return componentInstance
      }),
      hydrate: jest.fn((reactEl, domEl, cbk) => {
        cbk()
        return componentInstance
      }),
      createRoot: jest.fn(domEl => {
        return {
          render: jest.fn((reactEl, cbk) => {
            cbk()
            return componentInstance
          })
        }
      }),
      unmountComponentAtNode: jest.fn()
    }

    createdReactElement = "Hey a created react element"
    componentInstance = {componentDidCatch: () => {}}
    rootComponent = jest.fn()
    domElement = "Hey i'm the dom element"
    domElementGetter = jest.fn().mockImplementation(() => domElement)

    console.warn = jest.fn()
  })

  it(`throws an error if you don't pass required opts`, () => {
    expect(() => singleSpaReact()).toThrow()
    expect(() => singleSpaReact({})).toThrow()
    expect(() => singleSpaReact({ReactDOM, rootComponent})).toThrow()
    expect(() => singleSpaReact({React, rootComponent})).toThrow()
    expect(() => singleSpaReact({React, ReactDOM})).toThrow()
  })

  it(`mounts and unmounts a React component, passing through the single-spa props`, () => {
    const props = {why: 'hello', customProps: {}}
    const lifecycles = singleSpaReact({React, ReactDOM, rootComponent, domElementGetter})

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled()
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent)
        expect(React.createElement.mock.calls[0][1]).toEqual(props)
        expect(ReactDOM.render).toHaveBeenCalled()
        expect(ReactDOM.render.mock.calls[0][0]).toEqual(createdReactElement)
        expect(ReactDOM.render.mock.calls[0][1]).toEqual(domElement)
        expect(typeof ReactDOM.render.mock.calls[0][2]).toEqual('function')
        return lifecycles.unmount(props)
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(domElement)
      })
  })

  it(`mounts and unmounts a React component with a 'renderType' of 'hydrate'`, () => {
    const props = {why: 'hello', customProps: {}}
    const lifecycles = singleSpaReact({React, ReactDOM, rootComponent, domElementGetter, renderType:'hydrate'})

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled()
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent)
        expect(React.createElement.mock.calls[0][1]).toEqual(props)
        expect(ReactDOM.hydrate).toHaveBeenCalled()
        expect(ReactDOM.hydrate.mock.calls[0][0]).toEqual(createdReactElement)
        expect(ReactDOM.hydrate.mock.calls[0][1]).toEqual(domElement)
        expect(typeof ReactDOM.hydrate.mock.calls[0][2]).toEqual('function')
        return lifecycles.unmount(props)
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(domElement)
      })
  })

  it(`mounts and unmounts a React component with a 'renderType' of 'createRoot'`, () => {
    const props = {why: 'hello', customProps: {}}
    const lifecycles = singleSpaReact({React, ReactDOM, rootComponent, domElementGetter, renderType:'createRoot'})

    const createRootRender = jest.fn()
    ReactDOM.createRoot.mockImplementation(domEl => {
      return {
        render: createRootRender.mockImplementation((reactEl, cbk) => {
          cbk()
          return componentInstance
        })
      }
    })

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled()
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent)
        expect(React.createElement.mock.calls[0][1]).toEqual(props)
        expect(ReactDOM.createRoot).toHaveBeenCalled()
        expect(ReactDOM.createRoot.mock.calls[0][0]).toEqual(domElement)
        expect(createRootRender.mock.calls[0][0]).toEqual(createdReactElement)
        expect(typeof createRootRender.mock.calls[0][1]).toEqual('function')
        return lifecycles.unmount(props)
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(domElement)
      })
  })

  it(`chooses the parcel dom element over other dom element getters`, () => {
    const optsDomElementGetter = () => 'optsDomElementGetter'
    let opts = {React, ReactDOM, rootComponent, domElementGetter: optsDomElementGetter}
    let propsDomElementGetter = () => 'propsDomElementGetter'
    let propsDomElement = () => 'propsDomElement'
    let props = {customProps: {domElement: propsDomElement, domElementGetter: propsDomElementGetter}}

    const lifecycles = singleSpaReact(opts)

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => lifecycles.unmount(props))
      .then(() => {
        expect(ReactDOM.render).toHaveBeenCalled()
        // prefer customProp dom element over everything because it's how parcels work
        expect(ReactDOM.render.mock.calls[0][1]).toBe(propsDomElement)
      })
  })

  it(`allows you to provide a domElementGetter as an opt`, () => {
    const props = {why: 'hello', customProps: {}}
    const lifecycles = singleSpaReact({React, ReactDOM, rootComponent, domElementGetter})

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      // Doesn't throw
  })

  it(`allows you to provide a domElementGetter as a customProps`, () => {
    const props = {why: 'hello', customProps: {domElementGetter}}
    const lifecycles = singleSpaReact({React, ReactDOM, rootComponent})

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
    // Doesn't throw
  })

  it(`uses the dom element that was used for mount when unmounting`, () => {
    const opts = {React, ReactDOM, rootComponent}
    const props = {domElementGetter}

    const lifecycles = singleSpaReact(opts)

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => expect(domElementGetter).toHaveBeenCalledTimes(1))
      .then(() => lifecycles.unmount(props))
      .then(() => expect(domElementGetter).toHaveBeenCalledTimes(1))
  })

  it(`doesn't throw an error if unmount is not called with a dom element or dom element getter`, () => {
    const opts = {React, ReactDOM, rootComponent}
    const props = {domElementGetter}

    const lifecycles = singleSpaReact(opts)

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(domElementGetter).toHaveBeenCalledTimes(1)

        // The domElementGetter should no longer be required after mount is finished
        delete props.domElementGetter
      })
      .then(() => lifecycles.unmount(props))
      .then(() => expect(domElementGetter).toHaveBeenCalledTimes(1))
  })

  it(`warns if you are using react 16 but don't implement componentDidCatch`, () => {
    delete componentInstance.componentDidCatch
    React.version = '16.2.0'
    const props = {why: 'hello', customProps: {}}
    const lifecycles = singleSpaReact({React, ReactDOM, rootComponent, domElementGetter})

    return lifecycles
      .bootstrap()
      .then(() => expect(console.warn).not.toHaveBeenCalled())
      .then(() => lifecycles.mount(props))
      .then(() => expect(console.warn).toHaveBeenCalled())
  })

  it(`does not warn if you are using react 15 but don't implement componentDidCatch`, () => {
    delete componentInstance.componentDidCatch
    React.version = '15.4.1'
    const props = {why: 'hello', customProps: {}}
    const lifecycles = singleSpaReact({React, ReactDOM, rootComponent, domElementGetter})

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => expect(console.warn).not.toHaveBeenCalled())
  })

  describe('warnings for componentDidCatch', () => {
    let originalWarn
    beforeEach(() => {
      let originalWarn = console.warn
      console.warn = jest.fn()
    })

    afterEach(() => {
      console.warn = originalWarn
    })

    it(`should not throw a warning`, () => {
      const props = {why: 'hello', customProps: {}}
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: class rootComponent {componentDidCatch(){}},
        domElementGetter
      })

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          return expect(console.warn.mock.calls.length).toBe(0)
        })
    })

    it(`should throw a warning`, () => {
      const props = {why: 'hello', customProps: {}}
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: class rootComponent {},
        domElementGetter
      })

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          return expect(console.warn.mock.calls.length).toBe(1)
        })
    })

    it(`should throw a warning`, () => {
      const props = {why: 'hello', customProps: {}}
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: function foo () {},
        domElementGetter
      })

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          return expect(console.warn.mock.calls.length).toBe(1)
        })
    })

    it(`provides a default implementation of domElementGetter if you don't provide one`, () => {
      const props = {name: 'k_ruel'}
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: function foo() {},
        // No domElementGetter
      })

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          expect(document.getElementById('single-spa-application:k_ruel')).not.toBeFalsy()
        })
    })
  })
})
