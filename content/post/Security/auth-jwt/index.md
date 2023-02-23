---
title: ASP.NET Core | JWT 授權與驗證機制
description: null
date: 2023-02-16T05:31:27.325Z
categories: null
tags:
  - Authentication
  - ASP.NET CORE
keywords:
  - cookies
  - authentication
draft: true
slug: aspnet-core-authenticaiton-jwt
---

> 🔖 長話短說 🔖
>
> 進行身份驗證時，需要使用 `UseAuthentication()` 插入 Authentication Middleware。

![.NET 7 預設 AuthenticationBuilder 的相關方法](images/support-authentication-method.png)
我們知道 .NET Core 支援多種的 Authentication 的認證方式，今天就來聊聊 JWT 的設定與處理方式。

<!--more-->

操作環境

- Windwos 11
- .NET 7

## 使用 JWT Authentication

### Middleware 設定

在 [ASP.NET Core | 淺講 Authentication 與 Authorization 機制]({{< ref "../aspnet-core-authentication-and-authorization/index.md" >}}) 這篇提到，在 .NET 中，授權與認證的機制，依賴 `AuthenticationMiddleware` 與 `AuthorizationMiddleware` 兩個 Middleware。

所以，務必記得在插入兩個 Middleware。

```C#
app.UseAuthentication();
app.UseAuthorication();
```

接著，要讓 `AuthenticationMiddleware` 知道有那些 AuthenticationSchema 可以使用。

所以必需要告知要使用 `JWT` 的認證方式。

```C#
builder.Service.AddAuthentication()
               .AddJwtBearer(
                   JwtBearerDefaults.AuthenticationScheme,
                   options => builder.Configuration.Bind("JwtSettings", options);
```

在使用 `AddJwtBearer` 的方法之前，需要參考`Microsoft.AspNetCore.Authentication.JwtBearer` [Nuget 套件](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer) 。

```shell
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### 產生 JWT Token

```C#
```

### JWT Token 的驗證

接著回到 `.AddJwtBearer` 的部份

```C#
.AddJwtBearer("Bearer", options =>  
 {  
	options.TokenValidationParameters = new TokenValidationParameters  
     {  
         ValidateIssuer = false,  
         RequireExpirationTime = true,  
         ValidateAudience = false,  
         ValidateIssuerSigningKey = false,  
     };
 }
```

### 輸出 Authenticate 失敗的訊息

```C#
.AddJwtBearer("Bearer", options =>  
 {  
    options.Events = new JwtBearerEvents  
     {  
         OnAuthenticationFailed = context =>  
         {  
             Log.Error(context.Exception, "Authentication Failed");  
             return Task.CompletedTask;  
         },  
     };  
 });
```

## OpenAPI (Swagger) 對應 JWT 的調整

```C#

```

## 延伸閱讀

▶ 站內文章

- [ASP.NET Core | 淺講 Authentication 與 Authorization 機制]({{< ref "../aspnet-core-authentication-and-authorization/index.md" >}})

▶ JWT Authentication

- [c# - How do I log authorization attempts in .net core - Stack Overflow](https://stackoverflow.com/questions/48889771/how-do-i-log-authorization-attempts-in-net-core)