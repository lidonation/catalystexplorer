FROM debian:stable-slim AS carp
ENV TZ=Etc/UTC
ARG APP=/app

# below will come in handy when we want to run the entrypoint scriptt
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=x-builder /ops ${APP}
WORKDIR ${APP}
#USER nonroot
ENTRYPOINT ["/bin/sh", "-c" , "./migration up && ./carp"]