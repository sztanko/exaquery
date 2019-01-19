from os import environ
from os.path import abspath
from werkzeug.wsgi import DispatcherMiddleware
from flask import Flask, request, send_from_directory, send_file
from timeline.timeline_app import app as timeline_app

# set the project root directory as the static folder, you can set others.
html_app = Flask(__name__, static_folder=None)  # , static_url_path="")

defaults = {"path": ""}


@html_app.route("/", defaults=defaults)
@html_app.route("/<path:path>")
def index(path):
    print(path)
    if path.startswith("static"):
        p = abspath(environ.get("HTML") + "/" + path)
        return send_file(p)
    return send_from_directory(environ.get("HTML"), "index.html")


app = Flask("main")
app.wsgi_app = DispatcherMiddleware(html_app, {"/api": timeline_app})

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=False)
