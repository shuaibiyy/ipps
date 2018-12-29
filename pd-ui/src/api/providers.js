import http from './http'

const path = '/api/providers'

export default {
  search (params) {
    return http({
      method: 'GET',
      url: path,
      params
    })
  }
}
