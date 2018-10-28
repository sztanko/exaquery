# Exaquery

## Server

Server's code is in the `src/python` directory, `cd` into it to work on the backend code.

### Install dependencies

To install the server's dependencies run:

```shell
pip install -r requirements.txt
```

### Development

To run the local server for development execute:

```shell
<env_vars> python server.py
```

where `env_vars` is a list of environment variables listed here:

- _DEBUG_: enables debug mode if set to `True` or `1`. Default is off.
- _EXAJLOAD_BIN_: full path including the filename of the `exajload` binary. Default is `/usr/local/bin/exajload`.
- _EXASOL_HOST_: hostname of the Exasol instance including the port numeber. Default is `localhost:8563`.
- _EXASOL_USER_ and _EXASOL_PASSWORD_: user and password of the Exasol account. Default is `sys` and `exasol`.
- _EXAQUERY_HOST_: address where to bound the Exaquery server's instance. Default is `0.0.0.0`.
- _EXAQUERY_PORT_: port to bound the Exaquery server's instance. Default is `5012`.

## Production

Create a settings file in the `settings` directory, then build the docker image:

```shell
docker build -t exaquery-server --build-arg settings=settings.<custom_setting> .
```

Run the docker image with:

```shell
docker run -d -p 5012:5012 --name exaquery-server exaquery-server
```

## Client

Client's code is in the `src/scripts` directory, `cd` into it to work on the frontend code.

### Install dependencies

To install the dependency for the client run:

```shell
cd ui/
bundle install
yarn install
```

This will install the respective NPM and Ruby Gem dependencies.

You'll also need to have `gulp` installed globally to run the coffeescript gulpfile:

```shell
yarn global install gulp
```

### Development

Just run:

```shell
cd ui/
gulp watch
```

This will watch the directory's content and build on changes and place the built `.css` and `.js` files in the `public` directory. It'll serve everything in the `public` directory at http://localhost:8080.

### Production build

To build for production, simply run:

```shell
gulp build
```

### Production run

To run the UI and the serve ron production use [Docker Compose](https://docs.docker.com/compose/):

```shell
settings=<path_to_server_settings> docker-compose up --build
```

where the `settings` environmental variable pionts to the server settings to use as a Python full package name relative to the `python` directory.
