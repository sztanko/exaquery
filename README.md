# Exaquery

Exaquery is a ui for visualizing the timeline of exasol queries. It also allows you to see detailed (profiling) information on each query.

Use touchpad's pinch & scroll functionality to zoom and move:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/9c9HCIWPX6w/0.jpg)](https://www.youtube.com/watch?v=9c9HCIWPX6w)

**Warning** UI is tested on Macbook Chrome only. No idea how thiss looks on other browsers.

## Running

The easiest way to run the docker image:

```shell
docker run -i -t -e HOST=<exasol_host:port> -e USER=<user> -e PASSWORD=<password> -p 5000:5000  sztanko/exaquery:latest
```

If you are using a tunnelled connection, use `host.docker.internal` as your hostname.
```shell
docker run -i -t -e HOST=host.docker.internal:9000 -e USER=sys  -e PASSWORD=xxxx -p 5000:5000  sztanko/exaquery:latest
```

THen just open [http://0.0.0.0:5000] in your Chrome.

Any user that can `FLUSH STATISTICS` and with `select any dictionary` privilege can be used for the project. App is not sending to third party server/recording/logging any information. Neither is writes any changes to the database.

## Server

Server's code is written in Python 3. It is located in the `backennd` directory, `cd` into it to work on the backend code.

### Install dependencies

Follow DOCKERFILE instruction for installing

```shell
cd backend
pip install -r requirements.txt
```


## Client

Client's code is in the `ui` directory, `cd` into it to work on the frontend code.

### Development

Just run:

```shell
cd ui/
yarn start
```

The frontend is based on Facebook's [Create React App](https://facebook.github.io/create-react-app/).


### Production build

To build for production, simply run:

```shell
cd ui
yarn build
```s