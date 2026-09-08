package com.thisisakashshow.lms;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Hardware/OS level screenshot and screen recording protection:
        // 1. Prevents taking screenshots (displays "Can't take screenshot due to security policy")
        // 2. Turns all screen recordings into a black screen
        // 3. Masks app preview in recent/multitasker view
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
