package com.naraakum_patient

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "Naraakum_client"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.show(this)
        super.onCreate(savedInstanceState)

        // Check if the activity was started by an alarm intent
        if (intent?.hasExtra("message") == true) {
            val message = intent.getStringExtra("message")

            // Ensure React context exists before passing the event
            val reactContext = reactInstanceManager.currentReactContext
            if (reactContext != null) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("AlarmEvent", message)
            } else {
                reactInstanceManager.addReactInstanceEventListener(object : ReactInstanceManager.ReactInstanceEventListener {
                    override fun onReactContextInitialized(reactContext: ReactContext) {
                        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                            .emit("AlarmEvent", message)
                    }
                })

                if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                    reactInstanceManager.createReactContextInBackground()
                }
            }
        }
    }
}
