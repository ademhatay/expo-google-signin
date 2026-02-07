const { createRunOncePlugin, withInfoPlist } = require('@expo/config-plugins');

const pkg = require('./package.json');

function getReversedClientId(iosClientId) {
  return iosClientId.split('.').reverse().join('.');
}

function withExpoGoogleSignin(config, props = {}) {
  const iosClientId = props.iosClientId;
  if (!iosClientId) {
    return config;
  }

  return withInfoPlist(config, (configWithPlist) => {
    configWithPlist.modResults.GIDClientID = iosClientId;

    const reversedClientId = getReversedClientId(iosClientId);
    const existingUrlTypes = configWithPlist.modResults.CFBundleURLTypes || [];
    const alreadyAdded = existingUrlTypes.some((entry) =>
      (entry.CFBundleURLSchemes || []).includes(reversedClientId)
    );

    if (!alreadyAdded) {
      existingUrlTypes.push({
        CFBundleURLSchemes: [reversedClientId],
      });
      configWithPlist.modResults.CFBundleURLTypes = existingUrlTypes;
    }

    return configWithPlist;
  });
}

module.exports = createRunOncePlugin(
  withExpoGoogleSignin,
  pkg.name,
  pkg.version
);
