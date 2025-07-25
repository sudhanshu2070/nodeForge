// const serverless = require('serverless-http');
// const app = require('./app');

// module.exports.handler = serverless(app);

const serverless = require('serverless-http');
const app = require('./app');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  console.log('Raw event:', JSON.stringify(event));
  return handler(event, context);
};