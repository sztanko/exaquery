from flask import Flask
import sys
import ujson as json
from decorators.crossdomain import crossdomain
from flask import request
#from flask.ext.gzip import Gzip
from flask_compress import Compress
import datetime
import time
import sys
import os
import csv
import pyodbc
import uuid
import subprocess

app = Flask(__name__)


query_fields = ["session_id", "stmt_id", "command_name", "command_class", "duration", "start_time", "stop_time", "cpu", "temp_db_ram_peak", "hdd_read",
                "hdd_write", "net", "success", "error_code", "error_text", "scope_schema", "priority", "nice", "resources", "row_count", "execution_mode", "sql_text"]
session_fields = ["session_id", "login_time", "logout_time", "user_name", "client",
                  "driver", "encrypted", "host", "os_user", "os_name", "success", "error_code", "error_text"]
ts_fields = ['start_time', 'stop_time', 'login_time', 'logout_time']
bool_fields = ['success', 'encrypted']
user="user"
pwd="password"
exaplus_cmd = "/usr/local/bin/exaplus -u %s -p %s -c exasol.local:8563" % (user, pwd)

exaplus_cmd = "/usr/local/bin/exajload -u %s -P %s -c exasol.local:8563" % (user, pwd)

tmp_dir = '/local/tmp/'

date_format = '%Y-%m-%d %H:%M:%S.%f'
csv.field_size_limit(int(sys.maxsize/10))

def process_export_file(fName, fields):
    out = []
    origin = datetime.datetime(1970, 1, 1)
    with open(fName, 'rb') as csvfile:
        r = csv.reader(csvfile, delimiter='\t')
        fields_len = len(fields)
        for row in r:
            obj = {}
            for i in range(0, fields_len):
                fieldName = fields[i]
                v = row[i]
                if fieldName in ts_fields and len(v) > 0:
                    # print fieldName, v
                    # print row
                    t = datetime.datetime.strptime(v, date_format)
                    v = (t - origin).total_seconds()
                elif fieldName in bool_fields:
                    v = bool(int(v))
                elif fieldName is 'session_id':
                    v = str(v)
                obj[fieldName] = v
            out.append(obj)
    os.remove(fName)
    return out


def get_query(queryPack):
    start = time.time()
    query_file = '%s/exaquery_%s.sql' % (tmp_dir, str(uuid.uuid4()))
    pre_q = "alter session set NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF3'"
    for qq in queryPack:
        tmp_file = '%s/exaquery_%s.tsv' % (tmp_dir, str(uuid.uuid4()))
        qq['tmp_file'] = tmp_file
        q = "export (%s) into local CSV FILE '%s' column separator = 'TAB' BOOLEAN = '1/0' replace" % (
            qq['q'], tmp_file)
        cmd = "%s -presql \"%s\" -sql \"%s\"" %(exaplus_cmd, pre_q, q)
        print "executing %s" %(cmd)
        qq['p'] = subprocess.Popen(cmd, shell = True)
    for qq in queryPack:
        qq['p'].communicate()
    #os.system("%s -f %s" %(exaplus_cmd, query_file))
    # os.remove(query_file)
    out = []
    for qq in queryPack:
        out.append(process_export_file(qq['tmp_file'], qq['fields']))
    print "Done in %.3f seconds" % (time.time() - start)
    return out

def get_query_old(queryPack):
    start = time.time()
    query_file = '%s/exaquery_%s.sql' % (tmp_dir, str(uuid.uuid4()))
    pre_q = "alter session set NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF3'"
    for qq in queryPack:
        tmp_file = '%s/exaquery_%s.tsv' % (tmp_dir, str(uuid.uuid4()))
        qq['tmp_file'] = tmp_file
        q = "export (%s) into local CSV FILE '%s' column separator = 'TAB' BOOLEAN = '1/0' replace" % (
            qq['q'], tmp_file)
        sqlF.write("%s;\n" % (q))
# print "Connecting to exasol"
    #conn = connect()
    #cur = conn.cursor()
    # cur.execute(pre_q)
    # cur.execute(q)
    # conn.close()
    cmd = "%s -B %s" % (exaplus_cmd, query_file)
    print "Executing %s" % (cmd)
    # , stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    process = subprocess.Popen(cmd, shell=True)
    print "Opened cmd"
    # process.wait()
    process.communicate()
    print "Finished communicate"
    #os.system("%s -f %s" %(exaplus_cmd, query_file))
    # os.remove(query_file)
    out = []
    for qq in queryPack:
        out.append(process_export_file(qq['tmp_file'], qq['fields']))
    print "Done in %.3f seconds" % (time.time() - start)
    return out


def parseTs(ts):
    d = datetime.datetime.fromtimestamp(
        ts / 1000).strftime('%Y-%m-%d %H:%M:%S')
    ms = ts % 1000
    return "%s.%d" % (d, ms)


def to_json(from_ts, to_ts):
    # print sys.argv
    q = "select * from EXA_DBA_AUDIT_SQL where stop_time>='%s' and start_time<='%s'" % (
        parseTs(from_ts), parseTs(to_ts))
    #queries = get_query(q, query_fields)
    session_q = "select * from exa_dba_audit_sessions where session_id in (select session_id from exa_dba_audit_sql where stop_time>='%s' and start_time<='%s')" % (
        parseTs(from_ts), parseTs(to_ts))
    #sessions = get_query(session_q, session_fields)
    queries, sessions = get_query(
        [{'q': q, 'fields': query_fields}, {'q': session_q, 'fields': session_fields}])
    out = {'queries': queries, 'sessions': sessions}
    return json.dumps(out)


@app.route("/", methods=['GET'])
@crossdomain(origin="*")
def get():
    to_ts = int(float(time.time() * 1000))
    from_ts = to_ts - 3600000
    from_ts = int(float(request.args.get('from_ts', from_ts)))
    to_ts = int(float(request.args.get('to_ts', to_ts)))
    print "Requesting new data for period between %s and %s" % (from_ts, to_ts)
    out = to_json(from_ts, to_ts)
    print "Done with request"
    return out

gzapp = Compress(app)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=50020)
