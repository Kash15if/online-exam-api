'use strict';

const { query } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    title: row.title,
    description: row.description || '',
    duration: row.duration,
    passingScore: row.passing_score,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };

module.exports = {
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM exams WHERE id = $1 LIMIT 1', [id]);
    return mapRow(rows[0]);
  },

  list: async () => {
    const { rows } = await query('SELECT * FROM exams ORDER BY created_at DESC');
    return rows.map(mapRow);
  },

  create: async (exam) => {
    await query(
      `INSERT INTO exams (id, title, description, duration, passing_score, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [exam.id, exam.title, exam.description || '', exam.duration, exam.passingScore, exam.createdAt, exam.updatedAt],
    );
    return exam;
  },

  update: async (id, patch) => {
    const fields = [];
    const values = [];
    let i = 1;
    const map = {
      title: 'title',
      description: 'description',
      duration: 'duration',
      passingScore: 'passing_score',
    };
    for (const [k, col] of Object.entries(map)) {
      if (patch[k] !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push(patch[k]);
      }
    }
    fields.push(`updated_at = $${i++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const { rows } = await query(
      `UPDATE exams SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    return mapRow(rows[0]);
  },

  delete: async (id) => {
    const result = await query('DELETE FROM exams WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  reset: async () => {
    await query('TRUNCATE TABLE exams CASCADE');
  },
};
