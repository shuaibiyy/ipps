import * as R from 'ramda'
import React from 'react'
import { mount, shallow } from 'enzyme'
import Chance from 'chance'
import Table, {
  currencyToNum,
  wordSorter,
  currencySorter,
  assembleAddresses,
  capitalizeFirstLetters,
  capitalize,
  formatAmounts,
  extractFields,
  isSelectedCol
} from './table'

const chance = new Chance()

chance.mixin({
  provider: () => {
    return {
      provider_name: chance.sentence({ words: 4 }),
      provider_street_address: chance.street(),
      provider_city: chance.city(),
      provider_state: chance.state(),
      provider_zip_code: chance.zip(),
      hospital_referral_region_description: chance.string(),
      total_discharges: chance.zip(),
      average_covered_charges: chance.floating({ min: 1000, fixed: 2 }),
      average_total_payments: chance.floating({ min: 1000, fixed: 2 }),
      average_medicare_payments: chance.floating({ min: 1000, fixed: 2 })
    }
  },
  providerWithExclusions: () => {
    return {
      provider_name: chance.sentence({ words: 4 }),
      provider_city: chance.city(),
      provider_zip_code: chance.zip(),
      hospital_referral_region_description: chance.string(),
      average_covered_charges: chance.floating({ min: 1000, fixed: 2 }),
      average_total_payments: chance.floating({ min: 1000, fixed: 2 })
    }
  }
})

const dummyProps = {
  resultStartIndex: 0,
  loading: false,
  providers: [],
  pagination: {},
  fetchProviders: R.identity,
  flipPage: R.identity
}

describe('Table Helpers', () => {
  it('can convert currencies to numbers', () => {
    expect(currencyToNum('$10,000')).toEqual(10000)
    expect(currencyToNum('$10,00.5')).toEqual(1000.5)
    expect(currencyToNum('10,00.5')).toEqual(1000.5)
  })

  it('can sort currencies', () => {
    expect([{ x: '$0.01' }, { x: '$10' }, { x: '$5.5' }, { x: '$3' }].sort(currencySorter('x')))
      .toEqual([{ x: '$0.01' }, { x: '$3' }, { x: '$5.5' }, { x: '$10' }])
  })

  it('can sort words', () => {
    expect([{ x: 'baz' }, { x: 'foo' }, { x: 'bar' }, { x: 'bro' }].sort(wordSorter('x')))
      .toEqual([{ x: 'bar' }, { x: 'baz' }, { x: 'bro' }, { x: 'foo' }])
  })

  it('can assemble addresses with all address fields', () => {
    const providers = [{
      provider_street_address: 'blvd',
      provider_zip_code: '46664',
      provider_city: 'la',
      provider_state: 'ca'
    }]

    expect(assembleAddresses(providers)).toEqual([{ address: 'blvd, la, ca, 46664' }])
  })

  it('can assemble addresses with partial address fields', () => {
    const providers = [{
      provider_street_address: 'blvd',
      provider_state: 'ca'
    }]

    expect(assembleAddresses(providers)).toEqual([{ address: 'blvd, ca' }])
  })

  it('returns provider as is if no address field is present', () => {
    const providers = [{
      provider_name: 'foo'
    }]

    expect(assembleAddresses(providers)).toEqual([{ provider_name: 'foo' }])
  })

  it('can capitalize the first letters of words', () => {
    expect(capitalizeFirstLetters('foo')).toEqual('Foo')
    expect(capitalizeFirstLetters('bar foo')).toEqual('Bar Foo')
  })

  it('can capitalize the words in fields of providers', () => {
    const providers = [{
      provider_name: 'foo',
      provider_street_address: 'bar st',
      provider_city: 'gotham'
    },
    {
      provider_name: 'baz hospital',
      provider_street_address: 'st lor',
      provider_city: 'flo'
    }]

    expect(capitalize(providers)).toEqual([{
      provider_name: 'Foo',
      provider_street_address: 'Bar St',
      provider_city: 'Gotham'
    }, {
      provider_name: 'Baz Hospital',
      provider_street_address: 'St Lor',
      provider_city: 'Flo'
    }
    ])
  })

  it('can format numbers into dollars', () => {
    const providers = [{
      average_covered_charges: 1032.30,
      average_total_payments: 30249.13,
      average_medicare_payments: 1230004
    }]

    expect(formatAmounts(providers)).toEqual([{
      average_covered_charges: '$1,032.30',
      average_total_payments: '$30,249.13',
      average_medicare_payments: '$1,230,004.00'
    }])
  })

  it('can extract fields that exist from providers', () => {
    const providers = [{
      foo: 'foo',
      bar: 'bar',
      baz: 'baz'
    }]

    expect(extractFields(providers, ['foo', 'baz', 'bro'])).toEqual(['foo', 'baz'])
  })

  it('can tell if a column is selected', () => {
    expect(isSelectedCol([{ foo: 'lol' }], { 'key': 'foo' })).toEqual(true)
    expect(isSelectedCol([{ bar: 'sfw' }], { 'key': 'foo' })).toEqual(false)
  })
})

