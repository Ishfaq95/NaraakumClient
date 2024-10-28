package com.naraakum_patient;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class ForegroundService extends Service {

    private static final String CHANNEL_ID = "ForegroundServiceChannel";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d("ForegroundService", "Service is running...");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d("ForegroundService", "onStartCommand called");

        // Create notification and start foreground service immediately
        createNotificationChannel();

        Intent notificationIntent = new Intent(this, MainActivity.class); // Replace with your main activity
        notificationIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_MUTABLE);
        } else {
            pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Alarm")
                .setContentText("Opening your app")
                .setSmallIcon(R.mipmap.ic_launcher) // Set your own icon
                .setPriority(NotificationCompat.PRIORITY_HIGH) // Ensure high priority
                .setContentIntent(pendingIntent)
                .build();

        // Call startForeground immediately
        startForeground(1, notification);
        Log.d("ForegroundService", "Foreground notification created and service started");

        // Now bring the app to the foreground
        try {
            
            startActivity(notificationIntent);
            Log.d("ForegroundService", "MainActivity started");
        } catch (Exception e) {
            Log.e("ForegroundService", "Error starting MainActivity: " + e.getMessage(), e);
        }

        return START_NOT_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null && manager.getNotificationChannel(CHANNEL_ID) == null) {
                manager.createNotificationChannel(serviceChannel);
                Log.d("ForegroundService", "Notification channel created");
            }
        }
    }
}
