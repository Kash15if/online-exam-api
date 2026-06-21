-- Online Exam API - PostgreSQL schema
-- Run with: psql "$DATABASE_URL" -f db/migrations/postgres.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY,
    email         VARCHAR(320) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('student', 'admin')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
    id            UUID PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    duration      INTEGER NOT NULL CHECK (duration BETWEEN 1 AND 480),
    passing_score INTEGER NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id                    UUID PRIMARY KEY,
    exam_id               UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question              TEXT NOT NULL,
    options               JSONB NOT NULL,
    correct_answer_index  INTEGER NOT NULL CHECK (correct_answer_index >= 0),
    mark                  INTEGER NOT NULL DEFAULT 1 CHECK (mark > 0),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS questions_exam_id_idx ON questions(exam_id);

CREATE TABLE IF NOT EXISTS submissions (
    id            UUID PRIMARY KEY,
    exam_id       UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score         INTEGER NOT NULL,
    total_marks   INTEGER NOT NULL,
    percentage    INTEGER NOT NULL,
    passed        BOOLEAN NOT NULL,
    details       JSONB NOT NULL,
    submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON submissions(user_id);
CREATE INDEX IF NOT EXISTS submissions_exam_id_idx ON submissions(exam_id);
CREATE INDEX IF NOT EXISTS submissions_exam_user_idx ON submissions(exam_id, user_id);
