CREATE TABLE bulk_message 
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id uuid NOT NULL REFERENCES content(id),
    author_handle varchar NOT NULL,
    recipient_organization_id varchar,
    recipient_region_id uuid REFERENCES region(id),
    created_at timestamptz NOT NULL DEFAULT now()
);
