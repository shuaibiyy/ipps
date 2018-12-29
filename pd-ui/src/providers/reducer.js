import {
  FETCH_PROVIDERS_REQUEST,
  FETCH_PROVIDERS_SUCCESS,
  FETCH_PROVIDERS_ERROR,
  UPDATE_TERM,
  SELECT_PROVIDER_STATE,
  UPDATE_DISCHARGES,
  UPDATE_COVERED_CHARGES,
  UPDATE_MEDICARE_PAYMENTS,
  EXCLUDE_FIELDS,
  FLIP_PAGE
} from './actions'

export const initState = {
  errors: [],
  loading: false,
  providers: [],
  maxTotal: 10000,
  term: '',
  providerState: '',
  resultStartIndex: 0,
  excludedFields: [],
  pagination: {
    pageSize: 20,
    current: 1,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} providers`
  },
  minDischarges: null,
  maxDischarges: null,
  minAverageCoveredCharges: null,
  maxAverageCoveredCharges: null,
  minAverageMedicarePayments: null,
  maxAverageMedicarePayments: null
}

export default function reducer (state = initState, action = {}) {
  switch (action.type) {
    case FETCH_PROVIDERS_REQUEST: {
      return { ...state, loading: true, errors: [] }
    }

    case FETCH_PROVIDERS_SUCCESS: {
      const { total, providers } = action.payload
      const { pagination, maxTotal } = state
      return { ...state, loading: false, providers, pagination: { ...pagination, total: Math.min(maxTotal, total) } }
    }

    case FETCH_PROVIDERS_ERROR: {
      return { ...state, loading: false, errors: [action.payload] }
    }

    case UPDATE_TERM: {
      const { pagination } = state
      return {
        ...state,
        term: action.payload,
        pagination: { ...pagination, current: 1 },
        resultStartIndex: 0
      }
    }

    case SELECT_PROVIDER_STATE: {
      const { pagination } = state
      return {
        ...state,
        providerState: action.payload,
        pagination: { ...pagination, current: 1 },
        resultStartIndex: 0
      }
    }

    case UPDATE_DISCHARGES: {
      const { pagination } = state
      return {
        ...state,
        minDischarges: action.payload[0],
        maxDischarges: action.payload[1],
        pagination: { ...pagination, current: 1 },
        resultStartIndex: 0
      }
    }

    case UPDATE_COVERED_CHARGES: {
      const { pagination } = state
      return {
        ...state,
        minAverageCoveredCharges: action.payload[0],
        maxAverageCoveredCharges: action.payload[1],
        pagination: { ...pagination, current: 1 },
        resultStartIndex: 0
      }
    }

    case UPDATE_MEDICARE_PAYMENTS: {
      const { pagination } = state
      return {
        ...state,
        minAverageMedicarePayments: action.payload[0],
        maxAverageMedicarePayments: action.payload[1],
        pagination: { ...pagination, current: 1 },
        resultStartIndex: 0
      }
    }

    case EXCLUDE_FIELDS: {
      return { ...state, excludedFields: action.payload }
    }

    case FLIP_PAGE: {
      const { resultStartIndex, pagination } = action.payload
      return { ...state, resultStartIndex, pagination }
    }

    default:
      return state
  }
}
