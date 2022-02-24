CREATE TABLE message_request
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id uuid NOT NULL REFERENCES content(id),
    parent_message_id uuid,
    author_handle varchar NOT NULL,
    recipient_handle varchar,
    recipient_organization_id varchar,
    recipient_region_id uuid REFERENCES region(id),
    created_at timestampz NOT NULL DEFAULT now()
);
