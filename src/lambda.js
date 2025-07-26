// const serverless = require('serverless-http');
// const app = require('./app');

// module.exports.handler = serverless(app);

const serverless = require('serverless-http');
const app = require('./app');

// Cache the serverless handler to reuse across warm starts
let cachedHandler;

const getHandler = () => {
  if (!cachedHandler) {
    console.log('Creating new serverless handler (cold start)');
    cachedHandler = serverless(app);
  }
  return cachedHandler;
};

module.exports.handler = async (event, context) => {
  // Prevent Lambda from freezing the event loop
  context.callbackWaitsForEmptyEventLoop = false;

  // Optional: Log only essential info (avoid logging full event in prod)
  console.log('Received request:', event.httpMethod, event.rawPath);

  // Reuse handler
  const handler = getHandler();

  // Proxy to Express app
  return handler(event, context);
};
