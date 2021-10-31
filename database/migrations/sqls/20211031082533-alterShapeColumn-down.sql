SELECT DropGeometryColumn( 'region', 'shape');
ALTER TABLE region ADD COLUMN shape polygon;