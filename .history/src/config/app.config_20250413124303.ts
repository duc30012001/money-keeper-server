export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT || '3131', 10) || 3000,
  },
});
