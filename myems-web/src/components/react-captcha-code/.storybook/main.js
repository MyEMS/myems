const path = require('path');
module.exports = {
  webpackFinal: async config => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
        },
        // Optional
        {
          loader: require.resolve('react-docgen-typescript-loader'),
        },
      ],
    });
    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.alias['react-captcha-code'] = path.resolve('src')
    return config;
  },
  stories: ['../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
};
