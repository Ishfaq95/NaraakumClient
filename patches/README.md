# React Native Track Player Kotlin Version Fix

This directory contains patches for fixing Kotlin version mismatch issues in the react-native-track-player library.

## Issue

When running `npm run android`, you might encounter the following error:

```
Execution failed for task ':react-native-track-player:compileDebugKotlin'.
> A failure occurred while executing org.jetbrains.kotlin.compilerRunner.GradleCompilerRunnerWithWorkers$GradleKotlinCompilerWorkAction
   > Compilation error. See log for more details
```

This is caused by a mismatch between the Kotlin version used in the project and the one required by react-native-track-player.

## Solution

Apply the patch to fix the Kotlin version mismatch:

```bash
npx patch-package react-native-track-player
```

The patch does the following:

1. Updates the Kotlin version in `node_modules/react-native-track-player/android/build.gradle` to match the project's Kotlin version
2. Modifies the `getExtOrIntegerDefault` method to handle null values
3. Fixes type mismatch issues with Bundle? vs Bundle in `MusicModule.kt`

## Manual Fix

If the patch doesn't work, you can manually fix the issue by:

1. Open `node_modules/react-native-track-player/android/build.gradle`
2. Update the Kotlin version to match your project's version:
   ```gradle
   classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.20" // Use your project's version
   ```
3. Modify the `getExtOrIntegerDefault` method to handle null values:
   ```gradle
   def getExtOrIntegerDefault(name, defaultValue = 0) {
       return rootProject.ext.has(name) ? rootProject.ext.get(name) : (project.properties['RNTP_' + name] ?: defaultValue).toInteger()
   }
   ```
4. Fix the Bundle? vs Bundle type mismatch in `MusicModule.kt`:
   - Find the `getTrack` method and update it to handle null values:
     ```kotlin
     val originalItem = musicService.tracks[index].originalItem
     callback.resolve(if (originalItem != null) Arguments.fromBundle(originalItem) else null)
     ```
   - Find the `getActiveTrack` method and update it to handle null values:
     ```kotlin
     val originalItem = musicService.tracks[musicService.getCurrentTrackIndex()].originalItem
     if (originalItem != null) Arguments.fromBundle(originalItem) else null
     ```

## Creating a New Patch

If you need to update the patch for a new version of react-native-track-player:

1. Make the necessary changes to the files in `node_modules/react-native-track-player/`
2. Run `npx patch-package react-native-track-player` to create a new patch
3. Move the generated patch to the `patches` directory 