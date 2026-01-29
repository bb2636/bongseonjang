# 딥링크 설정 가이드

Capacitor 앱에서 `bongseonjang://` URL 스키마로 딥링크를 지원하기 위한 설정 가이드입니다.

## 1. 네이티브 프로젝트 생성

```bash
cd apps/frontend
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

## 2. Android 설정

### AndroidManifest.xml 수정

파일 위치: `android/app/src/main/AndroidManifest.xml`

`<activity>` 태그 안에 다음 intent-filter를 추가하세요:

```xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name=".MainActivity"
    android:label="@string/app_name"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="true">

    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- 딥링크 설정 -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="bongseonjang" />
    </intent-filter>

</activity>
```

**중요**: `android:launchMode="singleTask"`를 추가해야 딥링크가 기존 앱 인스턴스로 전달됩니다.

## 3. iOS 설정

### Info.plist 수정

파일 위치: `ios/App/App/Info.plist`

`<dict>` 태그 안에 다음 URL 스키마 설정을 추가하세요:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.bongseonjang.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>bongseonjang</string>
        </array>
    </dict>
</array>
```

## 4. 딥링크 URL 형식

| 용도 | URL |
|------|-----|
| Google OAuth 콜백 | `bongseonjang://oauth/google/callback?code=...` |
| 결제 완료 | `bongseonjang://payment/complete/{orderId}` |
| 결제 실패 | `bongseonjang://payment/fail?message=...` |

## 5. 동기화 및 빌드

설정 후 동기화:

```bash
npx cap sync
```

Android 빌드:
```bash
npx cap open android
# Android Studio에서 빌드
```

iOS 빌드:
```bash
npx cap open ios
# Xcode에서 빌드
```

## 6. 테스트

### Android에서 테스트

```bash
adb shell am start -W -a android.intent.action.VIEW -d "bongseonjang://payment/complete/test123" com.bongseonjang.app
```

### iOS에서 테스트

Safari에서 `bongseonjang://payment/complete/test123` 입력
