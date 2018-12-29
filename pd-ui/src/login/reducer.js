import {
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT_SUCCESS
} from './actions'
import { isTokenExpired, getProfile, getToken } from '../utils/AuthService'

export default function reducer (
  state = {
    authenticated: !isTokenExpired(),
    loading: false,
    profile: getProfile(),
    token: getToken(),
    errors: []
  },
  action
) {
  switch (action.type) {
    case LOGIN_SUCCESS: {
      const { profile, token } = action.payload
      return {
        ...state,
        profile,
        token,
        authenticated: true,
        loading: false
      }
    }

    case LOGIN_ERROR: {
      return {
        ...state,
        loading: false,
        errors: [action.payload],
        profile: {},
        token: null,
        authenticated: false
      }
    }

    case LOGOUT_SUCCESS: {
      return {
        ...state,
        profile: {},
        token: null,
        authenticated: false,
        loading: false
      }
    }
    default:
      return state
  }
}
