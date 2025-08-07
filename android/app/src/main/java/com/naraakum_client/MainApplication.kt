package com.naraakum_patient

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import org.devio.rn.splashscreen.SplashScreenReactPackage
import live.videosdk.rnwebrtc.WebRTCModulePackage;
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.christopherdro.htmltopdf.RNHTMLtoPDFPackage;
import com.oblador.vectoricons.VectorIconsPackage;

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Manually add AlarmPackage to the list of packages
              add(WebRTCModulePackage())
              //add(VectorIconsPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    
    loadReactNative(this)
    
// Force RTL layout direction
     val i18nUtil = I18nUtil.getInstance()
     i18nUtil.allowRTL(applicationContext, true)
     i18nUtil.forceRTL(applicationContext, true)
  }
}
