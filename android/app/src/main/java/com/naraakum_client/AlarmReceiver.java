package com.naraakum_patient;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class AlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        String notificationBody = intent.getStringExtra("NotificationBody");
       String subject = intent.getStringExtra("Subject");
       String reminderDate = intent.getStringExtra("ReminderDate");
       String videoSDKMeetingId = intent.getStringExtra("VideoSDKMeetingId");

        // Start MainActivity with the alarm message to initialize React Context if needed
        Intent activityIntent = new Intent(context, MainActivity.class);
        activityIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        context.startActivity(activityIntent);
        Log.d("Activity", "start activity!");
        // Emit the event to React Native
        sendEventToReactNative(context, notificationBody, subject, reminderDate, videoSDKMeetingId);
    }

    private void sendEventToReactNative(Context context, String notificationBody, String subject, String reminderDate, String videoSDKMeetingId) {
        MainApplication application = (MainApplication) context.getApplicationContext();
        ReactNativeHost reactNativeHost = application.getReactNativeHost();
        ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            WritableMap params = Arguments.createMap();
            params.putString("NotificationBody", notificationBody);
            params.putString("Subject", subject);
            params.putString("ReminderDate", reminderDate);
            params.putString("VideoSDKMeetingId", videoSDKMeetingId);

            // Emit the event to React Native with the event name "AlarmEvent"
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("AlarmEvent", params);
        } else {
            // Optionally you can add a callback when the React context is ready
            reactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                @Override
                public void onReactContextInitialized(ReactContext initializedReactContext) {
                    Log.d("AlarmReceiver", "ReactContext initialized, emitting event to React Native");

                    WritableMap params = Arguments.createMap();
                    params.putString("NotificationBody", notificationBody);
                    params.putString("Subject", subject);
                    params.putString("ReminderDate", reminderDate);
                    params.putString("VideoSDKMeetingId", videoSDKMeetingId);

                    initializedReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("AlarmEvent", params);
                }
            });

            // Force the ReactInstanceManager to start initializing
            if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                reactInstanceManager.createReactContextInBackground();
            }
        }
    }
}
