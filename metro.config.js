const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true, // mejor que isEager para Expo 54
});

// Configuración mejorada para SVG + otros assets
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  // Asegurar que otros assets también funcionen
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Resolver SVG sin afectar otros assets
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;