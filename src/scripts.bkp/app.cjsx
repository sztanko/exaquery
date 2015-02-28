Link = require('react-router').Link
RouteHandler = require('react-router').RouteHandler

# Provides global navigation for app e.g. the "Hello | Styleguide" at the top.
# <header><Link to="graph">Exagraph</Link></header>
module.exports = React.createClass
  displayName: 'Exagraph'
  render: ->
    <div>
      <RouteHandler {...@props} /> 
    </div>
