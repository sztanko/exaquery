import os

# import sys
import threading
import time
from flask import Flask, jsonify, current_app, request, abort, g
from flask_cors import CORS
from flask_caching import Cache
from jinja2 import Environment
import pyexasol
from timeline.config import load_config, get_logger
from timeline.query_generator import gen_export, process_resultset


DEFAULT_TIME = 3600
DEFAULT_GRANULARITY = 150
DEFAULT_THRESHOLD = 10
CONFIG_PATH = "config/"

app = Flask(__name__)
CORS(app)
cache = Cache(app, config={"CACHE_TYPE": "simple"})


log = get_logger()
settings = {}


def get_db():
    log.info("Connecting to Exasol")
    dsn = os.environ.get("HOST", "127.0.0.1:8888")
    user = os.environ.get("USER", "sys")
    db = pyexasol.connect(
        dsn=dsn,
        user=user,
        password=os.environ.get("PASSWORD", "exasol"),
        debug=False,
        fetch_dict=True,
        socket_timeout=30,
    )
    log.info("Connected successfully to %s, user %s", dsn, user)
    return db


def execute(q):
    connection = g.get("db")
    if not connection:
        log.info("NO CONNECTION")
        connection = get_db()
        g.db = connection
    try:
        stm = connection.execute(q)
        if stm.rowcount() > 0:
            return stm.fetchall()
        return []
    except:
        connection = get_db()
        g.db = connection
        stm = connection.execute(q)
        if stm.rowcount() > 0:
            return stm.fetchall()
        return []


def get_config() -> pyexasol.ExaConnection:
    log.info("Querying for config")
    config_path = os.environ.get("CONFIG_PATH", CONFIG_PATH)
    log.info("Loading config from %s", config_path)
    conf = dict(load_config(config_path))
    log.info("Loaded %d configs: %s", len(conf), ", ".join(conf.keys()))
    return conf


config = get_config()


@app.route("/<config_name>/")
@cache.cached(timeout=600, query_string=True)
def get(config_name):
    log.info("Getting data for config %s", config_name)
    start_time = float(request.args.get("from", time.time() - DEFAULT_TIME))
    stop_time = float(request.args.get("to", time.time()))
    q = (request.args.get("q", "") or "").lower()
    if "." in config_name:
        abort(404)
    params = config.get(config_name)
    if not params:
        log.warning("Could not find config %s", config_name)
        abort(404)
    params["start_time"] = start_time
    params["stop_time"] = stop_time
    params["q"] = q
    q = gen_export(
        params.get("base"),
        start_time,
        stop_time,
        params.get("granularity", DEFAULT_GRANULARITY),
        params.get("threshold", DEFAULT_THRESHOLD),
        params,

    )
    log.info(q)
    t0 = time.time()
    execute("FLUSH STATISTICS")
    result = execute(q)
    t1 = time.time()
    log.info("Retrieved %d results in %.03f sec", len(result), (t1 - t0))
    return jsonify(sql=q, result=list(process_resultset(result, start_time, stop_time)))


@app.route("/<config_name>/info")
@cache.cached(timeout=600, query_string=True)
def get_info(config_name):
    box_id = request.args.get("id")
    log.info("Getting data for config %s, id %s", config_name, id)
    if "." in config_name:
        abort(404)
    params = config.get(config_name)
    if not params:
        log.warning("Could not find config %s", config_name)
        abort(404)
    params["box_id"] = box_id
    out = {}
    jinja_environment = Environment()
    t0 = time.time()
    for k, v in params["info"].items():
        log.info("Querying %s", k)
        sql = jinja_environment.from_string(v).render(params)
        log.info(sql)
        out[k] = execute(sql)
    t1 = time.time()
    log.info("Retrieved info in %.03f sec", (t1 - t0))
    return jsonify(result=out)
