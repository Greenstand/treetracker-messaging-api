CREATE TABLE message
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_message_id uuid REFERENCES message(id),
    content_id uuid NOT NULL REFERENCES content(id),
    sender_id uuid NOT NULL REFERENCES author(id),
    recipient_id uuid NOT NULL REFERENCES author(id),
    created_at timestamptz NOT NULL DEFAULT now()
);
