CREATE DATABASE threats_db;

USE threats_db;

CREATE TABLE threats (
    threat_id PRIMARY KEY VARCHAR(255),
    threat_name VARCHAR(255),
    timestamp DATETIME,
    plantuml_filename VARCHAR(255),
    spec_filename VARCHAR(255),
    context TEXT,
    aithreats JSON,
    diagram_url VARCHAR(500)
);
