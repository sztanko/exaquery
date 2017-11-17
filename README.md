# Exaquery

## Server

Server's code is in the `src/python` directory, `cd` into it to work on the backend code.

### Install dependencies

To install the server's dependencies run:

```bash
pip install -r requirements.txt
```

### Development

To run the local server for development execute:

```bash
<env_vars> python server.py
```

where `env_vars` is a list of environment variables listed here:

* *DEBUG*: enables debug mode if set to `True` or `1`. Default is off.
* *EXAJLOAD_BIN*: full path including the filename of the `exajload` binary. Default is `/usr/local/bin/exajload`.
* *EXASOL_HOST*: hostname of the Exasol instance including the port numeber. Default is `localhost:8563`.
* *EXASOL_USER* and *EXASOL_PASSWORD*: user and password of the Exasol account. Default is `sys` and `exasol`.
* *EXAQUERY_HOST*: address where to bound the Exaquery server's instance. Default is `0.0.0.0`.
* *EXAQUERY_PORT*: port to bound the Exaquery server's instance. Default is `5012`.

## Production

Create a settings file in the `settings` directory, then build the docker image:

```bash
docker build -t exaquery-server --build-arg settings=settings.<custom_setting> .
```

Run the docker image with:

```bash
docker run -d -p 5012:5012 --name exaquery-server exaquery-server
```

## Client

Client's code is in the `src/scripts` directory, `cd` into it to work on the frontend code.

### Install dependencies

To install the dependency for the client run:

```bash
bundle install
yarn install
```

This will install the respective NPM and Ruby Gem dependencies.

You'll also need to have `gulp` installed globally to run the coffeescript gulpfile:

```bash
npm install -g gulp
```

### Development

Jus run:

```bash
gulp watch
```

This will watch the directory's content and build on changes and place the built `.css` and `.js` files in the `public` directory. It'll serve everything in the `public` directory at http://localhost:8080.

### Production build

To build for production, simply run:

```bash
gulp build
```
