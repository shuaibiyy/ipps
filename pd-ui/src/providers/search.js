import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Slider from 'antd/lib/slider'
import Collapse from 'antd/lib/collapse'
import AutoComplete from 'antd/lib/auto-complete'

const Panel = Collapse.Panel

const customPanelStyle = {
  border: 0,
  overflow: 'hidden'
}

const US_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC',
  'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA',
  'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
  'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

export default class extends Component {
  static propTypes = {
    term: PropTypes.string.isRequired,
    updateTerm: PropTypes.func.isRequired,
    selectProviderState: PropTypes.func.isRequired,
    updateDischarges: PropTypes.func.isRequired,
    updateCoveredCharges: PropTypes.func.isRequired,
    updateMedicarePayments: PropTypes.func.isRequired
  }

  emitEmpty = () => {
    this.termInput.focus()
    this.props.updateTerm('')
  }

  updateTerm = e => {
    this.props.updateTerm(e.target.value)
  }

  render () {
    const { term } = this.props
    const suffix = term ? <Icon type='close-circle' onClick={this.emitEmpty} /> : null

    return (
      <div>
        <Input
          placeholder='Provider Name or Provider Address or DRG Definition'
          prefix={<Icon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />}
          suffix={suffix}
          value={term}
          onChange={this.updateTerm}
          ref={node => (this.termInput = node)}
        />
        <br />
        <Collapse bordered={false}>
          <Panel header='Filters' key='1' style={customPanelStyle}>
            <Row gutter={32}>
              <Col span={12}>
                <h4>Total Discharges:</h4>
                <Slider
                  range
                  defaultValue={[10, 1000]}
                  max={10000}
                  onAfterChange={this.props.updateDischarges}
                />
              </Col>
              <Col span={12}>
                <h4>Avg Covered Charges:</h4>
                <Slider
                  range
                  defaultValue={[1000, 50000]}
                  max={1000000}
                  onAfterChange={this.props.updateCoveredCharges}
                />
              </Col>
            </Row>
            <Row gutter={32}>
              <Col span={12}>
                <h4>Avg Medicare Payments:</h4>
                <Slider
                  range
                  defaultValue={[1000, 50000]}
                  max={1000000}
                  onAfterChange={this.props.updateMedicarePayments}
                />
              </Col>
              <Col span={12}>
                <h4>State:</h4>
                <AutoComplete
                  dataSource={US_STATES}
                  onSelect={this.props.selectProviderState}
                  placeholder='State'
                  filterOption={(inputValue, option) =>
                    option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} />
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
    )
  }
}
