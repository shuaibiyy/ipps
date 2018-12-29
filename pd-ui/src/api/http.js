import axios from 'axios'
import { API_URL } from '../config'
import { authHeaders } from '../utils/AuthService'

let instance = axios.create({
  baseURL: API_URL,
  headers: { ...authHeaders() }
})

export default instance
