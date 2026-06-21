'use strict';

const { query } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    examId: row.exam_id,
    userId: row.user_id,
    score: row.score,
    totalMarks: row.total_marks,
    percentage: row.percentage,
    passed: row.passed,
    details: Array.isArray(row.details) ? row.details : JSON.parse(row.details || '[]'),
    submittedAt: row.submitted_at?.toISOString?.() || row.submitted_at,
  };

module.exports = {
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM submissions WHERE id = $1 LIMIT 1', [id]);
    return mapRow(rows[0]);
  },

  findByUser: async (userId) => {
    const { rows } = await query(
      'SELECT * FROM submissions WHERE user_id = $1 ORDER BY submitted_at DESC',
      [userId],
    );
    return rows.map(mapRow);
  },

  findByExamAndUser: async (examId, userId) => {
    const { rows } = await query(
      'SELECT * FROM submissions WHERE exam_id = $1 AND user_id = $2 ORDER BY submitted_at DESC',
      [examId, userId],
    );
    return rows.map(mapRow);
  },

  create: async (submission) => {
    await query(
      `INSERT INTO submissions (id, exam_id, user_id, score, total_marks, percentage, passed, details, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      [
        submission.id,
        submission.examId,
        submission.userId,
        submission.score,
        submission.totalMarks,
        submission.percentage,
        submission.passed,
        JSON.stringify(submission.details),
        submission.submittedAt,
      ],
    );
    return submission;
  },

  reset: async () => {
    await query('TRUNCATE TABLE submissions CASCADE');
  },
};
