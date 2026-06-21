'use strict';

const { exec, getSql } = require('./client');

const mapRow = (row) =>
  row && {
    id: row.id,
    title: row.title,
    description: row.description || '',
    duration: row.duration,
    passingScore: row.passing_score,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };

module.exports = {
  findById: async (id) => {
    const sql = getSql();
    const result = await exec('SELECT TOP 1 * FROM exams WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return mapRow(result.recordset[0]);
  },

  list: async () => {
    const result = await exec('SELECT * FROM exams ORDER BY created_at DESC');
    return result.recordset.map(mapRow);
  },

  create: async (exam) => {
    const sql = getSql();
    await exec(
      `INSERT INTO exams (id, title, description, duration, passing_score, created_at, updated_at)
       VALUES (@id, @title, @description, @duration, @passingScore, @createdAt, @updatedAt)`,
      {
        id: { type: sql.UniqueIdentifier, value: exam.id },
        title: { type: sql.NVarChar(255), value: exam.title },
        description: { type: sql.NVarChar(sql.MAX), value: exam.description || '' },
        duration: { type: sql.Int, value: exam.duration },
        passingScore: { type: sql.Int, value: exam.passingScore },
        createdAt: { type: sql.DateTime2, value: new Date(exam.createdAt) },
        updatedAt: { type: sql.DateTime2, value: new Date(exam.updatedAt) },
      },
    );
    return exam;
  },

  update: async (id, patch) => {
    const sql = getSql();
    const sets = [];
    const params = { id: { type: sql.UniqueIdentifier, value: id } };
    const map = [
      ['title', 'title', sql.NVarChar(255)],
      ['description', 'description', sql.NVarChar(sql.MAX)],
      ['duration', 'duration', sql.Int],
      ['passingScore', 'passing_score', sql.Int],
    ];
    for (const [key, col, type] of map) {
      if (patch[key] !== undefined) {
        sets.push(`${col} = @${key}`);
        params[key] = { type, value: patch[key] };
      }
    }
    sets.push('updated_at = @updatedAt');
    params.updatedAt = { type: sql.DateTime2, value: new Date() };

    await exec(`UPDATE exams SET ${sets.join(', ')} WHERE id = @id`, params);
    const fresh = await exec('SELECT TOP 1 * FROM exams WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return mapRow(fresh.recordset[0]);
  },

  delete: async (id) => {
    const sql = getSql();
    const result = await exec('DELETE FROM exams WHERE id = @id', {
      id: { type: sql.UniqueIdentifier, value: id },
    });
    return result.rowsAffected[0] > 0;
  },

  reset: async () => {
    await exec('DELETE FROM exams');
  },
};
