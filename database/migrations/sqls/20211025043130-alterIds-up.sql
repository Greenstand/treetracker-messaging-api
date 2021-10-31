/* Replace with your SQL commands */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER TABLE survey ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE survey_question ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE region ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE author ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE message ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE message_request ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE message_delivery ALTER COLUMN id SET DEFAULT uuid_generate_v4();