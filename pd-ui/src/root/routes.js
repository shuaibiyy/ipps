import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Layout from '../layout'

const Routes = () => (
  <Switch>
    <Route path='/provider' component={Layout} />
    <Route component={Layout} />
  </Switch>
)

export default Routes
