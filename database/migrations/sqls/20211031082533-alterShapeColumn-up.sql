ALTER TABLE region DROP COLUMN shape;
SELECT AddGeometryColumn ('region','shape',4326,'MULTIPOLYGON',2);
