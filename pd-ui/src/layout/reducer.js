import {
  SET_MODE,
  TOGGLE_SIDEBAR
} from './actions'

export const initState = {
  collapsed: true,
  mode: 'inline'
}

export default function reducer (state = initState, action = {}) {
  switch (action.type) {
    case TOGGLE_SIDEBAR: {
      return { ...state, collapsed: action.payload }
    }

    case SET_MODE: {
      return { ...state, mode: action.payload ? 'vertical' : 'inline' }
    }

    default:
      return state
  }
}
