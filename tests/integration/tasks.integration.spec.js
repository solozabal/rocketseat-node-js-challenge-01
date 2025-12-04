const request = require('supertest');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Helper to get API client - tries to use app directly, falls back to BASE_URL
function apiClient() {
  try {
    const app = require('../../src/app');
    return request(app);
  } catch (error) {
    console.log('Using BASE_URL for integration tests');
    return request('http://localhost:3000');
  }
}

// Set up test database - use OS temp directory for cross-platform compatibility
const TEST_DB_PATH = process.env.SQLITE_DB_FILE || path.join(os.tmpdir(), 'test-database.sqlite');

describe('Tasks Integration Tests', () => {
  let api;

  beforeAll(async () => {
    // Ensure we're using a test database
    process.env.SQLITE_DB_FILE = TEST_DB_PATH;
    
    // Delete test database if it exists
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    // Initialize database
    const db = require('../../src/database/db');
    await db.initialize();
    
    api = apiClient();
  });

  afterAll(async () => {
    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  beforeEach(async () => {
    // Clear tasks table before each test
    const db = require('../../src/database/db');
    await db.run('DELETE FROM tasks');
  });

  describe('POST /tasks', () => {
    it('should create a task and return 201', async () => {
      const response = await api
        .post('/tasks')
        .send({ title: 'New Task', description: 'Task description' })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'New Task',
        description: 'Task description',
        completed_at: null
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
      expect(response.body.updated_at).toBeDefined();
    });

    it('should return 400 when title is missing', async () => {
      const response = await api
        .post('/tasks')
        .send({ description: 'Task without title' })
        .expect(400);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should return 400 when title is empty', async () => {
      const response = await api
        .post('/tasks')
        .send({ title: '', description: 'Task with empty title' })
        .expect(400);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should return 400 when title is only whitespace', async () => {
      const response = await api
        .post('/tasks')
        .send({ title: '   ', description: 'Task with whitespace title' })
        .expect(400);

      expect(response.body).toEqual({ error: 'title is required' });
    });

    it('should create task without description', async () => {
      const response = await api
        .post('/tasks')
        .send({ title: 'Task without description' })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Task without description',
        description: null
      });
    });
  });

  describe('GET /tasks', () => {
    it('should list all tasks', async () => {
      // Create some tasks first
      await api.post('/tasks').send({ title: 'Task 1' });
      await api.post('/tasks').send({ title: 'Task 2' });
      await api.post('/tasks').send({ title: 'Task 3' });

      const response = await api.get('/tasks').expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3);
    });

    it('should filter tasks by search query in title', async () => {
      await api.post('/tasks').send({ title: 'Buy groceries' });
      await api.post('/tasks').send({ title: 'Clean house' });
      await api.post('/tasks').send({ title: 'Buy books' });

      const response = await api
        .get('/tasks')
        .query({ search: 'Buy' })
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body.every(task => task.title.includes('Buy'))).toBe(true);
    });

    it('should filter tasks by search query in description', async () => {
      await api.post('/tasks').send({ title: 'Task 1', description: 'Important work' });
      await api.post('/tasks').send({ title: 'Task 2', description: 'Regular task' });
      await api.post('/tasks').send({ title: 'Task 3', description: 'Important meeting' });

      const response = await api
        .get('/tasks')
        .query({ search: 'Important' })
        .expect(200);

      expect(response.body.length).toBe(2);
    });

    it('should return empty array when no tasks exist', async () => {
      const response = await api.get('/tasks').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update task title and description', async () => {
      // Create a task
      const createResponse = await api
        .post('/tasks')
        .send({ title: 'Original Title', description: 'Original Description' });
      const taskId = createResponse.body.id;

      // Update the task
      const response = await api
        .put(`/tasks/${taskId}`)
        .send({ title: 'Updated Title', description: 'Updated Description' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: taskId,
        title: 'Updated Title',
        description: 'Updated Description'
      });
    });

    it('should update only title', async () => {
      // Create a task
      const createResponse = await api
        .post('/tasks')
        .send({ title: 'Original Title', description: 'Original Description' });
      const taskId = createResponse.body.id;

      // Update only title
      const response = await api
        .put(`/tasks/${taskId}`)
        .send({ title: 'New Title' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: taskId,
        title: 'New Title',
        description: 'Original Description'
      });
    });

    it('should update only description', async () => {
      // Create a task
      const createResponse = await api
        .post('/tasks')
        .send({ title: 'Original Title', description: 'Original Description' });
      const taskId = createResponse.body.id;

      // Update only description
      const response = await api
        .put(`/tasks/${taskId}`)
        .send({ description: 'New Description' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: taskId,
        title: 'Original Title',
        description: 'New Description'
      });
    });

    it('should return 400 when body is empty', async () => {
      // Create a task
      const createResponse = await api
        .post('/tasks')
        .send({ title: 'Test Task' });
      const taskId = createResponse.body.id;

      // Try to update with empty body
      const response = await api
        .put(`/tasks/${taskId}`)
        .send({})
        .expect(400);

      expect(response.body).toEqual({ 
        error: 'at least one of title or description must be provided' 
      });
    });

    it('should return 404 when task id is not found', async () => {
      const response = await api
        .put('/tasks/nonexistent-id')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body).toEqual({ error: 'task not found' });
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    it('should set completed_at when task is not completed', async () => {
      // Create an incomplete task
      const createResponse = await api
        .post('/tasks')
        .send({ title: 'Incomplete Task' });
      const taskId = createResponse.body.id;

      // Toggle complete
      const response = await api
        .patch(`/tasks/${taskId}/complete`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.completed_at).not.toBeNull();
    });

    it('should unset completed_at when task is already completed', async () => {
      // Create a task
      const createResponse = await api
        .post('/tasks')
        .send({ title: 'Task to Complete' });
      const taskId = createResponse.body.id;

      // Complete the task
      await api.patch(`/tasks/${taskId}/complete`);

      // Toggle again to uncomplete
      const response = await api
        .patch(`/tasks/${taskId}/complete`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.completed_at).toBeNull();
    });

    it('should return 404 when task id is invalid', async () => {
      const response = await api
        .patch('/tasks/invalid-id/complete')
        .expect(404);

      expect(response.body).toEqual({ error: 'task not found' });
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task and return 204', async () => {
      // Create a task
      const createResponse = await api
        .post('/tasks')
        .send({ title: 'Task to Delete' });
      const taskId = createResponse.body.id;

      // Delete the task
      await api.delete(`/tasks/${taskId}`).expect(204);

      // Verify task is deleted
      const getResponse = await api.get('/tasks').expect(200);
      expect(getResponse.body.find(task => task.id === taskId)).toBeUndefined();
    });

    it('should return 404 when task id is not found', async () => {
      const response = await api
        .delete('/tasks/nonexistent-id')
        .expect(404);

      expect(response.body).toEqual({ error: 'task not found' });
    });
  });
});
