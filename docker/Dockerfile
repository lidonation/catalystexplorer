FROM registry.lidonation.com/lidonation/www.catalystexplorer.com/web-app-base:22.04-2025-01-13

COPY /application /var/www/

RUN chmod +x /usr/local/bin/start-container

EXPOSE 8000

WORKDIR /var/www

ENTRYPOINT ["start-container"]