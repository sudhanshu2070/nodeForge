module.exports = {
  apps: [{
    name: 'auth-service',
    script: './src/app.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      NODE_PATH: '/home/ec2-user/nodeForge'
    }
  }]
};