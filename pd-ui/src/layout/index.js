import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import AntLayout from 'antd/lib/layout'
import * as actions from './actions'
import Providers from '../providers'
import Header from '../header'
import http from '../api/http'
import {
  getProfile,
  getTokenExpiry,
  getToken,
  setTokenExpiry,
  setProfile,
  setToken,
  lock,
  clearCredentials,
  authHeaders
} from '../utils/AuthService'
import { logout, loginSuccess, loginError } from '../login/actions'
import './index.css'

const { Content, Footer } = AntLayout

export class Layout extends Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    logout: PropTypes.func.isRequired,
    loginError: PropTypes.func.isRequired,
    loginSuccess: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    http.interceptors.response.use(response => {
      return response
    }, error => {
      if (error.response.status === 401) {
        props.logout()
      }
      return Promise.reject(error)
    })
  }

  initAuth (loginSuccess, loginError, history) {
    lock.on('authenticated', ({ accessToken, idToken, expiresIn }) => {
      lock.getUserInfo(accessToken, (error, profile) => {
        if (error) {
          return loginError(error)
        }
        const tokenExpiry = Date.now() + expiresIn * 1000
        setTokenExpiry(tokenExpiry)
        setToken(idToken)
        setProfile(profile)

        http.defaults.headers = { ...authHeaders() }

        loginSuccess({ idToken, profile })
        history.push({ pathname: '/providers' })
        lock.hide()
      })
    })

    lock.on('authorization_error', error => {
      loginError(error)
      lock.show()
    })

    const token = getToken()
    const tokenExpiry = getTokenExpiry()
    const profile = getProfile()

    if (!!token && Date.now() <= tokenExpiry) {
      loginSuccess({ token, profile })
    } else {
      clearCredentials()
      lock.show()
    }
  }

  componentWillMount () {
    const { loginSuccess, loginError, history } = this.props
    this.initAuth(loginSuccess, loginError, history)
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.authenticated) {
      clearCredentials()
      lock.show()
    }
  }

  renderContent = ({ match: { url } }) => {
    return (
      <div>
        <Switch>
          <Route
            exact
            component={Providers}
            path={`${url}/providers`} />
          <Route component={Providers} />
        </Switch>
      </div>
    )
  }

  render () {
    if (!this.props.authenticated) {
      return null
    }
    return (
      <AntLayout style={{ minHeight: '100vh' }}>
        <Header />
        <Content>
          <AntLayout style={{ background: '#fff' }}>
            <Content style={{ padding: '0 24px', minHeight: 'calc(100vh - 225px)' }}>
              <h1 style={{ color: '#314659' }}>IPPS Providers</h1>
              <div>
                {this.renderContent(this.props)}
              </div>
            </Content>
          </AntLayout>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          IPPS Providers ©2018
        </Footer>
      </AntLayout>
    )
  }
}

export default connect(
  store => ({
    authenticated: store.auth.authenticated
  }),
  { ...actions, logout, loginSuccess, loginError }
)(Layout)
