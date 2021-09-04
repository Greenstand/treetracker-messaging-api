CREATE TABLE region
(
    id uuid NOT NULL PRIMARY KEY,
    name varchar NOT NULL,
    description varchar NOT NULL,
    shape polygon NOT NULL,
    created_at timestamptz NOT NULL,
    active boolean NOT NULL
);