---
title: ASP.NET Core | 淺談 Authentication 與 Authorization 機制
description: null
date: 2023-02-16T05:31:50.686Z
categories: null
tags:
  - Authentication
  - Authorization
  - ASP.NET CORE
keywords:
  - authorization
  - authentication
  - policy-based
  - claims-based
draft: true
slug: net-core-authenticaiton-authorization
---

`身份驗證(Authentication)` 也被稱為 `認證` 或 `鑑權`，是通過特定的方式來確認使用者身份的過程。身份驗證的目的是確保當前所聲稱的使用者身份確實是所聲稱的使用者。

`授權(Authorization)` 則是根據使用者的身份，判斷使用者可以訪問哪些資源。以確保只有經過身份驗證的使用者才能訪問特定資源。因此，身份驗證和授權通常是一起使用的。

在現代資訊技術領域中，身份驗證和授權通常是非常重要的安全措施，因為它們可以幫助確保系統和資料的安全。

在下面的內容，將進一步的理解與研究 ASP.NET Core 中，Authentication 與 Authorization 的原理與概念。

> 🔖 長話短說 🔖
>
> - `認證(Authentication)` 用於確認身份。 *who you are*
> - `授權(Authorization)` 決定能作什麼事。*what you're allowed do*
> - ASP.NET Core 使用大量的 Middleware，在實作 `認證` 與 `授權` 時，需注意 Middleware 的順序。`Routing` ↦ `Authentication` ↦ `Authorization` ↦ `EndPoint`
> - `HttpContext.User` 是貫通 ASP.NET Core 認證與授權的重要角色。其中記錄了 `ClaimsPrincipal`、`ClaimsIdentity`、`Claim` 的資訊結構。
> -

<!--more-->

## Middleware pipeline

在聊 ASP.NET Core 之前，需要對 Middleware Pipeline 有基本的概念。這可以讓我們了解 Authentication 與 Authorization 應擺放的位置與動作的時機。

![從請求到回應的過程中，經過 N 個 Middleware](images/request-response-middleware-pipeline.png)

![官方提供的 Middleware Pipeline 的順序](images/middleware-pipeline.svg)

在 ASP.NET Core 專案建立時，預設使用 `UseAuthorization` 。所以 `UseAuthorization` 直接在宣告在 `UseAuthentication` 前面即可。

微軟官方網站特別提醒，若有使用 `UseRouting` 與 `UseEndpoints` 的話，`UseAuthentication` 與 `UseAuthentication` 應位於 `UseRouting` 與 `UseEndpoints` 中間。

```c#
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.EndPoints();
```

