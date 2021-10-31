ALTER TABLE region DROP COLUMN shape;
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT AddGeometryColumn ('region','shape',4326,'MULTIPOLYGON',2);