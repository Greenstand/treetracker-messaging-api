CREATE TABLE message_delivery
(
    id uuid NOT NULL PRIMARY KEY,
    parent_message_id uuid REFERENCES message_delivery(id),
    message_id uuid NOT NULL REFERENCES message(id),
    sender_id uuid NOT NULL REFERENCES author(id),
    recipient_id uuid NOT NULL REFERENCES author(id),
    created_at timestamptz NOT NULL
);