順帶一提，`UseAuthentication()` 會在 Middleware 插入 [AuthenticationMiddleware](https://github.com/dotnet/aspnetcore/blob/main/src/Security/Authentication/Core/src/AuthenticationMiddleware.cs) 。而 `UseAuthorization()` 則是插入 [AuthorizationMiddleware](https://github.com/dotnet/aspnetcore/blob/main/src/Security/Authorization/Policy/src/AuthorizationMiddleware.cs)。

接著把焦點放在 `Routing`、`Authentication`、`Authorization`、`EndPoints` 四個 Middleware  。

`RoutingMiddleware`

在 .NET Core 中，判斷控製器行動是否需要授權是在 Routing Middleware 中完成的。當請求進入應用程序時，Routing Middleware 會檢查 URL 和 HTTP 方法，然後決定應該調用哪個控製器行動。如果找到了匹配的控製器行動，Routing Middleware 會將其指派給下一個 Middleware，即 Authorization Middleware，以確定請求是否需要授權。

在 Authorization Middleware 中，將對 ActionDescriptor（即路由到的控製器行動）進行分析，確定是否存在授權要求（如 AuthorizeAttribute），如果存在，則使用相應的授權策略對請求進行授權。

總之，Routing Middleware 將請求對應到控製器行動，並將其傳遞給 Authorization Middleware 進行授權。在 Authorization Middleware 中，控製器行動的描述資訊（ActionDescriptor）被使用以判斷授權需求，並使用授權策略進行授權。

`AuthenticationMiddleware` 與 `AuthorizationMiddleware` 負責身份驗證與授權，詳細行為後續會進一步探討，這邊先略過不提。

`EndPointsMiddleware`

![Routing/EndPoints 的功用](images/middleware-active-initial.png)

## Claims-based Authenticaton

`HttpContext` 則是整個 Middleware Pipeline 的靈魂人物，在 `認證` 與 `授權` 的過程中，會使用到 `HttpContext.User`，而 HttpContext.User 的資料型態為 `ClaimsPrincipal`。

ClaimsPrincipal 又是由 `ClaimsIdentity` 與 `Claims` 組成，記錄已驗證的主體(使用者或應用程式)身份。

![Claims, ClaimsIdentity, ClaimsPrincipal 關係](images/claims-identity-principal-structure.png)

### Claim 宣稱

宣稱關於主體的特徵資訊，以 `Type:Value` 的方式表示主體的某些特性。例如 UserName, Email 等等資訊。

![主體的某些特微資料，例如員工編號](images/claim-sample.svg)

```C#
// 可使用 .NET 預先定義的 ClaimTypes 或 自行定義 Type
var claim1 = new Claim(ClaimTypes.Name, "Lab");
var claim2 = new Claim("UID", "FTSX1854ASF");
```

### ClaimsIdentity 宣稱身份

ClaimsIdentity 是 Claim 的集合體，代表了主體的其中一種身份資訊。

舉例來說，一個人在不同的場域，就會有著不同的身份特徵。

- 在公司職場，它的身份特徵可能是 `員工編號`、`部門`、`職等`、`職稱` 等等。
- 在家庭，它的身份特徵就是 `角色`、`聯絡電話` 等等。

![一個人在不同場域，有著不同的身份](images/claims-identity-sample.svg)

```C#
// 建立多組 Claims 資料
var claims = new List<Claim>  
{  
    new Claim(ClaimTypes.Name, "Lab"),
    new Claim("UID", "FTSX1854ASF"),
    new Claim(ClaimTypes.Role, "Guest"),
};  

// 建立 ClaimsIdentity 並指定使用的 Authentication Scheme
var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);  
```

### ClaimsPrincipal 宣稱主體

ClaimsPrincipal 表示了主體的身份資訊，包含了一到多個的 ClaimsIdentity。

![主體包括多個身份識別的資訊](images/claims-principal-sample.svg)

```C#
// 建立多組 Claims 資料
var claims = new List<Claim>  
{  
    new Claim(ClaimTypes.Name, "Lab"),  
    new Claim("UID", "FTSX1854ASF"),  
    new Claim(ClaimTypes.Role, "Guest"),  
};  

// 建立 ClaimsIdentity 並指定使用的 Authentication Scheme
var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);  

// 建立 ClaimsPrincipal
var principal = new ClaimsPrincipal(claimsIdentity);  
```

## 身份認證 Authentication

首先，簡單描述一下 Authentication 的動作流程。

AuthenticationMiddleware 會在應用程式中的某個階段執行，以確保該請求被完全解析。它會根據應用程式設定中所設置的 Authentication Scheme，選擇合適的驗證提供者來對該請求進行驗證。當驗證成功時，它會將該請求標記為已通過驗證，並將相關的 Claims 保存到 HttpContext.User 中，這樣後續的 middleware 和 controller 就可以使用這些 Claims 來進行授權等操作。

當 AuthenticationMiddleware 開始執行時，它會從 HTTP 請求中提取驗證相關的資訊，比如 Cookies、Headers 或 Query Strings。然後，它會使用選擇的 Authentication Scheme 來進行驗證。如果驗證成功，它就會將相關的 Claims 保存到 HttpContext.User 中。

在 ASP.NET Core 中，AuthenticationMiddleware 可以使用不同的 Authentication Scheme 來進行驗證。ASP.NET Core 提供了一些內建的 Authentication Scheme，比如 Cookies、JwtBearer、OpenIdConnect 等，我們也可以使用第三方的 Authentication Scheme，比如 Google、Facebook 等，來進行驗證。

在 ASP.NET Core 中，AuthenticationMiddleware 的底層實現是基於抽象類型 AuthenticationHandler。每個 Authentication Scheme 都需要實現一個繼承自 AuthenticationHandler 的自定義 AuthenticationHandler 類型，並實現 HandleAuthenticateAsync () 方法和相關的方法，以實現該 Authentication Scheme 的驗證功能。

簡而言之，AuthenticationMiddleware 是 ASP.NET Core 中的一個 middleware，它用於處理驗證相關的工作。它會根據應用程式設定中所設置的 Authentication Scheme，選擇合適的驗證提供者來對該請求進行驗證，並將相關的 Claims 保存到 HttpContext.User 中。它的底層實現是基於抽象類型 AuthenticationHandler，並且每個 Authentication Scheme 都需要實現一個自定義的 AuthenticationHandler 類型，以實現該 Authentication Scheme 的驗證功能。

Authentication Scheme 指的是驗證方案的概念，每個驗證方案代表一種身份驗證的方法。例如，ASP.NET Core 中內置了 Cookie、JWT、OAuth 等身份驗證方案。當應用程序需要進行身份驗證時，需要選擇一個驗證方案。

AuthenticationHandler 是處理身份驗證方案的具體實現。每個驗證方案都有一個相應的處理程序。例如，Cookie 驗證方案對應的處理程序就是 CookieAuthenticationHandler。當應用程序進行身份驗證時，Authentication Middleware 會根據選擇的驗證方案，調用相應的 AuthenticationHandler 來進行驗證。

當 Authentication Middleware 接收到請求時，它會根據請求中包含的身份驗證信息選擇對應的 AuthenticationHandler 進行處理。AuthenticationHandler 會將請求中的身份驗證信息進行驗證，並從中解析出包含在身份驗證信息中的 Claims（聲明）。之後，Authentication Middleware 會將這些 Claims 放入一個 ClaimsIdentity 對象中，然後將這個對象作為 User 設置到 HttpContext 中，以便後續操作可以使用這些身份驗證信息。

當後續操作需要進行身份驗證時，它們可以通過讀取 HttpContext.User 屬性來獲取 ClaimsIdentity 對象，從而獲取相應的身份驗證信息。

簡單來說，Authentication Scheme 提供了不同的身份驗證方法，而 AuthenticationHandler 則實現了這些身份驗證方法。Authentication Middleware 則負責根據請求中的身份驗證信息選擇對應的 AuthenticationHandler 進行處理，並將驗證結果放入 HttpContext.User 屬性中，以便後續操作使用。

在 AuthenicationMiddleware 中會藉由 `IAuthenticationHandler` 調用 `` 與 `IAuthenticationService`。

![使用者身分，在 AutnenticationMiddle 前後的變化](images/authentication-middleware-action.png)

Learn how ASP.NET Core handles the Authentication using **Authentication Handlers**, **Authentication Scheme** & **Authentication Middleware**,

### Authentication 的概念

Authentication 的方式很多, 有

- Cookie-based authentication
- Token-based authentication
-

### Authentication Handlers

### Authentication Schema

### IAuthenticationService

在 `IAuthenticationService` 定義 5 種行為：

- Authenticate (get any authentication data for a request)
- Challenge (used for unauthenticated requests)
- Forbid (used when an authenticated request should be denied)
- SignIn (associate a ClaimsPrincipal)
- SignOut (remove any associated data)

// 關係圖解

![打 API 的 HttpContext.User 變動](images/authentication-middleware-log-verify.png)

![Logout 後的變化](images/authentication-middleware-log-logout2.png)

![Logout](images/authentication-middleware-log-logout.png)

![Login 之後，HttpContext.User 並不會發生變化。](images/authentication-middleware-log-login.png)

```C#
// 重要
await this.HttpContext.SignInAsync(principal);
```

```C#
// 登出
await this.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
```

#### 程式碼解讀

進一步查看 GitHub 上的 [AuthenticationHttpContextExtensions.cs](https://github.com/dotnet/aspnetcore/blob/main/src/Http/Authentication.Abstractions/src/AuthenticationHttpContextExtensions.cs) 內，關於 `HttpContext.SignInAsync` 與 `HttpContext.SignOutAsync` 的實作部份，會發現它的使用 `AuthenticationSchema` 的資訊，取出對應的 Authentication Service，再由這些服務進行處理。

## 授權 Authorization

在 .NET Core 中，Authorization 的作用是控制誰可以訪問應用程式中的不同資源。與身份驗證不同，身份驗證是驗證使用者的身份，而授權是基於該使用者是否具有訪問資源的權限。

在 .NET Core 中，授權是通過一系列的策略來實現的。策略是一組規則，可以確定一個使用者是否被授權訪問一個特定的資源。策略可以基於使用者的身份資訊，例如他們的角色、聲明、訪問令牌等。可以使用策略來限制某個使用者的存取權，例如只允許管理員使用者訪問某些資源。

在 .NET Core 中，可以使用基於聲明的授權和基於角色的授權。基於聲明的授權可以讓應用程式根據聲明授予使用者存取權。聲明是關於使用者的資訊，例如他們的姓名、電子郵件地址、生日等。基於角色的授權允許你使用角色來定義存取權。使用者可以被分配一個或多個角色，這些角色可以授予使用者訪問特定資源的權限。

在 .NET Core 中，授權可以通過多種方式進行實現，包括聲明授權、基於角色的授權、策略授權和資源授權等。例如，可以使用 ASP.NET Core Identity 來實現基於角色的授權，或者可以使用自訂策略和授權處理程序來實現更高級的授權方案。

總的來說，.NET Core 提供了靈活的授權機制，使應用程式能夠對使用者進行身份驗證並為其提供授權，以控制對資源的訪問。

在 .NET Core 中，授權的底層原理是通過中介軟體和處理程序來實現的。Authorization Middleware 是 ASP.NET Core 中的一種中介軟體，它在請求管道中的處理流程中，根據應用程式組態的授權策略對使用者的請求進行授權驗證。在 Authorization Middleware 中，授權策略由一系列授權處理程序 (Authorization Handlers) 實現。

授權處理程序是一些邏輯程式碼，用於驗證授權策略是否被滿足，即使用者是否有權訪問請求的資源。處理程序可以在系統中任何位置實現，從而允許自訂處理程序，以滿足應用程式特定的授權需求。

在處理使用者的請求時，Authorization Middleware 會呼叫與授權策略關聯的處理程序。這些處理程序會檢查使用者的身份、角色和聲明等資訊，然後確定使用者是否有權訪問請求的資源。如果授權成功，請求將被傳遞到應用程式的下一層，否則請求將被拒絕，並返回相應的 HTTP 狀態碼。

Authorization Middleware 還提供了一些可用於組態授權策略的選項，例如使用 RequireAuthenticatedUser 方法強制要求使用者必須經過身份驗證才能訪問資源，或者使用 RequireClaim 方法來檢查使用者是否具有特定聲明等。除此之外，還可以使用授權策略的方法，例如 RequireRole 和 RequireAssertion 來自訂授權策略。

總的來說，Authorization Middleware 通過授權策略和處理程序來確定使用者是否有權訪問請求的資源，從而實現授權的功能。這種機制提供了靈活的授權選項，並且可以與不同的身份驗證方案一起使用，以提供更加細粒度的授權控制。

當請求到達 ASP.NET Core 應用程式時，Authorization Middleware 首先會檢查請求是否需要授權，即是否已為請求指定了授權策略。如果請求需要授權，Authorization Middleware 將使用 ASP.NET Core 中的管道機制對請求進行分析和處理。

在管道中的處理流程中，Authorization Middleware 會使用組態的授權策略對請求進行授權驗證。授權策略是由一系列授權需求 (Authorization Requirements) 組成的集合，這些需求描述了使用者必須滿足的條件，才能被授予訪問請求的資源的權限。授權需求通常包括角色、聲明、策略等資訊。

Authorization Middleware 還會將授權策略與應用程式中的授權處理程序 (Authorization Handlers) 相關聯。授權處理程序是一些邏輯程式碼，用於驗證授權策略是否被滿足。每個授權需求都會有一個關聯的授權處理程序，用於檢查使用者的身份、角色和聲明等資訊，然後確定使用者是否有權訪問請求的資源。如果授權成功，請求將被傳遞到應用程式的下一層，否則請求將被拒絕，並返回相應的 HTTP 狀態碼。

授權處理程序可以在系統中任何位置實現，從而允許自訂處理程序，以滿足應用程式特定的授權需求。ASP.NET Core 中提供了一些默認的授權處理程序，如聲明授權處理程序 (Claims Authorization Handler)、角色授權處理程序 (Roles Authorization Handler) 等，還可以使用自訂授權處理程序來滿足應用程式的特定授權需求。

當授權需求和授權處理程序被組合起來後，Authorization Middleware 將對請求進行授權驗證。如果授權成功，則請求將被傳遞到應用程式的下一層。如果授權失敗，則請求將被拒絕，並返回相應的 HTTP 狀態碼。

總的來說，Authorization Middleware 通過授權策略和授權處理程序來確定使用者是否有權訪問請求的資源，從而實現授權的功能。這種機制提供了靈活的授權選項，並且可以與不同的身份驗證方案一起使用，以提供更加細粒度的授權控制。

在 .NET Core 中，Authorization Middleware 會處理所有傳入的 HTTP 請求，並確認每個請求是否被授權訪問受保護的資源。在這個過程中，會涉及到幾個重要的概念和原理。

首先，要瞭解 Authorization Requirements，這代表了一個授權的規則，例如滿足某個條件才能夠訪問資源。在 .NET Core 中，可以通過繼承 IAuthorizationRequirement 介面來創建自定義的授權規則。例如，可以創建一個 MinimumAgeRequirement，要求使用者必須滿 18 歲才能夠訪問某個資源。

然後，我們需要一個方法來檢查是否滿足授權規則。這就是 Authorization Handlers 的作用，它會根據授權規則的要求來檢查使用者是否有權訪問該資源。在 .NET Core 中，可以繼承 `AuthorizationHandler<TRequirement>` 類別來創建自定義的授權處理器。例如，可以創建一個 MinimumAgeHandler，檢查使用者是否滿 18 歲。

最後，我們需要一個方式來將授權規則與授權處理器關聯起來。這就是 policy 的作用。Policy 是一個授權規則的集合，並且與每個規則關聯的授權處理器。在 .NET Core 中，可以通過 AuthorizationPolicyBuilder 類別創建自定義的 policy，並將授權規則和授權處理器新增到 policy 中。

當 Middleware 收到一個 HTTP 請求時，它會使用 PolicyEvaluator 來評估該請求是否符合 policy。PolicyEvaluator 會逐一檢查 policy 中的每個授權規則，並調用相應的授權處理器進行檢查。如果所有規則都通過了檢查，那麼請求就會被授權訪問受保護的資源。否則，該請求就會被拒絕訪問。

總的來說，.NET Core 的 Authorization Middleware 通過使用授權規則、授權處理器和 policy，實現了一個高度可定製和可擴展的授權機制。開

當一個要求到達 Authorization Middleware，Middleware 將嘗試確定是否有已組態的策略存在以滿足要求。一個策略是一組要求必須滿足的規則。

要定義策略，您可以使用 AuthorizationOptions，在啟動應用程序時使用 AddPolicy 方法。

將某些資源與某些策略綁定在一起的步驟稱為授權。授權策略表示在特定的條件下，使用者被授權執行某些操作。

如果策略存在，則它將被使用來判斷是否滿足要求。對於自定義的要求，您可以自己定義 Handler，它將檢查是否符合特定的要求。

AuthorizationHandler 是一個中介軟體，用於檢查授權要求是否得到滿足。它可用於自定義要求，並且可以將其繼承到自定義 handler 類型中。

使用自定義的要求類型和相應的處理程序類型時，將使用 AddAuthorization 方法新增。

最後，可以使用授權標記在 Action 或 Controller 中標記特定的資源，並指定應該滿足哪些策略才能訪問該資源。

總的來說，.NET Core 的授權是一個靈活且可擴展的系統，可以很好地支援各種不同的授權場景。透過使用策略和 Handler，以及自定義的要求和授權標記，可以建構出完整的授權解決方案，以確保應用程式的安全性和可靠性。

當在 ASP.NET Core 中使用 [Authorize] 屬性標記一個 controller action 時，該屬性會指示 ASP.NET Core middleware 在該 action 執行之前進行身份驗證和授權檢查。

在進行授權檢查時，middleware 會檢查該 action 上是否有指定的 policy。Policy 是一個命名的規則集合，它定義了哪些使用者可以存取受保護的資源。每個 policy 包含一個或多個 requirement，當滿足 requirement 時，使用者才會被授予存取權限。

在檢查 policy 時，middleware 會呼叫相應的 authorization handler，該 handler 可以決定使用者是否滿足該 policy 的要求。如果使用者滿足 policy 的要求，middleware 將允許該 action 的執行，否則 middleware 將拒絕該 action 的執行並返回未授權的錯誤訊息。

簡單來說，當在 controller action 上使用 [Authorize] 屬性時，middleware 會檢查使用者是否通過身份驗證，並使用指定的 policy 檢查使用者是否具有存取該 action 的權限。如果使用者通過了所有檢查，則可以訪問該 action，否則將被拒絕訪問並返回未授權的錯誤訊息。

接著就是到要授權管理的地方加上 `[Authorize]` 屬性

```c#
[ApiController]  
[Route("[controller]")]  
[Authorize]  
public class TodoController : ControllerBase  
{  
}
```

### Authorization 概念

#### IAuthorizationRequirement

#### Authorization Handlers

### Policy-based Authorzation

#### Policy

#### Requirement

#### Handler

## 延伸閱讀

▶ Middleware 觀念

- [ASP.NET Core Middleware | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-7.0)

▶ Authentication 觀念

- [Overview of ASP.NET Core Authentication | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-7.0)
- [Microsoft.AspNetCore.Authentication 命名空間 | Microsoft Learn](https://learn.microsoft.com/zh-tw/dotnet/api/microsoft.aspnetcore.authentication?view=aspnetcore-7.0)
- [[.NET Core] ASP .NET Core 3.1 驗證與授權 (一)- 驗證與授權](https://blogger.tigernaxo.com/post/dotnetcore31/auth/auth_guild_1/)
- [Introduction to Authentication in ASP.NET Core - TekTutorialsHub](https://www.tektutorialshub.com/asp-net-core/authentication-in-asp-net-core/)
- [ASP.NET Authentication: A Practical Guide | Frontegg](https://frontegg.com/blog/asp-net-authentication)

▶ Authorization 觀念

- [Claims-based authorization in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims?view=aspnetcore-7.0)
- [Policy-based authorization in ASP.NET Core | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-7.0)
- [Policy-based Authorization in ASP.NET Core - A Deep Dive - Simple Talk (red-gate.com)](https://www.red-gate.com/simple-talk/development/dotnet-development/policy-based-authorization-in-asp-net-core-a-deep-dive/)
