export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3000,
  },
});
