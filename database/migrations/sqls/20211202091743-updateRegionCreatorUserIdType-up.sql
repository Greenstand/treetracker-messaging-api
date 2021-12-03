ALTER TABLE region DROP COLUMN creator_user_id;
ALTER TABLE region ADD COLUMN creator_user_id uuid;