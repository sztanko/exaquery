QueryPopup = React.createClass
    displayName: 'Query'
    #scale: d3.scale.category20().domain(["COMMIT", "SELECT", "OPEN SCHEMA", "ROLLBACK", "TRUNCATE TABLE", "INSERT", "DELETE", "ALTER SESSION", "FLUSH STATISTICS", "DROP TABLE", "IMPORT", "CREATE TABLE", "NOT SPECIFIED", "GRANT OBJECT", "DESCRIBE", "DROP VIEW", "CREATE VIEW", "EXPORT", "MERGE", "NO OP", "UPDATE"])
    zoomToSession: ()->
        end_time = if @props.data.session.logout_time then @props.data.session.logout_time*1000 else @props.data.stop_time
        @props.zoomTo(@props.data.session.login_time * 1000, end_time, true)
    zoomToStmt: ()->
        @props.zoomTo(@props.data.start_time, @props.data.stop_time, true)
    render: () ->
        tf = d3.time.format('%Y-%m-%d %H:%M:%S.%L')
        sql_text = "text"
        error = null
        msFormat = d3.format("0,000")
        dur = @props.data.stop_time-@props.data.start_time
        offsetFromSessionStart = 0
        if dur<60000
            durStr = msFormat(dur) + " ms"
        else
            durStr = moment.duration(dur).humanize()
        
        if @props.data.sql_text
            sql_text = @props.data.sql_text
        if @props.data.error_code
            error = <code className='errorMsg'>{@props.data.error_code}: {@props.data.error_text}</code>
        owners = null
        if @props.data.session
            offsetFromSessionStart = @props.data.start_time - @props.data.session.login_time * 1000
            owners = (<div className='owners'>{@props.data.session.user_name} from {@props.data.session.os_user}@{@props.data.session.host} ({@props.data.session.client}, {@props.data.session.os_name})</div>)
        if @props.simplifiedView
            return <div className="query"><div className="sessionId">Stmt <a href='javascript:void()' onClick={@zoomToStmt}>{@props.data.stmt_id}</a></div>
                <div className="queryInfo">Class: <code className={@props.data.command_class}>{@props.data.command_class}: {@props.data.command_name}</code></div>
                <div className='timeInfo'>Started: <code>{tf(new Date(@props.data.start_time))}</code>, <code>{msFormat(offsetFromSessionStart)} ms</code> from session start, 
                    <br/>Ended: <code>{tf(new Date(@props.data.stop_time))}</code>, Duration: <code>{durStr}</code></div>
                {error}
                <code className='sql'>{sql_text}</code>
                </div>    
        return <div className="query"><div className="sessionId"><a href='javascript:void()' onClick={@zoomToSession}>{@props.data.session_id}</a>, statement <a href='javascript:void()' onClick={@zoomToStmt}>{@props.data.stmt_id}</a></div>
                <div className="queryInfo">Class: <code className={@props.data.command_class}>{@props.data.command_class}: {@props.data.command_name}</code></div>
                {owners}
                <div className='timeInfo'>Started: <code>{tf(new Date(@props.data.start_time))}</code>, <code>{msFormat(offsetFromSessionStart)} ms</code> from session start, 
                    <br/>Ended: <code>{tf(new Date(@props.data.stop_time))}</code>, Duration: <code>{durStr}</code></div>

                {error}
                <code className='sql'>{sql_text}</code>
                </div>

module.exports = QueryPopup