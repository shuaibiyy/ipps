import * as R from 'ramda'
import React from 'react'
import { shallow } from 'enzyme'
import Search from './search'

const dummyProps = {
  term: '',
  updateTerm: R.identity,
  selectProviderState: R.identity,
  updateDischarges: R.identity,
  updateCoveredCharges: R.identity,
  updateMedicarePayments: R.identity
}

describe('Search', () => {
  it('should not trigger update input upon render', () => {
    const mock = jest.fn()
    shallow(
      <Search
        {...dummyProps}
        updateTerm={mock}
      />)

    expect(mock).toHaveBeenCalledTimes(0)
  })

  it('should trigger update when text is entered into input', () => {
    const mock = jest.fn()
    const wrapper = shallow(
      <Search
        {...dummyProps}
        updateTerm={mock}
      />)

    wrapper.find('Input').simulate('change', { target: { value: 'foo' } })

    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('should trigger update when slider is changed', () => {
    const mock = jest.fn()
    const wrapper = shallow(
      <Search
        {...dummyProps}
        updateDischarges={mock}
      />)

    wrapper.find('Slider').first().simulate('afterChange', { target: { value: [5, 10] } })

    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('should trigger update when state is selected', () => {
    const mock = jest.fn()
    const wrapper = shallow(
      <Search
        {...dummyProps}
        selectProviderState={mock}
      />)

    wrapper.find('AutoComplete').simulate('select', { target: { value: 'AZ' } })

    expect(mock).toHaveBeenCalledTimes(1)
  })
})
