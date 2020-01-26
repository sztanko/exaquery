import React from "react";
import moment from "moment-es6";
import _ from 'lodash';
import "moment-precise-range-plugin";
import ReactTable from "react-table";
import DataTable from "react-data-table-component";
import "react-table/react-table.css";
import "./QueryInfo.scss";
import { duration } from "moment";


//const FIELDS = { SESSION_ID: { title: "Session id", component: null } };

function writePre(query) {
  if (query) {
    return query.split("\n").map((line, i) => <code key={i}>{line}</code>);
  } else return [];
}

function showQueryInfo(d) {
  const startTime = moment(d.START_TIME);
  const stopTime = moment(d.STOP_TIME);
  const adjustedQueryDuration = d.DURATION
    ? (d.DURATION * d.RESOURCES) / 100
    : 0;
  const adjustedStopTime = moment(d.START_TIME);
  adjustedStopTime.add(adjustedQueryDuration, "seconds");
  const now = moment();
  return (
    <dl className="queryInfo">
      <dt>Class</dt>
      <dd className={`command_class ${d.COMMAND_CLASS}`}>
        <tt>{d.COMMAND_CLASS}</tt>
      </dd>
      <dt>Name</dt>
      <dd className={`command_name ${d.COMMAND_NAME}`}>
        <tt>{d.COMMAND_NAME}</tt>
      </dd>
      <dt>Success</dt>
      <dd className="query_SUCCESS">
        <tt>{d.SUCCESS ? "YES" : "NO"}</tt>
      </dd>
      <dt>Start</dt>
      <dd className="query_start">
        <tt>{d.START_TIME}</tt>, {startTime.preciseDiff(now)} ago
      </dd>
      <dt>End</dt>
      <dd className="query_end">
        <tt>{d.STOP_TIME}</tt>, {stopTime.preciseDiff(now)} ago
      </dd>
      <dt>Duration</dt>
      <dd className="query_duration">
        <tt>{d.DURATION ? d.DURATION.toLocaleString() : "0"}</tt> seconds (
        {startTime.preciseDiff(stopTime)})
      </dd>
      <dt>Potential Duration</dt>
      <dd className="adjusted_query_duration">
        <tt>{adjustedQueryDuration.toLocaleString()}</tt> seconds (
        {startTime.preciseDiff(adjustedStopTime)})
      </dd>
      <dt>Row Count</dt>
      <dd className="row_count">
        {d.ROW_COUNT ? d.ROW_COUNT.toLocaleString() : "-"}
      </dd>
      <dt>Execution mode</dt>
      <dd className="execution_mode">{d.EXECUTION_MODE}</dd>
      <dt>Priority</dt>
      <dd className="query_priority">{d.PRIORITY}</dd>
    </dl>
  );
}
function showResourceInfo(d) {
  const hddReadClasses = "hdd_read" + (+d.HDD_READ > 0? " real_read":"")
  return (
    <dl className="resourceInfo">
      <dt>Resources</dt>
      <dd className="resources">
        <tt>{d.RESOURCES}</tt>
      </dd>
      <dt>CPU</dt>
      <dd className="cpu">
        <tt>{d.CPU}</tt>
      </dd>
      <dt>HDD Read</dt>
      <dd className={hddReadClasses}>
        <tt>{d.HDD_READ}</tt>
      </dd>
      <dt>HDD Write</dt>
      <dd className="hdd_write">
        <tt>{d.HDD_WRITE}</tt>
      </dd>
      <dt>Net</dt>
      <dd className="net">
        <tt>{d.NET}</tt>
      </dd>
      <dt>Persistant RAM Peak</dt>
      <dd className="p_db_ram_peak">
        <tt>{d.PERSISTENT_DB_RAM_PEAK}</tt>
      </dd>
      <dt>Temporary RAM Peak</dt>
      <dd className="t_db_ram_peak">
        <tt>{d.TEMP_DB_RAM_PEAK}</tt>
      </dd>
    </dl>
  );
}

/*
{
#CLIENT: "PyEXASOL 0.5.1"
#DRIVER: "PyEXASOL 0.5.1 "
# ENCRYPTED: false
# HOST: "10.132.0.14"
LOGIN_TIME: "2019-01-02 21:38:32.620000"
LOGOUT_TIME: "2019-01-02 21:38:40.634000"
# OS_NAME: "Linux-4.4.111+-x86_64-with-debian-9.6"
# OS_USER: "root"
# SCOPE_SCHEMA: null
SESSION_SUCCESS: true
# USER_NAME: "APOLLO"
} */

