const express = require('express');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime()
  });
});

app.use('/tasks', taskRoutes);

module.exports = app;
