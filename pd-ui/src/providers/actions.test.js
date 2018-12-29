import * as R from 'ramda'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {
  FETCH_PROVIDERS_ERROR,
  FETCH_PROVIDERS_REQUEST,
  FETCH_PROVIDERS_SUCCESS,
  fetchProviders, UPDATE_TERM,
  updateTerm
} from './actions'
import { availableFields } from './constants'
import axios from '../api/http'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
let mock

describe('fetchProviders', () => {
  beforeAll(() => {
    mock = new MockAdapter(axios)
  })

  afterAll(() => {
    mock.restore()
  })

  it('triggers success when fetching providers is done', () => {
    const payload = { provider: [], total: 0 }

    mock.onGet('/api/providers').reply(200, payload)

    const expectedActions = [
      { type: FETCH_PROVIDERS_REQUEST },
      { type: FETCH_PROVIDERS_SUCCESS, payload }
    ]
    const store = mockStore({ providers: { excludedFields: [] } })

    return store.dispatch(fetchProviders()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('triggers failure when fetching providers fails', () => {
    mock.onGet('/api/providers').networkError()

    const expectedActions = [
      { type: FETCH_PROVIDERS_REQUEST },
      { type: FETCH_PROVIDERS_ERROR, error: true, payload: new Error('Network Error') }
    ]
    const store = mockStore({ providers: { excludedFields: [] } })

    return store.dispatch(fetchProviders()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('triggers API call with the correct query params', () => {
    const payload = { provider: [], total: 0 }

    const store = mockStore({
      providers: {
        term: 'foo',
        minDischarges: 1,
        maxDischarges: 2,
        minAverageCoveredCharges: 3,
        maxAverageCoveredCharges: 4,
        minAverageMedicarePayments: 5,
        maxAverageMedicarePayments: 6,
        resultStartIndex: 7,
        excludedFields: ['provider_city', 'provider_name']
      }
    })

    const expectedQueryParams = {
      term: 'foo',
      min_discharges: 1,
      max_discharges: 2,
      min_average_covered_charges: 3,
      max_average_covered_charges: 4,
      min_average_medicare_payments: 5,
      max_average_medicare_payments: 6,
      from: 7,
      fields: R.join(',', R.without(['provider_city', 'provider_name'], availableFields))
    }

    mock.onGet('/api/providers').reply(config => {
      expect(config.params).toEqual(expectedQueryParams)
      return [200, payload]
    })

    const expectedActions = [
      { type: FETCH_PROVIDERS_REQUEST },
      { type: FETCH_PROVIDERS_SUCCESS, payload }
    ]

    return store.dispatch(fetchProviders()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('triggers API call without undefined, null and empty query params', () => {
    const payload = { provider: [], total: 0 }

    const store = mockStore({
      providers: {
        term: '',
        minDischarges: null,
        maxDischarges: null,
        minAverageCoveredCharges: 3,
        maxAverageCoveredCharges: 4,
        minAverageMedicarePayments: 5,
        maxAverageMedicarePayments: 6,
        resultStartIndex: 7,
        excludedFields: []
      }
    })

    const expectedQueryParams = {
      min_average_covered_charges: 3,
      max_average_covered_charges: 4,
      min_average_medicare_payments: 5,
      max_average_medicare_payments: 6,
      from: 7
    }

    mock.onGet('/api/providers').reply(config => {
      expect(config.params).toEqual(expectedQueryParams)
      return [200, payload]
    })

    const expectedActions = [
      { type: FETCH_PROVIDERS_REQUEST },
      { type: FETCH_PROVIDERS_SUCCESS, payload }
    ]

    return store.dispatch(fetchProviders()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})

describe('providersUpdater', () => {
  beforeAll(() => {
    mock = new MockAdapter(axios)
  })

  afterAll(() => {
    mock.restore()
  })

  it('trigger fetch providers action when triggered', () => {
    const updatePayload = 'foo'
    const providersPayload = { provider: [], total: 0 }

    mock.onGet('/api/providers').reply(200, providersPayload)

    const expectedActions = [
      { type: UPDATE_TERM, payload: updatePayload },
      { type: FETCH_PROVIDERS_REQUEST },
      { type: FETCH_PROVIDERS_SUCCESS, payload: providersPayload }
    ]
    const store = mockStore({ providers: { excludedFields: [] } })

    return store.dispatch(updateTerm(updatePayload)).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
