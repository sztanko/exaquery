import simplejson as json
import sys
from biutils import sql
from biutils.utils import load_env
import biutils.logconfig
import datetime

load_env("/Users/demetersztanko/.kettle/script.properties")
ex = sql.Exasol()

#print sys.argv
limit_days = 1
limit = int(sys.argv[1])

def exe(q, fieldStr, sep=' '):
    fields = fieldStr.lower().split(sep)
    out = []
    for row in ex.select(q):
        row = [ float(o.strftime('%s')) + o.microsecond/1e6 if isinstance(o, datetime.datetime) else o for o in row]
        out.append(dict(zip(fields, row)))
    return out

q="select * from EXA_DBA_AUDIT_SQL where start_time>now() - interval '%d' day order by start_time desc limit %d" %(limit_days, limit)
fields = "SESSION_ID STMT_ID COMMAND_NAME COMMAND_CLASS START_TIME STOP_TIME CPU TEMP_DB_RAM_PEAK HDD_IN HDD_OUT NET SUCCESS ERROR_CODE ERROR_TEXT SCOPE_SCHEMA PRIORITY NICE RESOURCES SQL_TEXT"

queries = exe(q, fields)
session_q = "select * from exa_dba_audit_sessions where login_time>now() - interval '%d' day order by login_time desc limit %d" %(limit_days, limit)
session_fields ="SESSION_ID LOGIN_TIME LOGOUT_TIME USER_NAME CLIENT DRIVER HOST OS_USER OS_NAME SUCCESS ERROR_CODE ERROR_TEXT"

sessions = exe(session_q, session_fields)

out = {'queries': queries, 'sessions': sessions}

print json.dumps(out, use_decimal=True)
