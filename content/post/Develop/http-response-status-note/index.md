---
title: ASP.NET Core | API 回應 HTTP Status 非預期的原因筆記
description: null
date: 2023-03-09T08:19:47.240Z
categories: 
- 軟體開發
tags: 
- ASP.NET Core
keywords: 
- 415
- Unsupported Media Type
draft: true
---

有時，呼叫 API 時，對方回應的 `HTTP Status` 與我們所預期的不同。

剛好最近有遇到，就順手記錄下來。

> 🔖 長話短說 🔖
>
> 若發生 `415: Unsupported Media Type` 錯誤，請檢查 `Content-Type` 與 `Content` 與 API 要求的規範是否相同。

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
        public async Task<IActionResult> callback([FromQuery] RedirectParameters parameters,
                                                         [FromForm] TWCADoResult doResult)
                                                         {

                                                         }

```

若 Content-Type 是 `application/x-www-form-urlencoded`，則要使用 `[FromForm]` 來接收。

#### `application/json`

```csharp
        [HttpPost("Verify")]

        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> callback([FromQuery] RedirectParameters parameters,
                                                         [FromForm] TWCADoResult doResult)
                                                         {

                                                         }


```

若 Content-Type 是 `application/json`，則要使用 `[FromBody]` 來接收。

## 延伸閱讀

▶ 站內文章
