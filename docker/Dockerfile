FROM registry.lidonation.com/lidonation/www.catalystexplorer.com/web-app-base:ubuntu-22.04-2024-12-9

COPY /application /var/www/

COPY /docker/start-container /usr/local/bin/start-container
COPY /docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY /docker/php.ini /etc/php/8.3/cli/conf.d/99-sail.ini

RUN chmod +x /usr/local/bin/start-container

EXPOSE 8000

WORKDIR /var/www

ENTRYPOINT ["start-container"]