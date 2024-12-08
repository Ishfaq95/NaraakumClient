package com.naraakum_patient;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.naraakum_patient.MainApplication;

public class AlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String message = intent.getStringExtra("message");
        Log.d("AlarmReceiver", "Alarm triggered in background or killed state!");

        // Start MainActivity with the alarm message
        Intent activityIntent = new Intent(context, MainActivity.class);
        activityIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        activityIntent.putExtra("message", message);
//        context.startActivity(activityIntent);

        // Emit the event to React Native
        sendEventToReactNative(context, message);
    }

    private void sendEventToReactNative(Context context, String message) {
        MainApplication application = (MainApplication) context.getApplicationContext();
        ReactNativeHost reactNativeHost = application.getReactNativeHost();
        ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

        if (reactContext != null) {
            // Emit the message to React Native
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("AlarmEvent", message);
        } else {
            Log.d("AlarmReceiver", "ReactContext is not initialized yet!");
        }
    }
}
