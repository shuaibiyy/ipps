import * as R from 'ramda'
import { createAction } from 'redux-actions'
import message from 'antd/lib/message/index'
import providers from '../api/providers'
import { availableFields } from './constants'

export const FETCH_PROVIDERS_REQUEST = 'FETCH_PROVIDERS_REQUEST'
export const FETCH_PROVIDERS_SUCCESS = 'FETCH_PROVIDERS_SUCCESS'
export const FETCH_PROVIDERS_ERROR = 'FETCH_PROVIDERS_ERROR'
export const UPDATE_TERM = 'UPDATE_TERM'
export const SELECT_PROVIDER_STATE = 'SELECT_PROVIDER_STATE'
export const UPDATE_DISCHARGES = 'UPDATE_DISCHARGES'
export const UPDATE_COVERED_CHARGES = 'UPDATE_COVERED_CHARGES'
export const UPDATE_MEDICARE_PAYMENTS = 'UPDATE_MEDICARE_PAYMENTS'
export const EXCLUDE_FIELDS = 'EXCLUDE_FIELDS'
export const FLIP_PAGE = 'FLIP_PAGE'

export const fetchProvidersRequest = createAction(FETCH_PROVIDERS_REQUEST)
export const fetchProvidersSuccess = createAction(FETCH_PROVIDERS_SUCCESS)
export const fetchProvidersError = createAction(FETCH_PROVIDERS_ERROR)

// taken from https://github.com/ramda/ramda/wiki/Cookbook#rename-keys-of-an-object
const renameKeys = R.curry((keysMap, obj) =>
  R.reduce((acc, key) => R.assoc(keysMap[key] || key, obj[key], acc), {}, R.keys(obj))
)

export function fetchProviders () {
  return (dispatch, getState) => {
    dispatch(fetchProvidersRequest())

    const state = getState().providers

    const stateProps = R.pick(
      ['term', 'providerState', 'minDischarges', 'maxDischarges', 'minAverageCoveredCharges', 'maxAverageCoveredCharges',
        'minAverageMedicarePayments', 'maxAverageMedicarePayments', 'resultStartIndex'], state)

    const nilPrunedParams = R.reject(R.anyPass([R.isNil, R.isEmpty]), { ...stateProps })

    if (!R.isEmpty(state['excludedFields'])) {
      const includedFields = R.reject(f => state['excludedFields'].includes(f), availableFields)
      nilPrunedParams['fields'] = R.join(',', includedFields)
    }

    const queryParams = renameKeys({
      minDischarges: 'min_discharges',
      maxDischarges: 'max_discharges',
      minAverageCoveredCharges: 'min_average_covered_charges',
      maxAverageCoveredCharges: 'max_average_covered_charges',
      minAverageMedicarePayments: 'min_average_medicare_payments',
      maxAverageMedicarePayments: 'max_average_medicare_payments',
      resultStartIndex: 'from',
      providerState: 'state'
    })(nilPrunedParams)

    return providers.search(queryParams)
      .then(res => {
        dispatch(fetchProvidersSuccess(res.data))
      })
      .catch(err => {
        message.error('Failed to retrieve providers :(')
        dispatch(fetchProvidersError(err))
      })
  }
}

const providersUpdater = type => payload => {
  return (dispatch, getState) => {
    dispatch({ type, payload })

    return fetchProviders()(dispatch, getState)
  }
}

export const updateTerm = providersUpdater(UPDATE_TERM)
export const selectProviderState = providersUpdater(SELECT_PROVIDER_STATE)
export const updateDischarges = providersUpdater(UPDATE_DISCHARGES)
export const updateCoveredCharges = providersUpdater(UPDATE_COVERED_CHARGES)
export const updateMedicarePayments = providersUpdater(UPDATE_MEDICARE_PAYMENTS)
export const excludeFields = providersUpdater(EXCLUDE_FIELDS)
export const flipPage = providersUpdater(FLIP_PAGE)