describe('Pagination', () => {
  it('does not trigger a page flip when change does not involve a different page', () => {
    const flipPage = jest.fn()
    const paginationProp = { current: 1 }
    const paginationEvent = { current: 1 }

    const wrapper = shallow(
      <Table
        {...dummyProps}
        pagination={paginationProp}
        flipPage={flipPage}
      />)

    wrapper.find('Table').simulate('change', paginationEvent)
    expect(flipPage).toHaveBeenCalledTimes(0)
  })

  it('triggers a page flip when change does involves a different page', () => {
    const flipPage = jest.fn()
    const paginationProp = { current: 1, pageSize: 20 }
    const paginationEvent = { current: 5, pageSize: 20 }

    const wrapper = shallow(
      <Table
        {...dummyProps}
        pagination={paginationProp}
        flipPage={flipPage}
      />)

    wrapper.find('Table').simulate('change', paginationEvent)
    expect(flipPage).toHaveBeenCalledTimes(1)
    expect(flipPage).toHaveBeenCalledWith({ pagination: paginationEvent, resultStartIndex: 80 })
  })
  // Test that columns shown are based on fields found in providers.2
})

describe('Table', () => {
  it('renders the correct number of rows', () => {
    const numOfProviders = 7
    const providers = chance.n(chance.provider, numOfProviders)
    const wrapper = mount(
      <Table
        {...dummyProps}
        providers={providers}
      />
    )

    // expected number of rows is +1 due to the table header.
    expect(wrapper.find('tr')).toHaveLength(numOfProviders + 1)
    wrapper.unmount()
  })

  it('renders the correct number of rows based on page size', () => {
    const pageSize = 10
    const pagination = { pageSize }
    const numOfProviders = 17
    const providers = chance.n(chance.provider, numOfProviders)
    const wrapper = mount(
      <Table
        {...dummyProps}
        providers={providers}
        pagination={pagination}
      />
    )

    expect(wrapper.find('tr')).toHaveLength(pageSize + 1)
    wrapper.unmount()
  })

  it('renders the correct number of rows when there are excluded fields', () => {
    const pageSize = 25
    const pagination = { pageSize }
    const numOfProviders = 36
    const providers = chance.n(chance.providerWithExclusions, numOfProviders)
    const numOfCols = R.keys(providers[0]).length
    const wrapper = mount(
      <Table
        {...dummyProps}
        providers={providers}
        pagination={pagination}
      />
    )

    // expected number of rows for data excludes table header (i.e. th).
    // total no. of columns = no. of cols per row * no. of rows.
    expect(wrapper.find('td')).toHaveLength(numOfCols * pageSize)
    wrapper.unmount()
  })
})
