import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Root from './root'
import configureStore from './store'
import registerServiceWorker from './registerServiceWorker'
import 'antd/dist/antd.css'

const store = configureStore()

render(
  <Router>
    <Root store={store} />
  </Router>,
  document.getElementById('root')
)

registerServiceWorker()
