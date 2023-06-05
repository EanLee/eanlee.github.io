---
title: Flutter | 使用 GitHub Action 進行 Android App 的 CI/CD
description: null
date: 2023-03-28T00:54:45.887Z
categories:
  - DevOps
tags:
  - GitHbu Action
  - Flutter
keywords: null
draft: true
slug: build-flutter-andorid-using-github-action
---

因為使用 GitHub 作為版控的平台，所以就直接使用 GitHub 來進行 CI/CD 作業。

因為是 side project, 所以採用 Git Flow 的流程為 branches 管理原則，在 GitHub Action 的撰寫，有以下幾個要求

- 只有在 _develop_、_release_、_main_ 特定的 branch 會 trigger GitHub Action 機制
- 進入 _develop_ 的 PR，GitHub Action 會更新 `pubspec.yaml` 內 _version_ 的建置號更新，並進行 Android 的建置。
- 對 _develop_ 下 `Tag` 後，GitHub Action 會進行 tag 的檢查，驗證通過後，會自行開立 _release_，並建立 合併回 _develop_、_main_ 的 PR。
- _main_ 在 merge 後，會將 Build 完成的 APP 上傳到 google play 內。

> 🔖 長話短說 🔖
>

使用的 GitHub Marketplace 內的 Action 如下

- [Checkout@v3](https://github.com/marketplace/actions/checkout)
- [Flutter action](https://github.com/marketplace/actions/flutter-action)
- [Cache · Actions · GitHub Marketplace](https://github.com/marketplace/actions/cache)


<!--more-->

## _develop_ 的 GitHub Action

在 _develop_ 的 GitHub Action，我們需要進行以下幾件事情

- 更新 _pubspec.yaml_ 內的版本的建置號(Build Nubmer)
- 建置 Android 的程式

### _pubspec.yaml_ 的建置號

```yaml
name: flutter_android
on:
  pull_request:
    branches:
      - develop
    types: [closed]
jobs:
  merge-berfore-change-pubspec-version:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == false
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.head_ref }}
          fetch-depth: 0

      - name: Get the version
        id: get_version
        run: echo VERSION=$(grep "version:" pubspec.yaml | awk '{print $2}' | tr -d "'" | cut -d'+' -f1) >> $GITHUB_ENV
      - name: Get the build number
        id: get_build_number
        run: echo BUILD_NUMBER=$(grep "version:" pubspec.yaml | awk '{print $2}' | tr -d "'" | cut -d'+' -f2) >> $GITHUB_ENV
      - name: Increment build number
        id: increment_build_number
        run: echo NEW_BUILD_NUMBER=$((BUILD_NUMBER + 1)) >> $GITHUB_ENV
      - name: Update pubspec.yaml
        run: |
            sed -i "s/version: .*/version: $VERSION+$NEW_BUILD_NUMBER/g" pubspec.yaml
        env:
          BUILD_NUMBER: ${{ env.BUILD_NUMBER }}
          NEW_BUILD_NUMBER: ${{ env.NEW_BUILD_NUMBER }}

      - name: Commit changes
        run: |
          git config --local user.name "github-actions[bot]"
          git config --local user.email "4443877+EanLee@users.noreply.github.com"
          git commit -m "Update version on pubspec.yaml" -a
          
      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.head_ref }}
```

(待確認)若發生無法上傳的問題，記得去申請 GitHubPerson Access Tokon, PAT


### Android 的建置



在完成 _pubspec.yaml_ 的建置號更新後，接著就是要讓 GitHub Action 為我們建置 Android 了。


```
  merge-after-generate-android:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.head_ref }}
          fetch-depth: 0

      - name: Set up Flutter
        uses: subosito/flutter-action@v1
        with:
          channel: 'stable'

      - name: Get dependencies
        run: flutter pub get

      - name: Build Android package
        run: flutter build appbundle --no-shrink

      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: app-release
          path: build/app/outputs/flutter-apk/app-release.apk
```

在 Android 的 App 建置時，需要一個建置用的憑證，以確保 APP 的建置來源。

首先，我們把建立後的 xxx.jks 轉為 base64，放到 GitHub repository setting 內的 `secrets and variables` 內的 Actions 之中。

![](images/Pasted%20image%2020230329102640.png)

```yml
  # decode base64 to upload-keystore.jks
  - name: Download Android keystore
    id: android_keystore
    run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 --decode > ./android/key.properties
```

接著，我們要設定建置 Android 用的 `key.properties`，
在 GitHub Action 的 job 設定中，有兩種作法，但第一種作法，有踩到雷，有些地方要特別注意。

#### 作法一: 在 GitHub Action 內組成 key.properties


```yml
   # # 建立 Android keystore
   - name: Create key.properties
     id: create_key_properties
     run: |
       echo "storePassword=${{ secrets.STORE_PASSWORD }}" > ./android/key.properties
       echo "keyPassword=${{ secrets.KEY_PASSWORD }}" >> ./android/key.properties
       echo "keyAlias=${{ secrets.KEY_ALIAS }}" >> ./android/key.properties
```

#### 作法二: 把 key.properties 轉為 base64



## Tag 檢查與驗證


## 上傳到 google play 內


## 延伸閱讀

▶ 站內文章

▶ 站外文章

- [GitHub Actions Documentation - GitHub Docs](https://docs.github.com/en/actions)
- [GitHub Actions: Deprecating save-state and set-output commands | GitHub Changelog](https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/)
- [Creating a personal access token - GitHub Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

- [How to Safely Build Assigned Flutter App with GitHub Actions | by Wendreo | Dev Genius](https://blog.devgenius.io/how-to-safely-build-assigned-flutter-app-with-github-actions-8860b1b6eef6)
- [Deploying Flutter applications to Google Play using Github actions - DEV Community](https://dev.to/matijanovosel/deploying-flutter-applications-to-google-play-using-github-actions-j8a)
- [Flutter CI/CD using GitHub Actions - LogRocket Blog](https://blog.logrocket.com/flutter-ci-cd-using-github-actions/)