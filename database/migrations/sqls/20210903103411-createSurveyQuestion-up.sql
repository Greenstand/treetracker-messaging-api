CREATE TABLE survey_question 
(
    id uuid NOT NULL PRIMARY KEY,
    survey_id uuid NOT NULL REFERENCES survey(id),
    prompt varchar NOT NULL,
    rank int NOT NULL,
    choices varchar ARRAY NOT NULL,
    created_at timestamptz NOT NULL
);