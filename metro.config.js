const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * Fixes:
 *  1. ENOENT watch error — excludes Android Gradle build dirs from watcher.
 *  2. "Unable to resolve crypto" — forces axios to its browser-safe build
 *     instead of the Node.js-specific entry (axios/dist/node/axios.cjs).
 *
 * @type {import('metro-config').MetroConfig}
 */
const AXIOS_BROWSER_BUNDLE = path.resolve(
  __dirname,
  'node_modules/axios/dist/browser/axios.cjs',
);

const config = {
  resolver: {
    // Redirect axios to its browser-compatible bundle
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'axios') {
        return {
          filePath: AXIOS_BROWSER_BUNDLE,
          type: 'sourceFile',
        };
      }
      // Fall through to default Metro resolution for everything else
      return context.resolveRequest(context, moduleName, platform);
    },
    // Exclude Android Gradle build artifacts from the file watcher
    blockList: exclusionList([
      /node_modules[/\\].*[/\\]android[/\\]build[/\\].*/,
      /node_modules[/\\].*[/\\]android[/\\]\.gradle[/\\].*/,
      /node_modules[/\\].*[/\\]android[/\\]\.cxx[/\\].*/,
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

