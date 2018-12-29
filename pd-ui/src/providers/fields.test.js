import * as R from 'ramda'
import React from 'react'
import { shallow } from 'enzyme'
import Fields from './fields'
import { availableFields } from './constants'

const dummyProps = {
  excludedFields: [],
  excludeFields: R.identity
}

describe('Fields', () => {
  it('render the correct number of options if fields are not excluded.', () => {
    const numOfOptions = availableFields.length

    const wrapper = shallow(
      <Fields
        {...dummyProps}
      />)

    expect(wrapper.find('Option')).toHaveLength(numOfOptions)
  })

  it('render the correct number of options if some fields are excluded.', () => {
    const numOfOptions = availableFields.length
    const excludedFields = R.take(2, availableFields)

    const wrapper = shallow(
      <Fields
        {...dummyProps}
        excludedFields={excludedFields}
      />)

    expect(wrapper.find('Option')).toHaveLength(numOfOptions - excludedFields.length)
  })
})
