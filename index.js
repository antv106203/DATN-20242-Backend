const appServer = require("./app"); // Đây là httpServer được export từ app.js
require('dotenv').config();

const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const port = normalizePort(process.env.PORT || '3000');

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof appServer.address() === 'string'
    ? 'pipe ' + appServer.address()
    : 'port: ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
    default:
      throw error;
  }
};

appServer.on('error', errorHandler);

appServer.on('listening', () => {
  const addr = appServer.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${port}`;
  console.log(`🚀 Listening on ${bind}`);
});

appServer.listen(port);
