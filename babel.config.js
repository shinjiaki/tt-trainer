module.exports = function (api) {
  api.cache(true);
  return {
    // `unstable_transformImportMeta` rewrites `import.meta` (used by Expo's
    // winter runtime) to `globalThis.__ExpoImportMetaRegistry` so the web
    // bundle, which Metro serves as a classic <script> (not type="module"),
    // doesn't throw "Cannot use 'import.meta' outside a module" at parse time.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
  };
};
