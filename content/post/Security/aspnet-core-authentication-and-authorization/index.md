---
title: ASP.NET Core | 淺談 Authentication 與 Authorization 機制
description: null
date: 2023-02-16T05:31:50.686Z
categories: null
tags:
  - Authentication
  - ASP.NET CORE
keywords:
  - cookies
  - authentication
draft: true
slug: net-core-authenticaiton-authorization
---

> 🔖 長話短說 🔖
>
> - `認證(Authentication)` 用於確認身份，而 `授權(Authorization)` 決定能作什麼事。

Authentication is the process of determining a user's identity. [Authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-3.1) is the process of determining whether a user has access to a resource.

Authentication，身分驗證又稱「認證」、「鑒權」，是指通過一定的手段，完成對使用者身分的確認。 身分驗證的目的是確認當前所聲稱為某種身分的使用者，確實是所聲稱的使用者。

Authentication 通常與 Authorization 搭配使用。

<!--more-->

## 設定使用 Authentication

Learn how ASP.NET Core handles the Authentication using **Authentication Handlers**, **Authentication Scheme** & **Authentication Middleware**,

### Authentication 的概念

claims

`Claim`, `ClaimsIdentity`, `ClaimsPrincipal`, `Principal`, `Identity`

#### IAuthenticationService

 [IAuthenticationService](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.iauthenticationservice?view=aspnetcore-7.0) is the main entry point which defines the 5 authentication actions:
 - Authenticate (get any authentication data for a request),
 - Challenge (used for unauthenticated requests),
 - Forbid (used when an authenticated request should be denied),
 - SignIn (associate a ClaimsPrincipal),
 - SignOut (remove any associated data).

在 `IAuthenticationService` 定義 5 種行為：

- Authenticate
- Challenge
- Forbid
- GetToken
- SignIn
- SignOut

// 以下6者的關係是? 圖解

### 使用 Authentication Middleware

在 ASP.NET Core 初始化時，設定使用 Authentication 的 Middleware。

若在 MiniAPI 中，設定位置在 `Program.cs`，否則在 `Startup.cs`

```c#
app.UseAuthentication();
app.UseAuthorization();
```

需要特別注意的是，若是有使用 `UseRouting` 或 `UseEndpoints`，需特別注意 `UseAuthentication` 的位置。

- After [UseRouting](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.endpointroutingapplicationbuilderextensions.userouting), so that route information is available for authentication decisions.
- Before [UseEndpoints](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.endpointroutingapplicationbuilderextensions.useendpoints), so that users are authenticated before accessing the endpoints.

在 UseAuthentication 時，會在 Middleware 插入 [AuthenticationMiddleware](https://github.com/dotnet/aspnetcore/blob/main/src/Security/Authentication/Core/src/AuthenticationMiddleware.cs) ，可以看到它會使用 `IAuthenticationService.AuthenticateAsync`

// 放 Middleware 的圖解

### Authenticaton 的規則

運用基本（Basic）驗證的場合

#### 預設支援多種 Authentication 方式

![.NET 7 預設 AuthenticationBuilder 的相關方法](images/support-authentication-method.png)

#### 共通的使用方式

##### 身份認證後的核發

```C#

// 核發/登入
    var claims = new List<Claim>  
    {  
        new Claim(ClaimTypes.Name, model.Account),  
        new Claim("UID", "FTSX1854ASF"),  
        new Claim(ClaimTypes.Role, "Guest"),  
    };  
  
    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);  
  
    var principal = new ClaimsPrincipal(claimsIdentity);  

    // 重要
    await this.HttpContext.SignInAsync(principal);
```

##### 登出

```C#
// 登出
await this.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
```

##### 實作概念

進一步查看 GitHub 上的 [AuthenticationHttpContextExtensions.cs](https://github.com/dotnet/aspnetcore/blob/main/src/Http/Authentication.Abstractions/src/AuthenticationHttpContextExtensions.cs) 內，關於 `HttpContext.SignInAsync` 與 `HttpContext.SignOutAsync` 的實作部份，會發現它的使用 `AuthenticationSchema` 的資訊，取出對應的 Authentication Service，再由這些服務進行處理。

接著就是到要授權管理的地方加上 `[Authorize]` 屬性

```c#
[ApiController]  
[Route("[controller]")]  
[Authorize]  
public class TodoController : ControllerBase  
{  
}
```

## 延伸閱讀

▶ Authentication 觀念

- [Overview of ASP.NET Core Authentication | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-7.0)
- [Microsoft.AspNetCore.Authentication 命名空間 | Microsoft Learn](https://learn.microsoft.com/zh-tw/dotnet/api/microsoft.aspnetcore.authentication?view=aspnetcore-7.0)
- [[.NET Core] ASP .NET Core 3.1 驗證與授權 (一)- 驗證與授權](https://blogger.tigernaxo.com/post/dotnetcore31/auth/auth_guild_1/)
- [Introduction to Authentication in ASP.NET Core - TekTutorialsHub](https://www.tektutorialshub.com/asp-net-core/authentication-in-asp-net-core/)

▶ Base Authentication

- [ASP.NET Core 6 實作自訂 Authentication 身份驗證，以 Basic Authentication 例 | 余小章 @ 大內殿堂](https://dotblogs.com.tw/yc421206/2022/06/18/asp_net_core_6_use_basic_authentication)
- [ASP.NET Core 3.1 - Basic Authentication Tutorial with Example API | Jason Watmore's Blog](https://jasonwatmore.com/post/2019/10/21/aspnet-core-3-basic-authentication-tutorial-with-example-api)
