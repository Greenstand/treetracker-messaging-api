CREATE TABLE survey
(
    id uuid NOT NULL PRIMARY KEY,
    title varchar NOT NULL,
    created_at timestamptz NOT NULL,
    active boolean NOT NULL
);