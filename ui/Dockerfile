# ============================================================================
# Base
# ============================================================================

FROM alpine:3.6 AS base

RUN apk update \
    && apk add \
        nodejs \
        yarn \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# ============================================================================
# Build
# ============================================================================

FROM base AS build

# Install packages
RUN apk update \
    && apk add \
        python \
        make \
        g++ \
        ruby \
        ruby-bundler \
        ruby-dev \
        libffi-dev

RUN yarn global add gulp

ADD package.json .
ADD yarn.lock .
ADD Gemfile .
ADD Gemfile.lock .

RUN yarn install
RUN bundle install

# Build
ADD .babelrc .
ADD gulpfile.js .
ADD webpack.config.js .
ADD webpack.production.config.js .
ADD assets/ assets/
ADD src/ src/

RUN gulp build

# ============================================================================
# Production
# ============================================================================

FROM base as prod

COPY --from=build /app/package.json /app/
COPY --from=build /app/yarn.lock /app/

# Install production only packages
RUN yarn install --prod

# ============================================================================
# Final
# ============================================================================

FROM base AS final

COPY --from=build /app/public/ /app/public/
COPY --from=prod /app/node_modules/ /app/node_modules/

EXPOSE 8080

CMD ["./node_modules/.bin/static", "-a", "0.0.0.0", "/app/public/"]
