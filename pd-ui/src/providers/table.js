import * as R from 'ramda'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Table from 'antd/lib/table'

export const currencyToNum = (c) => Number(c.replace(/[^0-9.-]+/g, ''))
export const currencySorter = R.curry((key, a, b) => currencyToNum(a[key]) - currencyToNum(b[key]))
export const wordSorter = R.curry((key, a, b) => {
  if (a[key] < b[key]) { return -1 }
  if (a[key] > b[key]) { return 1 }
  return 0
})

const columns = [{
  title: 'Provider Name',
  dataIndex: 'provider_name',
  key: 'provider_name',
  sorter: wordSorter('provider_name')
}, {
  title: 'Address',
  dataIndex: 'address',
  key: 'address'
}, {
  title: 'Total Discharges',
  dataIndex: 'total_discharges',
  key: 'total_discharges',
  defaultSortOrder: 'descend',
  sorter: currencySorter('total_discharges')
}, {
  title: 'Avg Covered Charges',
  dataIndex: 'average_covered_charges',
  key: 'average_covered_charges',
  defaultSortOrder: 'descend',
  sorter: currencySorter('average_covered_charges')
}, {
  title: 'Avg Total Payments',
  dataIndex: 'average_total_payments',
  key: 'average_total_payments',
  defaultSortOrder: 'descend',
  sorter: currencySorter('average_total_payments')
}, {
  title: 'Avg Medicare Payments',
  dataIndex: 'average_medicare_payments',
  key: 'average_medicare_payments',
  defaultSortOrder: 'descend',
  sorter: currencySorter('average_medicare_payments')
}, {
  title: 'Hospital Referral Region',
  dataIndex: 'hospital_referral_region_description',
  key: 'hospital_referral_region_description'
}, {
  title: 'DRG Definition',
  dataIndex: 'drg_definition',
  key: 'drg_definition'
}]

export function assembleAddresses (providers) {
  return providers.map(i => {
    // eslint-disable-next-line camelcase
    const { provider_street_address, provider_zip_code, provider_city, provider_state } = i
    // eslint-disable-next-line camelcase
    const addrFields = [provider_street_address, provider_city, provider_state, provider_zip_code]
    const address = R.join(', ', R.reject(R.isNil, addrFields))
    if (!R.isEmpty(address)) {
      return R.omit(['provider_street_address', 'provider_zip_code', 'provider_city', 'provider_state'], { address, ...i })
    }
    return i
  })
}

export function capitalizeFirstLetters (text) {
  return text.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

const fieldUpdater = R.curry((fn, fields, provider) => {
  const pairs = R.map(k => [k, fn(provider[k])], fields)
  return R.fromPairs(pairs)
})

export const extractFields = (providers, fields) => {
  if (R.isEmpty(providers)) {
    return []
  }
  const p = providers[0]
  return R.keys(R.pickBy((_, key) => fields.includes(key), p))
}

export function capitalize (providers) {
  const capitalizer = fieldUpdater(capitalizeFirstLetters,
    extractFields(providers, ['provider_name', 'provider_street_address', 'provider_city']))

  return providers.map(i => {
    return {
      ...i,
      ...capitalizer(i)
    }
  })
}

export function formatAmounts (providers) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })

  const format = fieldUpdater(formatter.format,
    extractFields(providers, ['average_covered_charges', 'average_total_payments', 'average_medicare_payments']))

  return providers.map(i => ({
    ...i,
    ...format(i)
  }))
}

export const isSelectedCol = R.curry((providers, { key }) => {
  if (R.isEmpty(providers)) {
    return false
  }
  return R.keys(providers[0]).includes(key)
})

export default class extends Component {
  static propTypes = {
    resultStartIndex: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    providers: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    fetchProviders: PropTypes.func.isRequired,
    flipPage: PropTypes.func.isRequired
  }

  componentDidMount () {
    this.props.fetchProviders()
  }

  handleTableChange = pagination => {
    if (pagination.current !== this.props.pagination.current) {
      const { current, pageSize } = pagination
      const resultStartIndex = (current - 1) * pageSize
      this.props.flipPage({ resultStartIndex, pagination })
    }
  }

  expandedRowRender = R.curry((cols, provider) => {
    const style = {
      width: '20%',
      float: 'left'
    }
    return (
      <div style={{ color: '#314659' }}>
        {cols.map((j, idx) => (
          <p style={{ margin: '1%' }} key={idx}>
            <span style={style}>{j['title']}:</span>
            <span>{provider[j['key']]}</span>
          </p>
        ))}
      </div>
    )
  })

  render () {
    const { providers, loading, pagination } = this.props
    const formattedProviders = R.pipe(formatAmounts, capitalize, assembleAddresses)(providers)
    const selectedColumns = R.filter(isSelectedCol(formattedProviders), columns)

    return (
      <Table
        dataSource={formattedProviders}
        pagination={pagination}
        columns={selectedColumns}
        loading={loading}
        rowKey={(_, idx) => idx}
        onChange={this.handleTableChange}
        expandedRowRender={this.expandedRowRender(selectedColumns)}
      />
    )
  }
}
