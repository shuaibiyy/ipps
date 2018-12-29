import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Select from 'antd/lib/select'
import { availableFields } from './constants'

export default class extends Component {
  static propTypes = {
    excludedFields: PropTypes.array.isRequired,
    excludeFields: PropTypes.func.isRequired
  }

  render () {
    const { excludedFields } = this.props
    const filteredOptions = availableFields.filter(o => !excludedFields.includes(o))
    return (
      <Select
        mode='multiple'
        placeholder='Fields excluded from providers data'
        value={excludedFields}
        onChange={this.props.excludeFields}
        style={{ width: '100%' }}>
        {filteredOptions.map(item => (
          <Select.Option key={item} value={item}>
            {item}
          </Select.Option>
        ))}
      </Select>
    )
  }
}
