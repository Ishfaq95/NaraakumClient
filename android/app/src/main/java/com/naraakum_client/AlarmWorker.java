
package com.naraakum_patient;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import android.os.PowerManager;

public class AlarmWorker extends Worker {

    public AlarmWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d("AlarmWorker", "Alarm triggered by WorkManager!");

        String message = getInputData().getString("message");

        // Use PowerManager to keep the device awake
        PowerManager powerManager = (PowerManager) getApplicationContext().getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::AlarmWakeLock");
        wakeLock.acquire(10 * 60 * 1000L);  // Keep the CPU awake for 10 minutes

        // Send a broadcast to AlarmReceiver to handle the alarm even if the app is killed
        Intent intent = new Intent(getApplicationContext(), com.naraakum_patient.AlarmReceiver.class);
        intent.putExtra("message", message);
        getApplicationContext().sendBroadcast(intent);

        wakeLock.release();
        return Result.success();
    }
}
