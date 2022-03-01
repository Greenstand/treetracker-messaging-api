CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE survey
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    title varchar NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    active boolean NOT NULL DEFAULT true
);
