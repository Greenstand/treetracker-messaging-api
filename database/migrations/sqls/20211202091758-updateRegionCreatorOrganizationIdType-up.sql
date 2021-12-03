ALTER TABLE region DROP COLUMN creator_organization_id;
ALTER TABLE region ADD COLUMN creator_organization_id uuid;