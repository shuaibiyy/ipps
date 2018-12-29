import { createAction } from 'redux-actions'
import message from 'antd/lib/message'

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_ERROR = 'LOGIN_ERROR'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'

export const loginSuccess = createAction(LOGIN_SUCCESS)
export const loginError = createAction(LOGIN_ERROR)
export const logoutSuccess = createAction(LOGOUT_SUCCESS)

export function logout () {
  return dispatch => {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('tokenExpiry')
    window.localStorage.removeItem('profile')
    message.info('Logged out')
    dispatch(logoutSuccess())
  }
}
