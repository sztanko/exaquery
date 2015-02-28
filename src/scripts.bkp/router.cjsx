# Load css first thing. It gets injected in the <head> in a <style> element by
# the Webpack style-loader.
require '../../public/main.css'

React = require 'react'
# Assign React to Window so the Chrome React Dev Tools will work.
window.React = React

Router = require 'react-router'
Route = Router.Route
DefaultRoute = Router.DefaultRoute
ExaGraph = require './exastats'

# Require route components.
App = require './app'
#        <DefaultRoute handler={ExaGraph} />
#<Route name='graph' handler={ExaGraph} path="/graph" />
routes = (
    <Route handler={App}>
        <DefaultRoute handler={ExaGraph} />
        <Route name='graph' handler={ExaGraph} path="/graph/:fromTs/:toTs" />
    </Route>
)
Router.run(routes, (Handler, state) ->
  params = state.params
  React.render <Handler params={params}/>, document.body
)
