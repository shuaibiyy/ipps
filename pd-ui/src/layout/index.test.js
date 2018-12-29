import * as R from 'ramda'
import React from 'react'
import { shallow } from 'enzyme'
import { Layout } from './'
import { lock } from '../utils/AuthService'

const dummyProps = {
  loginError: R.identity,
  loginSuccess: R.identity,
  logout: R.identity,
  match: { url: 'foobar' }
}

describe('Layout', () => {
  it('should not render when unauthenticated', () => {
    const wrapper = shallow(
      <Layout
        {...dummyProps}
        authenticated={false}
      />)
    expect(wrapper.html()).toBeNull()
  })

  it('should call lock when unauthenticated', () => {
    lock.show = jest.fn()
    const wrapper = shallow(
      <Layout
        {...dummyProps}
        authenticated={false}
      />)
    expect(wrapper.html()).toBeNull()
    expect(lock.show).toHaveBeenCalledTimes(1)
  })

  it('should render when authenticated', () => {
    const wrapper = shallow(
      <Layout
        {...dummyProps}
        authenticated
      />)
    expect(wrapper.find('div').exists()).toBe(true)
  })
})
