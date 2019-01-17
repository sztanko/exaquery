from os import environ
from werkzeug.wsgi import DispatcherMiddleware
from flask import Flask, request, send_from_directory
from timeline.timeline_app import app as timeline_app

# set the project root directory as the static folder, you can set others.
html_app = Flask(__name__, static_url_path="")

defaults = {"from_ts": "undefined", "to_ts": "undefined", "popup": "undefined"}
defaults = {'path': ''}
@html_app.route("/", defaults=defaults)
@html_app.route("/<path:path>")
def index(path):
    return send_from_directory(environ.get("HTML"), "index.html")


@html_app.route("/static/<path:path>")
def send_js(path):
    return send_from_directory(environ.get("HTML") + "/static", path)


app = Flask("main")
app.wsgi_app = DispatcherMiddleware(html_app, {"/api": timeline_app})

if __name__ == "__main__":
    app.run(host="0.0.0.0")
