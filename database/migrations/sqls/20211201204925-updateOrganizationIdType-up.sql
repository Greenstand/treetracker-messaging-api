ALTER TABLE message_request DROP COLUMN recipient_organization_id;
ALTER TABLE message_request ADD COLUMN recipient_organization_id uuid;