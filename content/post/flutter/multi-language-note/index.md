---
title: Flutter | 實作多語系時的注意事項
description: null
date: 2023-03-09T02:33:30.233Z
categories: null
tags: null
keywords: null
draft: true
---

> 🔖 長話短說 🔖
>

- 在 Flutter 中，使用 `intl` 套件來實作多語系時，需要注意的地方。

在 Flutter 內實作多語系時，卡了一段時間，有些文章使用的套件，如 `intl_translation`、`intl_utils` 等，因為設定過程與相關文件的說明，不是那麼容易理解。最後，找到一個比較簡單的方式，來實作多語系。

環境設定

- Flutter 2.5.3
- Dart 2.14.4
- Andorid Studio 4.2.2
- VS Code 1.60.2

<!--more-->

## IDE 的設定

### Android Studio

在 Android Studio 中，先到 `Plugin` 內安裝 `Flutter Intl`，並且重啟 IDE。

需要設定 `File > Settings > Languages & Frameworks > Flutter > Flutter Intl`，並且勾選 `Enable Flutter Intl support`。

## intl 的設定

### command line 的方式

### IDE 的方式

## spec.yaml 的設定

在 `pubspec.yaml` 內，只需加入 `flutter_intl` 的套件即可。其他 `intl` 的作業，就交給 Plugin/Extension 來處理。

```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
```

###


## 延伸閱讀

▶ 站內文章
