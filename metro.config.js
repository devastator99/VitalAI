// const { getDefaultConfig } = require('expo/metro-config');
// const { withNativeWind } = require('nativewind/metro');

// const config = getDefaultConfig(__dirname);

// module.exports = withNativeWind(config, { input: './global.css' });
 
// module.exports = (async () => {
//     const {
//       resolver: { assetExts, sourceExts },
//     } = await getDefaultConfig();
  
//     return {
//       transformer: {
//         babelTransformerPath: require.resolve('react-native-svg-transformer'),
//       },
//       resolver: {
//         // Exclude .svg from asset extensions
//         assetExts: assetExts.filter(ext => ext !== 'svg'),
//         // Include .svg as a valid source extension
//         sourceExts: [...sourceExts, 'svg'],
//       },
//     };
//   })();



// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { withSentryConfig } = require('@sentry/react-native/metro');

module.exports = (async () => {
  // 1) Get the default Expo config
  const config = await getDefaultConfig(__dirname);

  // 2) Modify config for react-native-svg-transformer
  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  const { assetExts, sourceExts } = config.resolver;
  config.resolver = {
    ...config.resolver,
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  };

  // 3) Wrap it with NativeWind
  //    Pass in the config and any NativeWind options
  const nativeWindConfig = withNativeWind(config, { input: './global.css' });

  // 4) Wrap it with Sentry
  const finalConfig = withSentryConfig(
    nativeWindConfig,
    {
      // Sentry options
      projectRoot: __dirname,
      org: 'your-org-slug',
      project: 'your-project-slug',
      // Additional Sentry config options if needed
    }
  );

  // 5) Return the single, merged config
  return finalConfig;
})();
