'use strict';

const { exec, getSql } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    examId: row.exam_id,
    userId: row.user_id,
    score: row.score,
    totalMarks: row.total_marks,
    percentage: row.percentage,
    passed: !!row.passed,
    details: JSON.parse(row.details || '[]'),
    submittedAt: row.submitted_at instanceof Date ? row.submitted_at.toISOString() : row.submitted_at,
  };

module.exports = {
  findById: async (id) => {
    const sql = getSql();
    const result = await exec('SELECT TOP 1 * FROM submissions WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return mapRow(result.recordset[0]);
  },

  findByUser: async (userId) => {
    const sql = getSql();
    const result = await exec(
      'SELECT * FROM submissions WHERE user_id = @userId ORDER BY submitted_at DESC',
      { userId: { type: sql.UniqueIdentifier, value: userId } },
    );
    return result.recordset.map(mapRow);
  },

  findByExamAndUser: async (examId, userId) => {
    const sql = getSql();
    const result = await exec(
      `SELECT * FROM submissions
        WHERE exam_id = @examId AND user_id = @userId
        ORDER BY submitted_at DESC`,
      {
        examId: { type: sql.UniqueIdentifier, value: examId },
        userId: { type: sql.UniqueIdentifier, value: userId },
      },
    );
    return result.recordset.map(mapRow);
  },

  create: async (submission) => {
    const sql = getSql();
    await exec(
      `INSERT INTO submissions
       (id, exam_id, user_id, score, total_marks, percentage, passed, details, submitted_at)
       VALUES (@id, @examId, @userId, @score, @totalMarks, @percentage, @passed, @details, @submittedAt)`,
      {
        id: { type: sql.UniqueIdentifier, value: submission.id },
        examId: { type: sql.UniqueIdentifier, value: submission.examId },
        userId: { type: sql.UniqueIdentifier, value: submission.userId },
        score: { type: sql.Int, value: submission.score },
        totalMarks: { type: sql.Int, value: submission.totalMarks },
        percentage: { type: sql.Int, value: submission.percentage },
        passed: { type: sql.Bit, value: submission.passed ? 1 : 0 },
        details: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(submission.details) },
        submittedAt: { type: sql.DateTime2, value: new Date(submission.submittedAt) },
      },
    );
    return submission;
  },

  reset: async () => {
    await exec('DELETE FROM submissions');
  },
};
