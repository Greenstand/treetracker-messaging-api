CREATE TABLE content
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id uuid NOT NULL REFERENCES author(id),
    type varchar NOT NULL,
    subject varchar NOT NULL,
    body varchar,
    video_link varchar,
    survey_id uuid REFERENCES survey(id),
    survey_response jsonb,
    composed_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    active boolean NOT NULL DEFAULT now()
);
