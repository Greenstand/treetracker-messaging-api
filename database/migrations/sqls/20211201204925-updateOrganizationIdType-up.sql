ALTER TABLE bulk_message DROP COLUMN recipient_organization_id;
ALTER TABLE bulk_message ADD COLUMN recipient_organization_id uuid;
