import { combineReducers } from 'redux'
import layout from '../layout/reducer'
import auth from '../login/reducer'
import providers from '../providers/reducer'

export default combineReducers({
  auth,
  layout,
  providers
})
