// Vercel serverless function entry point — re-exports the Express app.
const app = require('../server');
module.exports = app;
