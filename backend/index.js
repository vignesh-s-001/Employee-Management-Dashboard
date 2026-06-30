const jsonServer = require('json-server');
const authMiddleware = require('./middleware.js');
const path = require('path');
const cors = require('cors');

const server = jsonServer.create();

const fs = require('fs');

// Vercel serverless functions have a read-only filesystem except for /tmp.
// We copy the db.json to /tmp/db.json so json-server can write to it without crashing.
const dbFile = path.join(__dirname, 'db.json');
const tmpDbFile = path.join('/tmp', 'db.json');

// Copy only if it doesn't exist, to avoid overwriting state during a warm lambda restart
if (!fs.existsSync(tmpDbFile)) {
  fs.copyFileSync(dbFile, tmpDbFile);
}

// Resolve path to the writable db.json
const router = jsonServer.router(tmpDbFile);
const middlewares = jsonServer.defaults();

// Set up CORS
server.use(cors());

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
server.use(jsonServer.bodyParser);

// Attach the db to req.app.db so the authMiddleware can access it
server.use((req, res, next) => {
  req.app.db = router.db;
  next();
});

// Use your custom auth middleware
server.use(authMiddleware);

// Use default router
server.use(router);

// If run directly (local development), start the server
if (require.main === module) {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
  });
}

// Export for Vercel Serverless
module.exports = server;
