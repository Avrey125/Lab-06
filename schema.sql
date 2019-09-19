DROP DATABASE IF EXISTS city_explorer;

CREATE DATABASE city_explorer;

\c city_explorer;

DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_address VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)
);
