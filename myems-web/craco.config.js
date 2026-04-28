module.exports = {
  devServer: (devServerConfig) => {
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;
    if (devServerConfig.https !== undefined) {
      if (devServerConfig.https) {
        devServerConfig.server = typeof devServerConfig.https === 'object' 
          ? { type: 'https', options: devServerConfig.https } 
          : 'https';
      }
      delete devServerConfig.https;
    }
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      return middlewares;
    };
    return devServerConfig;
  },
};
