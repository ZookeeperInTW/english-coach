-- English Coach — Railway Postgres schema
-- Run once to initialise the database

CREATE TABLE IF NOT EXISTS news (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en    TEXT        NOT NULL,
  title_zh    TEXT        NOT NULL DEFAULT '',
  content_en  TEXT        NOT NULL DEFAULT '',
  content_zh  TEXT        NOT NULL DEFAULT '',
  content_bilingual JSONB,
  category    TEXT        NOT NULL DEFAULT 'international',
  source_url  TEXT        UNIQUE,
  image_url   TEXT,
  is_archived BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vocabulary (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  word          TEXT        NOT NULL,
  user_id       TEXT,
  definition_zh TEXT,
  phonetic      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sentences (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id  UUID        NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  sentence_en    TEXT,
  sentence_zh    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
