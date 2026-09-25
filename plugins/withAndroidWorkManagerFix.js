const { withProjectBuildGradle } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

// react-native-android-widget (used for the home-screen widgets) depends on
// androidx.work:work-runtime:2.8.1, which since 2.8.0 bundles the Kotlin
// extensions that used to live in the separate work-runtime-ktx artifact.
// Something else in the dependency graph still transitively pulls an older
// work-runtime-ktx:2.7.1, so both AARs end up on the classpath with the same
// class names (OneTimeWorkRequestKt, PeriodicWorkRequestKt), which fails
// :app:checkDebugDuplicateClasses. Excluding the now-redundant ktx artifact
// everywhere resolves it to the single work-runtime copy.
// https://github.com/sAleksovski/react-native-android-widget/issues (duplicate class androidx.work)
const SNIPPET = `
allprojects {
  configurations.all {
    exclude group: 'androidx.work', module: 'work-runtime-ktx'
  }
}
`;

function withAndroidWorkManagerFix(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('withAndroidWorkManagerFix expects a Groovy android/build.gradle');
    }
    config.modResults.contents = mergeContents({
      tag: 'moodlet-android-work-manager-fix',
      src: config.modResults.contents,
      newSrc: SNIPPET,
      anchor: /^/,
      offset: 0,
      comment: '//',
    }).contents;
    return config;
  });
}

module.exports = withAndroidWorkManagerFix;
