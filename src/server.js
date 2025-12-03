const app = require('./app');
const { initialize } = require('./database/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await initialize();
    console.log('Database ready.');
  } catch (error) {
    console.error('Failed to initialize database.', error.message);
    process.exit(1);
  }
})();

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = server;
