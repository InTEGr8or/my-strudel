module.exports = {
  webServer: {
    command: 'PORT=8080 npx eleventy --serve',
    port: 8080,
    timeout: 15000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:8080',
  },
};
