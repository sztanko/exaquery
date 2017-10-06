import React from 'react';

const QueryPopup = React.createClass({
  displayName: 'Query',
  //scale: d3.scale.category20().domain(["COMMIT", "SELECT", "OPEN SCHEMA", "ROLLBACK", "TRUNCATE TABLE", "INSERT", "DELETE", "ALTER SESSION", "FLUSH STATISTICS", "DROP TABLE", "IMPORT", "CREATE TABLE", "NOT SPECIFIED", "GRANT OBJECT", "DESCRIBE", "DROP VIEW", "CREATE VIEW", "EXPORT", "MERGE", "NO OP", "UPDATE"])
  zoomToSession() {
    const end_time = this.props.data.session.logout_time
      ? this.props.data.session.logout_time * 1000
      : this.props.data.stop_time;
    return this.props.zoomTo(
      this.props.data.session.login_time * 1000,
      end_time,
      true
    );
  },
  zoomToStmt() {
    return this.props.zoomTo(
      this.props.data.start_time,
      this.props.data.stop_time,
      true
    );
  },
  render() {
    let durStr;
    const tf = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
    let sql_text = 'text';
    let error = null;
    const msFormat = d3.format('0,000');
    const dur = this.props.data.stop_time - this.props.data.start_time;
    let offsetFromSessionStart = 0;
    if (dur < 60000) {
      durStr = msFormat(dur) + ' ms';
    } else {
      durStr = moment.duration(dur).humanize();
    }

    if (this.props.data.sql_text) {
      ({ sql_text } = this.props.data);
    }
    if (this.props.data.error_code) {
      error = (
        <code className="errorMsg">
          {this.props.data.error_code}: {this.props.data.error_text}
        </code>
      );
    }
    let owners = null;
    if (this.props.data.session) {
      offsetFromSessionStart =
        this.props.data.start_time - this.props.data.session.login_time * 1000;
      owners = (
        <div className="owners">
          {this.props.data.session.user_name} from{' '}
          {this.props.data.session.os_user}@{this.props.data.session.host} ({this.props.data.session.client},{' '}
          {this.props.data.session.os_name})
        </div>
      );
    }
    if (this.props.simplifiedView) {
      return (
        <div className="query">
          <div className="sessionId">
            Stmt{' '}
            <a href="javascript:void()" onClick={this.zoomToStmt}>
              {this.props.data.stmt_id}
            </a>
          </div>
          <div className="queryInfo">
            Class:{' '}
            <code className={this.props.data.command_class}>
              {this.props.data.command_class}: {this.props.data.command_name}
            </code>
          </div>
          <div className="timeInfo">
            Started: <code>{tf(new Date(this.props.data.start_time))}</code>,{' '}
            <code>{msFormat(offsetFromSessionStart)} ms</code>
            {` from session start, \
`}
            <br />Ended: <code>{tf(new Date(this.props.data.stop_time))}</code>,
            Duration: <code>{durStr}</code>
          </div>
          {error}
          <code className="sql">{sql_text}</code>
        </div>
      );
    }
    return (
      <div className="query">
        <div className="sessionId">
          <a href="javascript:void()" onClick={this.zoomToSession}>
            {this.props.data.session_id}
          </a>, statement{' '}
          <a href="javascript:void()" onClick={this.zoomToStmt}>
            {this.props.data.stmt_id}
          </a>
        </div>
        <div className="queryInfo">
          Class:{' '}
          <code className={this.props.data.command_class}>
            {this.props.data.command_class}: {this.props.data.command_name}
          </code>
        </div>
        {owners}
        <div className="timeInfo">
          Started: <code>{tf(new Date(this.props.data.start_time))}</code>,{' '}
          <code>{msFormat(offsetFromSessionStart)} ms</code>
          {` from session start, \
`}
          <br />Ended: <code>{tf(new Date(this.props.data.stop_time))}</code>,
          Duration: <code>{durStr}</code>
        </div>
        {error}
        <code className="sql">{sql_text}</code>
      </div>
    );
  }
});

export default QueryPopup;
