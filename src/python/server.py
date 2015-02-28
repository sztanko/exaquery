from flask import Flask
import sys
import yaml
import ujson as json
from decorators.crossdomain import crossdomain
from flask import request
import datetime
import time
import sys
import logging
from biutils import sql
from biutils.utils import load_env
import biutils.logconfig


app = Flask(__name__)

env_file = "/Users/demetersztanko/.kettle/script.properties"

def parseTs(ts):
    d = datetime.datetime.fromtimestamp(
        ts / 1000).strftime('%Y-%m-%d %H:%M:%S')
    ms = ts % 1000
    return "%s.%d" % (d, ms)

log = logging.getLogger("exasquery server")
def to_json(from_ts, to_ts):
    load_env(env_file)
    ex = sql.Exasol()
    # print sys.argv

    def exe(q, fieldStr, sep=' '):
        fields = fieldStr.lower().split(sep)
        out = []
        for row in ex.select(q):
            row = [float(o.strftime('%s')) + o.microsecond /
                   1e6 if isinstance(o, datetime.datetime) else o for o in row]
            out.append(dict(zip(fields, row)))
        return out
    q = "select * from EXA_DBA_AUDIT_SQL where stop_time>='%s' and start_time<='%s'" % (
        parseTs(from_ts), parseTs(to_ts))
    fields = "SESSION_ID STMT_ID COMMAND_NAME COMMAND_CLASS START_TIME STOP_TIME CPU TEMP_DB_RAM_PEAK HDD_IN HDD_OUT NET SUCCESS ERROR_CODE ERROR_TEXT SCOPE_SCHEMA PRIORITY NICE RESOURCES SQL_TEXT"
    queries = exe(q, fields)
    session_q = "select * from exa_dba_audit_sessions where logout_time>'%s' and login_time<'%s'" % (
        parseTs(from_ts), parseTs(to_ts))
    session_fields = "SESSION_ID LOGIN_TIME LOGOUT_TIME USER_NAME CLIENT DRIVER HOST OS_USER OS_NAME SUCCESS ERROR_CODE ERROR_TEXT"

    sessions = exe(session_q, session_fields)

    out = {'queries': queries, 'sessions': sessions}
    ex.close()
    return json.dumps(out)#, use_decimal=True)


@app.route("/", methods=['GET'])
@crossdomain(origin="*")
def get():
    to_ts = int(float(time.time() * 1000))
    from_ts = to_ts - 3600000
    from_ts = int(float(request.args.get('from_ts', from_ts)))
    to_ts = int(float(request.args.get('to_ts', to_ts)))
    log.info("Requesting new data for period between %s and %s" %(from_ts, to_ts))
    out = to_json(from_ts, to_ts)
    log.info("Done with request")
    return out

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=5002)
