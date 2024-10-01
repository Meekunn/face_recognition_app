FROM mysql:latest
ENV MYSQL_ROOT_PASSWORD=pass@word
ENV MYSQL_DATABASE=attendit_db
COPY ./init.sql /docker-entrypoint-initdb.d/
EXPOSE 3306