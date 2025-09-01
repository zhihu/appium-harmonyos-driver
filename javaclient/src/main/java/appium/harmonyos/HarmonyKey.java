package appium.harmonyos;

public enum HarmonyKey {
    HOME(1),
    BACK(2),
    VOLUME_UP(16),
    VOLUME_DOWN(17),
    POWER(18);

    private final int code;

    HarmonyKey(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
