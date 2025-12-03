const crypto = require('crypto');
const db = require('../database/db');

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

async function createTask(req, res) {
  try {
    const title = trimString(req.body.title);
    const description = trimString(req.body.description);

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const id = crypto.randomUUID();
    await db.run(
      `INSERT INTO tasks (id, title, description, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, NULL, datetime('now'), datetime('now'))`,
      [id, title, description || null]
    );

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.status(201).json(task);
  } catch (error) {
    console.error('createTask error', error.message);
    return res.status(500).json({ error: 'internal server error' });
  }
}

async function getTasks(req, res) {
  try {
    const { search } = req.query;
    if (search) {
      const q = `%${search}%`;
      const rows = await db.all(
        `SELECT * FROM tasks WHERE title LIKE ? OR (description IS NOT NULL AND description LIKE ?) ORDER BY created_at DESC`,
        [q, q]
      );
      return res.status(200).json(rows);
    }

    const rows = await db.all(`SELECT * FROM tasks ORDER BY created_at DESC`);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('getTasks error', error.message);
    return res.status(500).json({ error: 'internal server error' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const title = req.body.title !== undefined ? trimString(req.body.title) : undefined;
    const description = req.body.description !== undefined ? trimString(req.body.description) : undefined;

    if (title === undefined && description === undefined) {
      return res.status(400).json({ error: 'at least one of title or description must be provided' });
    }

    const existing = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'task not found' });
    }

    await db.run(
      `UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), updated_at = datetime('now') WHERE id = ?`,
      [title, description, id]
    );

    const updated = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('updateTask error', error.message);
    return res.status(500).json({ error: 'internal server error' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'task not found' });
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return res.status(204).send();
  } catch (error) {
    console.error('deleteTask error', error.message);
    return res.status(500).json({ error: 'internal server error' });
  }
}

async function toggleComplete(req, res) {
  try {
    const { id } = req.params;
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'task not found' });
    }

    if (task.completed_at) {
      await db.run("UPDATE tasks SET completed_at = NULL, updated_at = datetime('now') WHERE id = ?", [id]);
    } else {
      await db.run("UPDATE tasks SET completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [id]);
    }

    const updated = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('toggleComplete error', error.message);
    return res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  toggleComplete
};
