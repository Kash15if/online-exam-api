'use strict';

const { query } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    examId: row.exam_id,
    question: row.question,
    options: Array.isArray(row.options) ? row.options : JSON.parse(row.options || '[]'),
    correctAnswerIndex: row.correct_answer_index,
    mark: row.mark,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };

module.exports = {
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM questions WHERE id = $1 LIMIT 1', [id]);
    return mapRow(rows[0]);
  },

  findByExam: async (examId) => {
    const { rows } = await query('SELECT * FROM questions WHERE exam_id = $1 ORDER BY created_at ASC', [examId]);
    return rows.map(mapRow);
  },

  create: async (question) => {
    await query(
      `INSERT INTO questions (id, exam_id, question, options, correct_answer_index, mark, created_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
      [
        question.id,
        question.examId,
        question.question,
        JSON.stringify(question.options),
        question.correctAnswerIndex,
        question.mark ?? 1,
        question.createdAt,
      ],
    );
    return question;
  },

  update: async (id, patch) => {
    const fields = [];
    const values = [];
    let i = 1;
    if (patch.question !== undefined) {
      fields.push(`question = $${i++}`);
      values.push(patch.question);
    }
    if (patch.options !== undefined) {
      fields.push(`options = $${i++}::jsonb`);
      values.push(JSON.stringify(patch.options));
    }
    if (patch.correctAnswerIndex !== undefined) {
      fields.push(`correct_answer_index = $${i++}`);
      values.push(patch.correctAnswerIndex);
    }
    if (patch.mark !== undefined) {
      fields.push(`mark = $${i++}`);
      values.push(patch.mark);
    }
    fields.push(`updated_at = $${i++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const { rows } = await query(
      `UPDATE questions SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    return mapRow(rows[0]);
  },

  delete: async (id) => {
    const result = await query('DELETE FROM questions WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  deleteByExam: async (examId) => {
    const result = await query('DELETE FROM questions WHERE exam_id = $1', [examId]);
    return result.rowCount;
  },

  reset: async () => {
    await query('TRUNCATE TABLE questions CASCADE');
  },
};
