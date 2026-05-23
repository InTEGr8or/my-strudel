module.exports = {
  webServer: {
    command: 'npm start -- --port=8090',
    port: 8090,
    timeout: 15000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:8090',
  },
};
