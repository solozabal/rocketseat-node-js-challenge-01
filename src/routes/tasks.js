const express = require('express');
const router = express.Router();
const controller = require('../controllers/tasksController');
const upload = require('../middlewares/upload');

// POST /tasks
router.post('/', controller.createTask);

// POST /tasks/import
router.post('/import', upload.single('file'), controller.importTasks);

// GET /tasks
router.get('/', controller.getTasks);

// PUT /tasks/:id
router.put('/:id', controller.updateTask);

// DELETE /tasks/:id
router.delete('/:id', controller.deleteTask);

// PATCH /tasks/:id/complete
router.patch('/:id/complete', controller.toggleComplete);

module.exports = router;
