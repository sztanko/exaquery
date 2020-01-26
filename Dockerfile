# ============================================================================
# Base
# ============================================================================

FROM alpine:3.8 as base

RUN apk --no-cache add python3

WORKDIR /app


# ============================================================================
# Code
# ============================================================================

FROM base AS code

COPY ui/ ui/
COPY backend/ backend/
COPY run.sh run.sh

# ============================================================================
# Build Python
# ============================================================================

FROM base AS build_py

RUN apk --no-cache add \
    build-base \
    python3-dev

WORKDIR /app/backend

COPY --from=code /app/backend/requirements.txt .

RUN pip3 install -r requirements.txt


# ============================================================================
# Build JavaScript
# ============================================================================

FROM base AS build_js

RUN apk --no-cache add yarn

WORKDIR /app/ui

COPY --from=code /app/ui/package.json .
COPY --from=code /app/ui/yarn.lock .

RUN yarn

COPY --from=code /app/ui/ .

RUN yarn build


# ============================================================================
# Final
# ============================================================================

FROM base AS final

# Copy Python packages
COPY --from=build_py /usr/lib/python3.6/site-packages /usr/lib/python3.6/site-packages

# Copy code
COPY --from=code /app/ .
COPY --from=build_js /app/ui/build ui/build

EXPOSE 8080

ENV SETTINGS=settings.prod

CMD ["sh", "./run.sh"]
