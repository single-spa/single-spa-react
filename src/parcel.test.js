import React from 'react'
import ReactDOM from 'react-dom'
import Parcel from './parcel.js'
import {shallow, mount} from 'enzyme'
import {SingleSpaContext} from '../lib/single-spa-react.js'

document.body.appendChild = jest.fn()

describe(`<Parcel />`, () => {
  let config, mountParcel = jest.fn()

  beforeEach(() => {
    config = {
      bootstrap: jest.fn(),
      mount: jest.fn(),
      unmount: jest.fn(),
    }

    mountParcel.mockReset()
    mountParcel.mockReturnValue(() => ({
      loadPromise: jest.fn(),
      bootstrapPromise: jest.fn(),
      mountPromise: jest.fn(),
      unmountPromise: jest.fn(),
      getStatus: jest.fn(),
      unmount: jest.fn(),
    }))

    document.body.appendChild.mockReset()
  })

  it(`throws an error if you try to render the component without a config`, () => {
    expect(() => {
      shallow(<Parcel />)
    }).toThrow()
  })

  it(`renders a div by default`, () => {
    const wrapper = shallow(<Parcel config={config} mountParcel={mountParcel} />)
    expect(wrapper.find('div').length).toBe(1)
  })

  it(`calls the mountParcel prop when it mounts`, () => {
    const wrapper = mount(<Parcel config={config} mountParcel={mountParcel} />)
    return wrapper.instance().nextThingToDo.then(() => {
      expect(mountParcel).toHaveBeenCalled()
    })
  })

  it(`renders nothing if you pass in the appendTo prop`, () => {
    const wrapper = shallow(<Parcel config={config} appendTo={document.body} mountParcel={mountParcel} />)
    return wrapper.instance().nextThingToDo.then(() => {
      expect(document.body.appendChild).toHaveBeenCalled()
    })
  })

  // https://github.com/airbnb/enzyme/pull/1513 isn't published, waaaaaaaaaaaaa :'(
  // it(`lets you not pass in a mountParcel prop if the SingleSpaContext is set with one`, () => {
  //   // this creates the SingleSpaContext
  //   const appLifecycles = singleSpaReact({
  //     React,
  //     ReactDOM,
  //     rootComponent() {return null},
  //   })
  //
  //   const wrapper = mount(
  //     <SingleSpaContext.Provider value={mountParcel}>
  //       <Parcel config={config} />
  //     </SingleSpaContext.Provider>
  //   )
  //
  //   return wrapper.instance().nextThingToDo.then(() => {
  //     expect(mountParcel).toHaveBeenCalled()
  //   })
  // })
})

