import reducer, { initState } from './reducer'
import {
  FETCH_PROVIDERS_SUCCESS,
  SELECT_PROVIDER_STATE,
  UPDATE_COVERED_CHARGES,
  UPDATE_DISCHARGES,
  UPDATE_MEDICARE_PAYMENTS,
  UPDATE_TERM,
  FLIP_PAGE
} from './actions'

describe('reducer', () => {
  it('handles fetch providers success correctly', () => {
    const payload = { providers: [{ a: 'foo' }], total: 50000 }
    const expectedState = {
      ...initState,
      providers: payload.providers,
      pagination: { ...initState.pagination, total: initState.maxTotal }
    }

    expect(reducer(undefined, { type: FETCH_PROVIDERS_SUCCESS, payload })).toEqual(expectedState)
  })

  it('handles select provider state correctly', () => {
    const payload = 'foo'
    const expectedState = {
      ...initState,
      providerState: payload
    }

    expect(reducer(undefined, { type: SELECT_PROVIDER_STATE, payload })).toEqual(expectedState)
  })

  it('handles updating discharges range correctly', () => {
    const minDischarges = 0
    const maxDischarges = 100
    const payload = [minDischarges, maxDischarges]
    const expectedState = {
      ...initState,
      minDischarges,
      maxDischarges
    }

    expect(reducer(undefined, { type: UPDATE_DISCHARGES, payload })).toEqual(expectedState)
  })

  it('handles updating covered charges range correctly', () => {
    const minAverageCoveredCharges = 1000
    const maxAverageCoveredCharges = 50000
    const payload = [minAverageCoveredCharges, maxAverageCoveredCharges]
    const expectedState = {
      ...initState,
      minAverageCoveredCharges,
      maxAverageCoveredCharges
    }

    expect(reducer(undefined, { type: UPDATE_COVERED_CHARGES, payload })).toEqual(expectedState)
  })

  it('handles updating medicare payments range correctly', () => {
    const minAverageMedicarePayments = 1000
    const maxAverageMedicarePayments = 50000
    const payload = [minAverageMedicarePayments, maxAverageMedicarePayments]
    const expectedState = {
      ...initState,
      minAverageMedicarePayments,
      maxAverageMedicarePayments
    }

    expect(reducer(undefined, { type: UPDATE_MEDICARE_PAYMENTS, payload })).toEqual(expectedState)
  })

  it('should reset pagination and result start index when search parameters are updated', () => {
    const payload = 'foo'
    const expectedTermState = {
      ...initState,
      term: payload
    }

    const expectProviderStateState = {
      ...initState,
      providerState: payload
    }

    const { pagination: initPagination } = initState
    const pagination = { ...initPagination, current: 4 }
    const currentState = { ...initState, pagination, resultStartIndex: 80 }

    expect(reducer(currentState, { type: UPDATE_TERM, payload })).toEqual(expectedTermState)
    expect(reducer(currentState, { type: SELECT_PROVIDER_STATE, payload })).toEqual(expectProviderStateState)
  })

  it('should reset pagination and result start index when range filters are updated', () => {
    const min = 0
    const max = 100

    const dischargesPayload = [min, max]
    const dischargesExpectedState = {
      ...initState,
      minDischarges: min,
      maxDischarges: max
    }

    const coveredChargesPayload = [min, max]
    const coveredChargesExpectedState = {
      ...initState,
      minAverageCoveredCharges: min,
      maxAverageCoveredCharges: max
    }

    const avgMedicarePayload = [min, max]
    const avgMedicareExpectedState = {
      ...initState,
      minAverageMedicarePayments: min,
      maxAverageMedicarePayments: max
    }

    const { pagination: initPagination } = initState
    const pagination = { ...initPagination, current: 4 }
    const currentState = { ...initState, pagination, resultStartIndex: 80 }

    expect(reducer(currentState, { type: UPDATE_DISCHARGES, payload: dischargesPayload }))
      .toEqual(dischargesExpectedState)

    expect(reducer(currentState, { type: UPDATE_COVERED_CHARGES, payload: coveredChargesPayload }))
      .toEqual(coveredChargesExpectedState)

    expect(reducer(currentState, { type: UPDATE_MEDICARE_PAYMENTS, payload: avgMedicarePayload }))
      .toEqual(avgMedicareExpectedState)
  })

  it('handles page flips correctly', () => {
    const resultStartIndex = 20
    const pagination = { a: 'foo' }
    const payload = { resultStartIndex, pagination }
    const expectedState = {
      ...initState,
      resultStartIndex,
      pagination
    }
    expect(reducer(undefined, { type: FLIP_PAGE, payload })).toEqual(expectedState)
  })
})
