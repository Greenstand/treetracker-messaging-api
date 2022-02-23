CREATE TABLE author
(
    id uuid NOT NULL PRIMARY KEY,
    handle varchar NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
