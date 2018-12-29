import { createAction } from 'redux-actions'

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
export const SET_MODE = 'SET_MODE'

export const toggleSidebar = createAction(TOGGLE_SIDEBAR)
export const setMode = createAction(SET_MODE)
