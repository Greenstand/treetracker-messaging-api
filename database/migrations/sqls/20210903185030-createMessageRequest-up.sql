CREATE TABLE message_request
(
    id uuid NOT NULL PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES message(id),
    parent_message_id uuid NOT NULL,
    author_handle varchar NOT NULL,
    recipient_handle varchar,
    recipient_organization_id varchar,
    recipient_region_id uuid NOT NULL REFERENCES region(id)
);