function showSessionInfo(d) {
  const startTime = moment(d.LOGIN_TIME);
  const stopTime = moment(d.LOGOUT_TIME);

  return (
    <dl className="sessionInfo">
      <dt>User Name</dt>
      <dd className="user_name">
        <tt>{d.USER_NAME}</tt>
      </dd>
      <dt>Host</dt>
      <dd className="host">
        <tt>{d.HOST}</tt>
      </dd>
      <dt>OS User</dt>
      <dd className="os_user">
        <tt>{d.OS_USER}</tt>
      </dd>
      <dt>Client</dt>
      <dd className="client">
        <tt>{d.CLIENT}</tt>
      </dd>
      <dt>Driver</dt>
      <dd className="driver">
        <tt>{d.DRIVER}</tt>
      </dd>
      <dt>OS</dt>
      <dd className="os">
        <tt>{d.OS_NAME}</tt>
      </dd>
      <dt>Encrypted</dt>
      <dd className="encrypted">
        <tt>{d.ENCRYPED ? "YES" : "NO"}</tt>
      </dd>
      <dt>Scope Schema</dt>
      <dd className="scope_schema">
        <tt>{d.SCOPE_SCHEMA}</tt>
      </dd>
      <dt>Session login successfull?</dt>
      <dd className="session_success">
        <tt>{d.SESSION_SUCCESS ? "YES" : "NO"}</tt>
      </dd>
      <dt>Session Start</dt>
      <dd className="query_start">
        <tt>{d.LOGIN_TIME}</tt>, {startTime.fromNow()}
      </dd>
      <dt>End</dt>
      <dd className="query_end">
        <tt>{d.LOGOUT_TIME}</tt>, {stopTime.fromNow()}
      </dd>
    </dl>
  );
}

function showQuery(d) {
  const error_text = d.ERROR_TEXT ? (
    <div className="Error">
      <dt>Error code</dt>
      <dd>
        <tt>{d.ERROR_CODE}</tt>
      </dd>
      <pre className="error_text">{writePre(d.ERROR_TEXT)}</pre>
    </div>
  ) : null;
  return (
    <div className="query">
      <pre className="sql_text">{writePre(d.SQL_TEXT)}</pre>
      {error_text}
    </div>
  );
}

function showProfiling(p) {

  const durationThreshold =  _(p).map(d => +d.DURATION).max()
  

  const conditionalRowStyles = [
    {
      when: row => +row.DURATION < 0.05 && +row.DURATION < 0.1 * durationThreshold,
      style: {color: '#555'},
    },
    
    {
      when: row => +row.DURATION > 0.3,
      style: {backgroundColor: '#FFF8F8'},
    },
    {
      when: row => +row.DURATION > 1,
      style: {backgroundColor: '#FFEEEE'},
    },
    {
      when: row => +row.DURATION > 1 && row.REMARKS === 'ExpressionIndex',
      style: {color: 'red'},
    },
    {
      when: row => { 
        if(!row.PART_INFO) return false;
        const in_rows = +row.IN_ROWS;
        const out_rows = +row.OUT_ROWS;
        // console.debug(row);
        return (row.PART_INFO.includes('NL ') && in_rows>100 && out_rows >= in_rows * in_rows / 100)
      },
      style: {color: 'red'},
    },
    {
      when: row => durationThreshold>1 && +row.DURATION > 0.5 *durationThreshold,
      style: {backgroundColor: '#FFC3C3'},
    },
    {
      when: row => durationThreshold>1 && +row.DURATION >= 0.95 * durationThreshold,
      style: {backgroundColor: '#FFADAD'},
    },
    
  ];

  const columns = [
    {
      name: "#",
      selector: "PART_ID",
      width: '20px',
      style: {color: 'grey'},
      sortable: true
    },
    {
      name: "Time",
      // id: "duration",
      selector: d => +d.DURATION,
      width: '60px',
      sortable: true
    },
    {
      name: "Name",
      selector: "PART_NAME",
      width: '140px',
      sortable: true
    },
    {
      name: "Info",
      selector: "PART_INFO",
      width: '200px',
      sortable: true
    },
    {
      name: "Object",
      selector: "OBJECT_NAME",
      width: '150px',
      sortable: true
    },
    {
      name: "In",
      selector: d => +d.IN_ROWS,
      width: '80px',
      format: props => (+props.IN_ROWS).toLocaleString(),
      sortable: true
      // Cell: props => {props.value.toLocaleString()}
    },
    {
      name: "Out",
      selector: d => +d.OUT_ROWS,
      width: '80px',
      format: props => (+props.OUT_ROWS).toLocaleString(),
      sortable: true
      //Cell: props => {props.value.toLocaleString()}
    },
    {
      Header: "Remarks",
      selector: "REMARKS",
      sortable: true
    }
  ];
  return (
    <DataTable
    title="Profile"
    columns={columns}
    data={p}
    fixedHeader
    fixedHeaderScrollHeight="500px"
    conditionalRowStyles={conditionalRowStyles}
  />
    
  );
}

function StmInfo(props) {
  const info = props.info;
  return (
    <div className="QueryInfo">
      <h1>
        Session {info.SESSION_ID}, #{info.STMT_ID}{" "}
      </h1>
      {showQueryInfo(info)}
      {showSessionInfo(info)}
      {showResourceInfo(info)}
      {showQuery(info)}
    </div>
  );
}

function showInfo(props) {
  // console.log(props);
  const data = props.data;
  if (_.isEmpty(data)) {
    return <div>Loading info</div>;
  }
  if (_.size(data.info) === 0) {
    return (
      <div>
        No info. This is a group of queries. Zoom in to get individual
        statements.
      </div>
    );
  }
  const profiling = data.profile ? (
    <div className="profile">
      {showProfiling(data.profile)}
    </div>
  ) : null;

  return (
    <div>
      <StmInfo info={data.info[0]} />
      {profiling}
    </div>
  );
}

export default showInfo;
