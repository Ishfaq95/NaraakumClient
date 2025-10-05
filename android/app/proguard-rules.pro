# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
-keepattributes *Annotation*
-keepclassmembers class ** {
  @org.greenrobot.eventbus.Subscribe <methods>;
}
-keep enum org.greenrobot.eventbus.ThreadMode { *; }

# Keep VideoSDK classes
-keep class com.videosdk.live.** { *; }
-keep class org.webrtc.** { *; }

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep WebRTC classes
-keep class org.webrtc.** { *; }

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep WebSocket classes
-keep class com.neovisionaries.ws.client.** { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all classes that might be used in reflection
-keep class * extends android.app.Activity
-keep class * extends android.app.Application
-keep class * extends android.app.Service
-keep class * extends android.content.BroadcastReceiver
-keep class * extends android.content.ContentProvider

# Keep all Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep all Serializable classes
-keep class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Coil image loading library classes
-keep class coil3.** { *; }
-keep class coil.** { *; }
-keep interface coil3.** { *; }
-keep interface coil.** { *; }
-dontwarn coil3.**
-dontwarn coil.**

# Keep Coil PlatformContext specifically
-keep class coil3.PlatformContext { *; }
-keep class coil3.network.** { *; }
-dontwarn coil3.PlatformContext

# Keep Lottie classes
-keep class com.airbnb.lottie.** { *; }

# Keep React Native SVG classes
-keep class com.horcrux.svg.** { *; }

# Keep Notifee classes
-keep class io.invertase.notifee.** { *; }

# Keep Async Storage classes
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep Network Info classes
-keep class com.reactnativecommunity.netinfo.** { *; }

# Keep Document Picker classes
-keep class com.reactnativedocumentpicker.** { *; }

# Keep Image Picker classes
-keep class com.imagepicker.** { *; }

# Keep In-App Browser classes
-keep class com.proyecto26.inappbrowser.** { *; }

# Keep Loader Kit classes
-keep class com.reactnativeloaderkit.** { *; }

# Keep Permissions classes
-keep class com.zoontek.rnpermissions.** { *; }

# Keep Push Notification classes
-keep class com.dieam.reactnativepushnotification.** { *; }

# Keep Restart classes
-keep class com.reactnativerestart.** { *; }

# Keep Sound classes
-keep class com.zmxv.RNSound.** { *; }

# Keep Splash Screen classes
-keep class org.devio.rn.splashscreen.** { *; }

# Keep WebView classes
-keep class com.reactnativecommunity.webview.** { *; }

# Keep Fetch Blob classes
-keep class com.RNFetchBlob.** { *; }

# Keep File System classes
-keep class com.rnfs.** { *; }

# Keep File Viewer classes
-keep class com.vinzscam.reactnativefileviewer.** { *; }

# Keep File Picker classes
-keep class com.filepicker.** { *; }

# Keep Device Info classes
-keep class com.learnium.RNDeviceInfo.** { *; }

# Keep Android Open Settings classes
-keep class com.levelasquez.androidopensettings.** { *; }
