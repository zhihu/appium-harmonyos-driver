package appium.harmonyos;

import io.appium.java_client.*;
import io.appium.java_client.android.StartsActivity;
import io.appium.java_client.android.nativekey.PressesKey;
import io.appium.java_client.remote.SupportsContextSwitching;
import io.appium.java_client.remote.SupportsRotation;
import io.appium.java_client.screenrecording.CanRecordScreen;
import io.appium.java_client.service.local.AppiumDriverLocalService;
import io.appium.java_client.service.local.AppiumServiceBuilder;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.http.HttpClient;

import java.net.URL;

public class HarmonyDriver extends AppiumDriver implements SupportsContextSwitching, LocksDevice, PressesKey, SupportsRotation, HasDeviceTime, PullsFiles, PushesFiles, InteractsWithApps, StartsActivity, CanRecordScreen {
    public HarmonyDriver(HttpCommandExecutor executor, Capabilities capabilities) {
        super(executor, capabilities);
    }

    public HarmonyDriver(AppiumClientConfig clientConfig, Capabilities capabilities) {
        super(clientConfig, capabilities);
    }

    public HarmonyDriver(URL remoteAddress, Capabilities capabilities) {
        super(remoteAddress, capabilities);
    }

    public HarmonyDriver(URL remoteAddress, HttpClient.Factory httpClientFactory, Capabilities capabilities) {
        super(remoteAddress, httpClientFactory, capabilities);
    }

    public HarmonyDriver(AppiumDriverLocalService service, Capabilities capabilities) {
        super(service, capabilities);
    }

    public HarmonyDriver(AppiumDriverLocalService service, HttpClient.Factory httpClientFactory, Capabilities capabilities) {
        super(service, httpClientFactory, capabilities);
    }

    public HarmonyDriver(AppiumServiceBuilder builder, Capabilities capabilities) {
        super(builder, capabilities);
    }

    public HarmonyDriver(AppiumServiceBuilder builder, HttpClient.Factory httpClientFactory, Capabilities capabilities) {
        super(builder, httpClientFactory, capabilities);
    }

    public HarmonyDriver(HttpClient.Factory httpClientFactory, Capabilities capabilities) {
        super(httpClientFactory, capabilities);
    }

    public HarmonyDriver(Capabilities capabilities) {
        super(capabilities);
    }

    public HarmonyDriver(URL remoteSessionAddress, String platformName, String automationName) {
        super(remoteSessionAddress, platformName, automationName);
    }
}
