import Auth0Lock from 'auth0-lock'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../config'

const { localStorage } = window

const options = {
  auth: {
    params: {
      scope: 'openid profile email'
    }
  },
  theme: {
    primaryColor: '#7EC0EE'
  },
  languageDictionary: {
    title: 'IPPS Providers'
  }
}

export const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, options)

export const getProfile = () => {
  const profile = localStorage.getItem('profile')
  return profile ? JSON.parse(localStorage.profile) : {}
}

export const setProfile = profile => {
  localStorage.setItem('profile', JSON.stringify(profile))
}

export const setToken = token => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const setTokenExpiry = tokenExpiry => {
  localStorage.setItem('tokenExpiry', tokenExpiry)
}

export const getTokenExpiry = () => {
  return localStorage.getItem('tokenExpiry')
}

export const isTokenExpired = () => {
  return Date.now() >= getTokenExpiry()
}

export const clearCredentials = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExpiry')
  localStorage.removeItem('profile')
}

export const authHeaders = () => {
  return {'Authorization': `Bearer ${getToken()}`}
}
