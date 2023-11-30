---
title: ASP.NET Core | 問題排除隨手記 - API 回應 HTTP Status 415 Unsupported Media Type
description: 本篇文章探討在呼叫 API 時遇到非預期的 HTTP Status 狀況，並針對 415 Unsupported Media Type 錯誤，說明錯誤原因與其解法。如果遇到類似的問題，這篇文章或許可以提供參考。
date: 2023-03-09T16:19:47+08:00
lastmod: 2023-11-28T10:22:17+08:00
tags:
  - ASP.NET
categories:
  - 軟體開發
  - 開發雜談
keywords:
  - Unsupported Media Type
  - HTTP Status
  - ASP.NET Core
slug: http-response-status-unexpected-note
---

有時呼叫 API 時，對方回應的 `HTTP Status` 與我們所預期的不同。剛好最近有遇到，就順手記錄下來。

> 🔖 長話短說 🔖
>
> - `415: Unsupported Media Type` 錯誤，請檢查 `Content-Type` 與 `Content` 與 API 要求的規範是否相同。

<!--more-->

## Status 415: Unsupported Media Type

基本上，會發生 HTTP Status 415，其原因不外乎是:

### ▶ `Content-Type` 設定錯誤，造成無法解析 Content 資料

若 API 要求的 `Content-Type` 是 `application/json`，但是實際上發送的是 `application/x-www-form-urlencoded`，就會發生這個錯誤。

可以從 Request Headers 內，看到 `Content-Type` 的設定。

### ▶ 傳送 `Content` 的資料格式錯誤，與 API 接收的資料不符

這個情況，有兩種可能:

要嘛就是 Content 內的資料格式，與 `Content-Type` 設定的不符。API 要求 Josn 的資格格式，但是發送的內容卻是 a=1&b=2 的格式，就會發生這個錯誤。

再不然，就是 Content 內的資料格式，與 API 要求的不符。若 API 要求的資料格式為數字，但是發送的內容卻是字串，就會發生這個錯誤。

若 API 是要開發給自已使用，可以自行設定 `Content-Type` 與 `Content` 的格式。但若是提供第三方的服務 `callback` 呼叫，就要配合第三方的發送格式。

#### `application/x-www-form-urlencoded`

```csharp
[HttpPost("Verify")]
[Consumes("application/x-www-form-urlencoded")]
public async Task<IActionResult> callback(
	[FromQuery] RedirectParameters parameters,
    [FromForm] VerifyResult result)
{
	// 略
}
```

若 Content-Type 是 `application/x-www-form-urlencoded`，則要使用 `[FromForm]` 來接收。

#### `application/json`

```csharp
[HttpPost("Verify")]
public async Task<IActionResult> callback(
	[FromQuery] RedirectParameters parameters,
	[FromBody] VerifyResult result)
{
	// 略
}
```

若 Content-Type 是 `application/json`，則要使用 `[FromBody]` 來接收。

## 補充資料

▶ 延伸閱讀

- [問題排除隨手記 - UseHttpsRedirection 造成的無限 Redirection](../use-https-redirection-cause-infinite-redirection/index.md)
- [開發雜談 - API Server 有非預期的請求的原因釐清](../../Experiences/unexpected-request/index.md)
