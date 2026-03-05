import pool from '../config/db.js';

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT id, title, response, CAST(is_active AS UNSIGNED) AS is_active, created_at, updated_at
     FROM quick_chats
     ORDER BY created_at DESC`
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, title, response, CAST(is_active AS UNSIGNED) AS is_active, created_at, updated_at
     FROM quick_chats
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ title, response, is_active = 1 }) => {
  const [result] = await pool.query(
    `INSERT INTO quick_chats (title, response, is_active) VALUES (?, ?, ?)`,
    [title.trim(), response, is_active ? 1 : 0]
  );

  const [inserted] = await pool.query(
    `SELECT id, title, response, CAST(is_active AS UNSIGNED) AS is_active, created_at, updated_at FROM quick_chats WHERE id = ?`,
    [result.insertId]
  );
  return inserted[0];
};

const update = async (id, { title, response, is_active }) => {
  const [existing] = await pool.query(
    `SELECT id FROM quick_chats WHERE id = ?`,
    [id]
  );
  if (!existing.length) throw new Error('Quick chat not found');

  const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;

  await pool.query(
    `UPDATE quick_chats SET title = ?, response = ?, is_active = ? WHERE id = ?`,
    [title.trim(), response, activeVal, id]
  );

  const [updated] = await pool.query(
    `SELECT id, title, response, CAST(is_active AS UNSIGNED) AS is_active, created_at, updated_at FROM quick_chats WHERE id = ?`,
    [id]
  );
  return updated[0];
};

const remove = async (id) => {
  const [existing] = await pool.query(
    `SELECT id FROM quick_chats WHERE id = ?`,
    [id]
  );
  if (!existing.length) throw new Error('Quick chat not found');

  await pool.query(`DELETE FROM quick_chats WHERE id = ?`, [id]);
};

export default { getAll, getById, create, update, remove };
