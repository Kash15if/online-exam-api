'use strict';

const { exec, getSql } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    examId: row.exam_id,
    question: row.question,
    options: JSON.parse(row.options || '[]'),
    correctAnswerIndex: row.correct_answer_index,
    mark: row.mark,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };

module.exports = {
  findById: async (id) => {
    const sql = getSql();
    const result = await exec('SELECT TOP 1 * FROM questions WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return mapRow(result.recordset[0]);
  },

  findByExam: async (examId) => {
    const sql = getSql();
    const result = await exec(
      'SELECT * FROM questions WHERE exam_id = @examId ORDER BY created_at ASC',
      { examId: { type: sql.UniqueIdentifier, value: examId } },
    );
    return result.recordset.map(mapRow);
  },

  create: async (question) => {
    const sql = getSql();
    await exec(
      `INSERT INTO questions (id, exam_id, question, options, correct_answer_index, mark, created_at)
       VALUES (@id, @examId, @question, @options, @correctIdx, @mark, @createdAt)`,
      {
        id: { type: sql.UniqueIdentifier, value: question.id },
        examId: { type: sql.UniqueIdentifier, value: question.examId },
        question: { type: sql.NVarChar(sql.MAX), value: question.question },
        options: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(question.options) },
        correctIdx: { type: sql.Int, value: question.correctAnswerIndex },
        mark: { type: sql.Int, value: question.mark ?? 1 },
        createdAt: { type: sql.DateTime2, value: new Date(question.createdAt) },
      },
    );
    return question;
  },

  update: async (id, patch) => {
    const sql = getSql();
    const sets = [];
    const params = { id: { type: sql.UniqueIdentifier, value: id } };
    if (patch.question !== undefined) {
      sets.push('question = @question');
      params.question = { type: sql.NVarChar(sql.MAX), value: patch.question };
    }
    if (patch.options !== undefined) {
      sets.push('options = @options');
      params.options = { type: sql.NVarChar(sql.MAX), value: JSON.stringify(patch.options) };
    }
    if (patch.correctAnswerIndex !== undefined) {
      sets.push('correct_answer_index = @correctIdx');
      params.correctIdx = { type: sql.Int, value: patch.correctAnswerIndex };
    }
    if (patch.mark !== undefined) {
      sets.push('mark = @mark');
      params.mark = { type: sql.Int, value: patch.mark };
    }
    sets.push('updated_at = @updatedAt');
    params.updatedAt = { type: sql.DateTime2, value: new Date() };

    await exec(`UPDATE questions SET ${sets.join(', ')} WHERE id = @id`, params);
    const fresh = await exec('SELECT TOP 1 * FROM questions WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return mapRow(fresh.recordset[0]);
  },

  delete: async (id) => {
    const sql = getSql();
    const result = await exec('DELETE FROM questions WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return result.rowsAffected[0] > 0;
  },

  deleteByExam: async (examId) => {
    const sql = getSql();
    const result = await exec('DELETE FROM questions WHERE exam_id = @examId', {
      examId: { type: sql.UniqueIdentifier, value: examId },
    });
    return result.rowsAffected[0];
  },

  reset: async () => {
    await exec('DELETE FROM questions');
  },
};
