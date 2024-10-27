module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@assets': './src/assets',
          '@routes': './src/routes',
          '@screens': './src/screens',
          '@components': './src/shared/components',
          '@hooks': './src/shared/hooks',
          '@redux': './src/shared/redux',
          '@services': './src/shared/services',
          '@theme': './src/shared/theme',
          '@utils': './src/shared/utils',
          '@types': './src/shared/@types'
        },
      },
    ],
  ],
};
