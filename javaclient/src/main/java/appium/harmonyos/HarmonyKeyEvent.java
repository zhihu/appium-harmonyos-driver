package appium.harmonyos;

import io.appium.java_client.android.nativekey.KeyEvent;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class HarmonyKeyEvent extends KeyEvent {
    private Integer keyCode;
    private Integer metaState;
    private Integer flags;

    public HarmonyKeyEvent() {

    }

    public HarmonyKeyEvent(HarmonyKey harmonyKey) {
        this.keyCode = harmonyKey.getCode();
    }

    @Override
    public Map<String, Object> build() {
        HashMap<String, Object> map = new HashMap();
        Optional.ofNullable(this.keyCode).ifPresentOrElse((x) -> map.put("keycode", x), () -> {
            throw new IllegalStateException("The key code must be set");
        });
        Optional.ofNullable(this.metaState).ifPresent((x) -> map.put("metastate", x));
        Optional.ofNullable(this.flags).ifPresent((x) -> map.put("flags", x));
        return Collections.unmodifiableMap(map);
    }

}
