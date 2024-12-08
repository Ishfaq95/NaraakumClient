
package com.naraakum_patient;

import android.content.Context;
import android.util.Log;

import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkInfo;
import androidx.work.WorkManager;
import androidx.work.Data;
import androidx.work.WorkRequest;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

public class AlarmModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    AlarmModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "AlarmModule";
    }

    @ReactMethod
    public void scheduleAlarm(int seconds, String message,int bookingId,String timeLeft) {
        Data inputData = new Data.Builder()
                .putString("message", message)
                .build();

        //   Data inputData = new Data.Builder()
        //         .putString(Tags.ALARM_TITLE, title)
        //         .putString(Tags.ALARM_MESSAGE, body)
        //         .putString(Tags.CP_ID, cpId)
        //         .putString(Tags.CP_NAME, cpName)
        //         .putString(Tags.BOOKING_ID, bookingId)
        //         .putString(Tags.APPOINTMENT_TIME, appointmentTime)
        //         .putString(Tags.REMINDER_TIME, reminderTime)
        //         .putBoolean(Tags.TIME_REACHED, timeLeft.equals("0"))
        //         .putString(Tags.CALL_TYPE, callType)
        //         .build();

        
            OneTimeWorkRequest workRequest = new OneTimeWorkRequest.Builder(com.naraakum_patient.AlarmWorker.class)
                    .setInitialDelay(seconds, TimeUnit.SECONDS).addTag(bookingId + timeLeft)
                    .setInputData(inputData)
                    .build();
                    
            if (!isWorkWithTagRunning(bookingId + timeLeft)) {
                WorkManager.getInstance(reactContext).enqueue(workRequest);
            }
    }

    public Boolean isWorkWithTagRunning(String tag) {
        WorkManager workManager = WorkManager.getInstance(reactContext);

        try {
            // Get all work associated with the specified tag
            List<WorkInfo> workInfos = workManager.getWorkInfosByTag(tag).get();

            // Check if any of the work is in an enqueued or running state
            boolean workExists = false;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                workExists = workInfos.stream()
                        .anyMatch(workInfo ->
                                workInfo.getState() == WorkInfo.State.ENQUEUED ||
                                        workInfo.getState() == WorkInfo.State.RUNNING);
            }

            if (workExists) {
                return true;
            } else {
                return false;
            }

        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
            Log.e("WorkManagerCheck", "Error checking work by tag.", e);
        }
        return false;
    }
}
