-- Online Exam API - Microsoft SQL Server schema
-- Run with sqlcmd: sqlcmd -S server -U user -P pass -d online_exam -i db/migrations/mssql.sql

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id            UNIQUEIDENTIFIER  NOT NULL PRIMARY KEY,
        email         NVARCHAR(320)     NOT NULL UNIQUE,
        name          NVARCHAR(200)     NOT NULL,
        password_hash NVARCHAR(255)     NOT NULL,
        role          NVARCHAR(20)      NOT NULL CHECK (role IN ('student', 'admin')),
        created_at    DATETIME2(3)      NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'exams')
BEGIN
    CREATE TABLE exams (
        id            UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        title         NVARCHAR(255)    NOT NULL,
        description   NVARCHAR(MAX)    NULL,
        duration      INT              NOT NULL CHECK (duration BETWEEN 1 AND 480),
        passing_score INT              NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
        created_at    DATETIME2(3)     NOT NULL CONSTRAINT DF_exams_created_at DEFAULT SYSUTCDATETIME(),
        updated_at    DATETIME2(3)     NOT NULL CONSTRAINT DF_exams_updated_at DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'questions')
BEGIN
    CREATE TABLE questions (
        id                   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        exam_id              UNIQUEIDENTIFIER NOT NULL,
        question             NVARCHAR(MAX)    NOT NULL,
        options              NVARCHAR(MAX)    NOT NULL CHECK (ISJSON(options) = 1),
        correct_answer_index INT              NOT NULL CHECK (correct_answer_index >= 0),
        mark                 INT              NOT NULL CONSTRAINT DF_questions_mark DEFAULT 1,
        created_at           DATETIME2(3)     NOT NULL CONSTRAINT DF_questions_created_at DEFAULT SYSUTCDATETIME(),
        updated_at           DATETIME2(3)     NOT NULL CONSTRAINT DF_questions_updated_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_questions_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_questions_exam_id ON questions(exam_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'submissions')
BEGIN
    CREATE TABLE submissions (
        id           UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        exam_id      UNIQUEIDENTIFIER NOT NULL,
        user_id      UNIQUEIDENTIFIER NOT NULL,
        score        INT              NOT NULL,
        total_marks  INT              NOT NULL,
        percentage   INT              NOT NULL,
        passed       BIT              NOT NULL,
        details      NVARCHAR(MAX)    NOT NULL CHECK (ISJSON(details) = 1),
        submitted_at DATETIME2(3)     NOT NULL CONSTRAINT DF_submissions_submitted_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_submissions_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE NO ACTION,
        CONSTRAINT FK_submissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
    );

    CREATE INDEX IX_submissions_user_id ON submissions(user_id);
    CREATE INDEX IX_submissions_exam_id ON submissions(exam_id);
    CREATE INDEX IX_submissions_exam_user ON submissions(exam_id, user_id);
END;
