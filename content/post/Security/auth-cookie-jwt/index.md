---
title: ASP.NET Core | Cookies 與 JWT 授權與驗證機制
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
slug: aspnet-core-authenticaiton-cookies-jwt
---

> 🔖 長話短說 🔖
>
> 進行身份驗證時，需要使用 `UseAuthentication()` 插入 Authentication Middleware。

Authentication is the process of determining a user's identity. [Authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-3.1) is the process of determining whether a user has access to a resource.

Authentication，身分驗證又稱「認證」、「鑒權」，是指通過一定的手段，完成對使用者身分的確認。 身分驗證的目的是確認當前所聲稱為某種身分的使用者，確實是所聲稱的使用者。

Authentication 通常與 Authorization 搭配使用。

<!--more-->

## 設定 Authentication

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

### Authenticaton 規則

運用基本（Basic）驗證的場合

預設支援多種 Authentication 方式

![.NET 7 預設 AuthenticationBuilder 的相關方法](images/support-authentication-method.png)

#### 使用 Cookies Authentication

首先是宣告使用 Cookie 的驗證方式

```C#
builder.Services.AddAuthentication()
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("CookieSettings", options));
```

接著是建立驗證的 Cookie，常用於 Login 的時機點。我們可以在 Claims 額外加入我們想要填入的資訊。

```C#
/// <summary>  
/// 使用者登入  
/// </summary>  
[HttpPost("Login")]  
public async Task<ActionResult> Login()  
{  
    var claims = new List<Claim>  
    {  
        new Claim(ClaimTypes.Name, "Lab"),  
        new Claim("UID", "FTSX1854ASF"),  
        new Claim(ClaimTypes.Role, "Guest"),  
    };  
  
    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);  
  
    var principal = new ClaimsPrincipal(claimsIdentity);  

    // 重要
    await this.HttpContext.SignInAsync(principal);
    
    return this.Ok();  
}
```

觀察 Login 前後的 Response Header，可以發現使用 cookies authentication 後的 Response Header 多了 `Expires`、`Set-Cookie` 兩個重要的欄位資訊。

![使用 Cookies Authentcation 前，Response Header 內容](images/cookies-login-before-response.png)

![使用 Cookies Authentcation 後，Response Header 內容](images/cookies-login-response.png)

接著就是到要授權管理的地方加上 `[Authorize]` 屬性

```c#
[ApiController]  
[Route("[controller]")]  
[Authorize]  
public class TodoController : ControllerBase  
{  
}
```

登出/取消認證

```C#
/// <summary>
/// 使用者登出
/// </summary>
[Authorize]
[HttpPost("Logout")]
public async Task<ActionResult> Logout()
{
    // cookies 
    await this.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return this.Ok();
}
```

##### Security: Cookie Policy

```c#
app.UseCookiePolicy();
```

###### HttpOnly

使用 cookies 存在 HttpOnly 的 OWASP 的問題，所以可以在 `Option` 加入 `HttpOnly = true` 的設定

```C#
builder.Services.AddAuthentication()
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme,
        options => {
            builder.Configuration.Bind("CookieSettings", options);
            options.Cookie.HttpOnly = true;
        });
```

###### SameSite

#### 使用 JWT Authentication

若是要使用 `AddJwtBearer` 的方法，需要增加 [Nuget 套件](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer) `Microsoft.AspNetCore.Authentication.JwtBearer`。

```shell
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

並加入設定

```C#
builder.Services.AddAuthentication()
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("JwtSettings", options))
```

#### 使用多種 Authentication

```c#
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("JwtSettings", options))
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("CookieSettings", options));

```

在 `AddAuthentication` 的參數 `JwtBearerDefaults.AuthenticationScheme`，er表示預設使用 J...


## 延伸閱讀

▶ 站內文章

- [ASP.NET Core | 淺講 Authentication 與 Authorization 機制]({{< ref "../aspnet-core-authentication-and-authorization/index.md" >}})

▶ Base Authentication

- [ASP.NET Core 6 實作自訂 Authentication 身份驗證，以 Basic Authentication 例 | 余小章 @ 大內殿堂 - 點部落 (dotblogs.com.tw)](https://dotblogs.com.tw/yc421206/2022/06/18/asp_net_core_6_use_basic_authentication)
- [ASP.NET Core 3.1 - Basic Authentication Tutorial with Example API | Jason Watmore's Blog](https://jasonwatmore.com/post/2019/10/21/aspnet-core-3-basic-authentication-tutorial-with-example-api)

▶ Cookies

- [在 ASP.NET Core 中使用 SameSite cookie | Microsoft Learn](https://learn.microsoft.com/zh-tw/aspnet/core/security/samesite?view=aspnetcore-7.0)
- [[ASP.NET Core] 自定義自己的 Authentication 身份驗證器 | Ian Chen - 點部落 (dotblogs.com.tw)](https://dotblogs.com.tw/Null/2020/07/03/172547)
