CREATE TABLE author
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle varchar NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
