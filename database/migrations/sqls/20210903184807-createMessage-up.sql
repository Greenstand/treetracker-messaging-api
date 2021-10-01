CREATE TABLE message
(
    id uuid NOT NULL PRIMARY KEY,
    author_id uuid NOT NULL REFERENCES author(id),
    subject varchar NOT NULL,
    body varchar NOT NULL,
    video_link varchar,
    survey_id uuid REFERENCES survey(id),
    survey_response jsonb,
    composed_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL,
    active boolean NOT NULL
);
