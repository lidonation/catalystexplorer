FROM registry.2lovelaces.io/catalystexplorer/www.catalystexplorer.com/web-app-base:2025-12-27

ARG WWWUSER=1000
ARG WWWGROUP=1000

COPY /application /var/www/

COPY --link --chown=${WWWUSER}:${WWWUSER} healthcheck /usr/local/bin/healthcheck
COPY --link --chown=${WWWUSER}:${WWWUSER} Caddyfile /etc/caddy/Caddyfile
COPY --link --chown=${WWWUSER}:${WWWUSER} start-container /usr/local/bin/start-container
COPY --link --chown=${WWWUSER}:${WWWUSER} supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN chmod +x /usr/local/bin/start-container /usr/local/bin/healthcheck

WORKDIR /var/www

ENTRYPOINT ["start-container"]