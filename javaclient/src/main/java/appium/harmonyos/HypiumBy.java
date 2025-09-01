package appium.harmonyos;

import io.appium.java_client.AppiumBy;

import java.io.Serializable;

public class HypiumBy extends AppiumBy {
    protected HypiumBy(String selector, String locatorString, String locatorName) {
        super(selector, locatorString, locatorName);
    }

    private static class ByHypiumType extends HypiumBy implements Serializable {
        protected ByHypiumType(String locatorString) {
            super("type", locatorString, "type");
        }
    }

    private static class ByHypiumKey extends HypiumBy implements Serializable {
        protected ByHypiumKey(String locatorString) {
            super("key", locatorString, "key");
        }
    }

    private static class ByHypiumText extends HypiumBy implements Serializable {
        protected ByHypiumText(String locatorString) {
            super("text", locatorString, "text");
        }
    }

    private static class ByHypiumOptions extends HypiumBy implements Serializable {
        protected ByHypiumOptions(String locatorString) {
            super("HypiumBy", locatorString, "HypiumBy");
        }
    }

    public static HypiumBy type(String locatorString) {
        return new ByHypiumType(locatorString);
    }

    public static HypiumBy key(String locatorString) {
        return new ByHypiumKey(locatorString);
    }

    public static HypiumBy text(String locatorString) {
        return new ByHypiumText(locatorString);
    }

    public static HypiumBy options(String locatorString) {
        return new ByHypiumOptions(locatorString);
    }

}
