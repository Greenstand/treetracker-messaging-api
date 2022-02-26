CREATE TABLE region
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar NOT NULL,
    description varchar NOT NULL,
    shape polygon,
    created_at timestamptz NOT NULL,
    creator_user_id uuid,
    creator_organization_id uuid,
    active boolean NOT NULL DEFAULT true
);
