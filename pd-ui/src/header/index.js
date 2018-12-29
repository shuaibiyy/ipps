import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Layout from 'antd/lib/layout'
import Button from 'antd/lib/button'
import Avatar from 'antd/lib/avatar'
import { logout } from '../login/actions'
import * as layoutActions from '../layout/actions'

const { Header: AntHeader } = Layout

class Header extends Component {
  static propTypes = {
    profile: PropTypes.object
  }

  render () {
    if (this.props.profile) {
      return (
        <AntHeader style={{ background: '#fff', padding: 0 }}>
          <div style={{ float: 'right' }}>
            <span style={{ marginRight: '15px' }}>
              {this.props.profile.name}
            </span>
            <Button onClick={this.props.logout} style={{ marginRight: '15px' }}>Logout</Button>
          </div>
          <Avatar
            icon='user'
            src={this.props.profile.picture}
            style={{ float: 'right', marginRight: '10px', marginTop: '15px', backgroundColor: '#bacade' }} />
        </AntHeader>
      )
    }

    return <div />
  }
}

export default connect(
  store => ({
    profile: store.auth.profile,
    authenticated: store.auth.authenticated
  }), { logout, ...layoutActions }
)(Header)
