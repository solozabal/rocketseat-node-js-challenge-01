const controller = require('../../src/controllers/tasksController');
const db = require('../../src/database/db');

// Mock the database module
jest.mock('../../src/database/db');

describe('tasksController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    describe('title validation', () => {
      it('should return 400 when title is missing', async () => {
        mockReq.body = {};
        
        await controller.createTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'title is required' });
      });

      it('should return 400 when title is empty string', async () => {
        mockReq.body = { title: '' };
        
        await controller.createTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'title is required' });
      });

      it('should return 400 when title is only whitespace', async () => {
        mockReq.body = { title: '   ' };
        
        await controller.createTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'title is required' });
      });

      it('should trim title and create task when title has leading/trailing spaces', async () => {
        mockReq.body = { title: '  Valid Title  ', description: 'Test description' };
        const mockTask = { id: 'test-id', title: 'Valid Title', description: 'Test description' };
        
        db.run.mockResolvedValue({ lastID: 1 });
        db.get.mockResolvedValue(mockTask);
        
        await controller.createTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockTask);
        expect(db.run).toHaveBeenCalledWith(
          expect.any(String),
          expect.arrayContaining(['Valid Title'])
        );
      });
    });
  });

  describe('updateTask', () => {
    describe('update body validation', () => {
      it('should return 400 when neither title nor description is provided', async () => {
        mockReq.params = { id: 'test-id' };
        mockReq.body = {};
        
        await controller.updateTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ 
          error: 'at least one of title or description must be provided' 
        });
      });

      it('should update when only title is provided', async () => {
        mockReq.params = { id: 'test-id' };
        mockReq.body = { title: 'New Title' };
        const existingTask = { id: 'test-id', title: 'Old Title', description: 'Description' };
        const updatedTask = { id: 'test-id', title: 'New Title', description: 'Description' };
        
        db.get.mockResolvedValueOnce(existingTask).mockResolvedValueOnce(updatedTask);
        db.run.mockResolvedValue({ changes: 1 });
        
        await controller.updateTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(updatedTask);
      });

      it('should update when only description is provided', async () => {
        mockReq.params = { id: 'test-id' };
        mockReq.body = { description: 'New Description' };
        const existingTask = { id: 'test-id', title: 'Title', description: 'Old Description' };
        const updatedTask = { id: 'test-id', title: 'Title', description: 'New Description' };
        
        db.get.mockResolvedValueOnce(existingTask).mockResolvedValueOnce(updatedTask);
        db.run.mockResolvedValue({ changes: 1 });
        
        await controller.updateTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(updatedTask);
      });

      it('should update when both title and description are provided', async () => {
        mockReq.params = { id: 'test-id' };
        mockReq.body = { title: 'New Title', description: 'New Description' };
        const existingTask = { id: 'test-id', title: 'Old Title', description: 'Old Description' };
        const updatedTask = { id: 'test-id', title: 'New Title', description: 'New Description' };
        
        db.get.mockResolvedValueOnce(existingTask).mockResolvedValueOnce(updatedTask);
        db.run.mockResolvedValue({ changes: 1 });
        
        await controller.updateTask(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(updatedTask);
      });
    });
  });

  describe('toggleComplete', () => {
    describe('toggle behavior for completed_at', () => {
      it('should set completed_at when it is null', async () => {
        mockReq.params = { id: 'test-id' };
        const taskBefore = { id: 'test-id', title: 'Task', completed_at: null };
        const taskAfter = { id: 'test-id', title: 'Task', completed_at: '2024-01-01 12:00:00' };
        
        db.get.mockResolvedValueOnce(taskBefore).mockResolvedValueOnce(taskAfter);
        db.run.mockResolvedValue({ changes: 1 });
        
        await controller.toggleComplete(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(taskAfter);
        expect(db.run).toHaveBeenCalledWith(
          expect.stringContaining("SET completed_at = datetime('now')"),
          ['test-id']
        );
      });

      it('should unset completed_at when it is already set', async () => {
        mockReq.params = { id: 'test-id' };
        const taskBefore = { id: 'test-id', title: 'Task', completed_at: '2024-01-01 12:00:00' };
        const taskAfter = { id: 'test-id', title: 'Task', completed_at: null };
        
        db.get.mockResolvedValueOnce(taskBefore).mockResolvedValueOnce(taskAfter);
        db.run.mockResolvedValue({ changes: 1 });
        
        await controller.toggleComplete(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(taskAfter);
        expect(db.run).toHaveBeenCalledWith(
          expect.stringContaining('SET completed_at = NULL'),
          ['test-id']
        );
      });

      it('should return 404 when task is not found', async () => {
        mockReq.params = { id: 'nonexistent-id' };
        
        db.get.mockResolvedValue(null);
        
        await controller.toggleComplete(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'task not found' });
      });
    });
  });
});
