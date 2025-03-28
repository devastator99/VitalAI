const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = (async () => {
  const {
    resolver: { assetExts, sourceExts },
  } = await getDefaultConfig();

  return withNativeWind({
    ...config,
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      // Exclude .svg from asset extensions
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      // Include .svg as a valid source extension
      sourceExts: [...sourceExts, 'svg'],
    },
  });
})();
