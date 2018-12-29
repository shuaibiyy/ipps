import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Search from './search'
import ProvidersList from './table'
import FieldsSelector from './fields'
import * as actions from './actions'
import './index.css'

class Providers extends Component {
  static propTypes = {
    resultStartIndex: PropTypes.number.isRequired,
    providers: PropTypes.array.isRequired,
    term: PropTypes.string.isRequired,
    pagination: PropTypes.object.isRequired,
    excludedFields: PropTypes.array.isRequired,
    fetchProviders: PropTypes.func.isRequired,
    excludeFields: PropTypes.func.isRequired,
    updateTerm: PropTypes.func.isRequired,
    selectProviderState: PropTypes.func.isRequired,
    updateDischarges: PropTypes.func.isRequired,
    updateCoveredCharges: PropTypes.func.isRequired,
    updateMedicarePayments: PropTypes.func.isRequired,
    flipPage: PropTypes.func.isRequired
  }

  render () {
    return (
      <div>
        <Search
          term={this.props.term}
          updateTerm={this.props.updateTerm}
          selectProviderState={this.props.selectProviderState}
          updateDischarges={this.props.updateDischarges}
          updateCoveredCharges={this.props.updateCoveredCharges}
          updateMedicarePayments={this.props.updateMedicarePayments} />
        <FieldsSelector
          excludedFields={this.props.excludedFields}
          excludeFields={this.props.excludeFields} />
        <ProvidersList
          resultStartIndex={this.props.resultStartIndex}
          loading={this.props.loading}
          providers={this.props.providers}
          pagination={this.props.pagination}
          fetchProviders={this.props.fetchProviders}
          flipPage={this.props.flipPage} />
      </div>
    )
  }
}

export default connect(
  store => ({
    resultStartIndex: store.providers.resultStartIndex,
    providers: store.providers.providers,
    term: store.providers.term,
    loading: store.providers.loading,
    excludedFields: store.providers.excludedFields,
    pagination: store.providers.pagination
  }),
  { ...actions }
)(Providers)
