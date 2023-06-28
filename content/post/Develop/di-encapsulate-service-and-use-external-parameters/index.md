---
title: ASP.NET Core | 封裝 DI 的註冊行為時，同時使用外部參數來建立不同物件
description: 在 ASP.NET Core 中，當封裝依賴注入（DI）的註冊行為時，同時使用外部參數來建立不同的對象，本文介紹了兩種方法：直接使用 IHttpContextAccessor 和封裝 DI 所需的參數。並推薦使用後者，在不公開服務實作的前提下，通過介面獲取外部參數，以提高程式碼的可維護性和彈性。
date: 2023-06-14T12:56:50+08:00
categories:
  - 軟體開發
tags:
  - ASP.NET Core
  - DI
keywords:
  - Microsoft.Extensions.DependencyInjection
  - DI
  - IServiceProvider
  - HttpContextAccessor
slug: di-encapsulate-service-and-use-external-parameters
lastmod: 2023-06-27T15:17:59+08:00
---

當發現一個 .NET Core 的類別，其所有方法均需要相同的參數資料，這時，我們就會想到從 DI 下手，在建立物件時，一併把參數傳入。這樣就不需要在調用方式時，還要重複的傳入參數。

為了隱藏服務的實現細節，將 DI 的服務註冊行為加以封裝，但又需要 WebApi 的 HttpContext 內的參數，建立對應的物件。

在這篇文章紀錄了直接使用 IHttpContextAccessor 和封裝 DI 所需的參數，兩筆不同的作法。筆者個人推薦後者的作法。

> 🔖 長話短說 🔖
>
> - 若將 DI 的註冊行為封裝，但又需要傳入外部參數時，可使用 `interface` ，在取得參數資料的同時，隔離實作的細節。
> - 若 `IHttpContextAccessor` 未定義是，需要引用 `Microsoft.AspNetCore.Http` Nuget 套件。

<!--more-->

操作環境：

- Windows 11
- .NET Core 7

## 目的

若我們開發 ASP.NET Core 程式時，在特定的架構(ex. 三層式架構、洋蔥架構、Clean Archecture) 時，會把商業邏輯獨立在另一個 `dll` 專案內。但在使用 .NET DI 注入服務時，又希望 Service 的實作不公開，在 ASP.NET Core 的專案內無法查看 Service 的實作內容。

架構如下

```txt
Solution
├─ WebApi (ASP.NET Core)
└─ BusinessLogic (Library)
```

這時，我們可能會在 `BussinessLogic` 的專案內，建立一個 DI 使用的 Extnesion

```C#
public static class DiExtension  
{  
	public static void AddServices(this IServiceCollection services)  
	{  
		services.AddScoped<IUserService, UserService>();  
	}
}
```

以便 ASP.NET Core 內的 `Program.cs` 中，使用

```C#
// Program.cs

var builder = WebApplication.CreateBuilder(args);

// DI Service
builder.Services.AddServices();
```

這時, 因為所有的 User 相關 API 的路徑，都含有 `userId` 而且 UserService 內所有的方法，都需要傳入 `userId`，所以希望可以減少手動傳入參數的行為。

```C#
// IUserService
interface IUserService
{
	UserEntity GetUser(string userId);
	void SetUser(string userId, UserEntity entity);
	etc...
}

class UserService: IUserService
{
	public UserEntity GetUser(string userId){...}
	public void SetUser(string userId, UserEntity entity){...}
}
```

```C#
// API
[ApiController]  
[Route("[Controller]")]  
public class UserController : ControllerBase
{
	private readonly IUserService _service;
	public UserController(IUserService service)
	{
		_service = service;
	}

	[HttpGet("{userId}")]
	public IActionResult Get(string userId)
	{
		var user = _service.GetUser(userId);
		...
	}

	[HttpPost("{userId}")]
	public IActionResult Post(string userId, [FromBody] UserEntity entity)
	{
		_service.SetUser(userId, entity);
		...
	}
}
```

也就是將上述的程式，變更如下

```C#
// IUserService
interface IUserService
{
	UserEntity GetUser();
	void SetUser(UserEntity entity);
	etc...
}

class UserService: IUserService
{
	private readonly string _userId;

	public UserService(string userId)
	{
		_userId = userId
	}
	
	public UserEntity GetUser(string userId){...}
	public void SetUser(string userId, UserEntity entity){...}
}
```

```C#
// API
[ApiController]  
[Route("[Controller]/{userId}")]  
public class UserController : ControllerBase
{
	private readonly IUserService _service;
	public UserController(IUserService service)
	{
		_service = service;
	}

	[HttpGet]
	public IActionResult Get()
	{
		var user = _service.GetUser();
		...
	}

	[HttpPost)]
	public IActionResult Post(string userId, [FromBody] UserEntity entity)
	{
		_service.SetUser(entity);
		...
	}
}
```

## 實作

在完成 Webapi 與 Service 的調整後，最重要的地方，就是如何讓 [Microsoft.Extensions.DependencyInjection](https://github.com/aspnet/DependencyInjection) 注入 `userId` 的參數資訊。

在 [使用 DI 注入時，使用 Request 的參數，建立不同參數的物件]({{< ref "../di-service-provider-httpcontextaccessor/index.md" >}}) 這篇文章，提到可以使用 `HttpContextAccessor`，但當初是直接在 ASP.NET Core 內的 `Program.cs` 內，直接調用 ServiceProvider 取得 `IHttpContextAccessor`。

不過，這在這邊，我們已經把 Service 的 DI 設定，移到 Business.dll 的 DIExtension 中。那需要如何把所需的 `userId` 傳入呢？

因為 `userId` 資料，是調用 HttpContextAccessor 從 Route 中取得的資訊，所以別忘了在 `Program.cs` 加入`AddHttpContextAccessor`。

```C#
// Program

var builder = WebApplication.CreateBuilder(args);

// 在 DI 之中，增加 HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// DI Service
builder.Services.AddServices();
```

### 作法一: 直接調用 IHttpContextAccessor

再不想公開 Service 的實作下，也可以把 IHttpContextAccessor 的運用，移到 DIExtension 內。使用 `ServiceProvider.GetService<IHttpContextAccessor>` 的功能，取得 HttpContextAccessor。

注意：需要加入 `Microsoft.AspNetCore.Http`  Nuget 套件，否則無法識別 IHttpContextAccessor。

```C#
public static class DiExtension  
{  
	public static void AddServices(this IServiceCollection services)  
	{  
		services.AddScoped<IUserService>(provider =>
		{
			var accessor = provider.GetService<IHttpContextAccessor>();
			var userId  = (string?)accessor?.HttpContext?.GetRouteData().Values["userId"];

			return new UserService(userId);
		});  
	}
}
```

雖然，這樣就可以直接取得 HttpContext 內的資訊。

但缺點是

- 在 Business.dll 內，通常不會知道外部的參數是如何取得的。若今天 API 的 Route 異動，也需要異動 Business.dll。這會造成 Business.dll 與 api 的耦合。

### 作法二: 將 DI 所需要的參數封裝 

若要避免在 DIExtension 中實作取參數，可藉由 interface 來取得所需的參數。而實際負責取得參數資訊的實作，就直接放在 ASP.NET WebApi 專案內。

最後的專案結構如下

```txt
Solution
├─ WebApi (ASP.NET Core)
├─ BusinessLogic.Common (Library)
└─ BusinessLogic (Library)
```

首先，在建立一個共用的 Library (BusinessLogic.Common)，並建立 interface。

```C#
public interface IParameterService
{
	string GetUserId();
}
```

接著，在 WebApi 內，進行 `IParamterService` 的實作

```C#
public class ParameterService : IParameterService  
{  
	private readonly IHttpContextAccessor _accessor;  
  
	public ParameterService(IHttpContextAccessor accessor)  
	{  
		this._accessor = accessor;  
	}  
  
	public string GetUserId()  
	{  
		var userId = (string?)this._accessor.HttpContext?.GetRouteData().Values["userId"];  
		return userId ?? throw new ArgumentNullException(nameof(userId));  
	}  
}
```

最後，再調整 BusinessLogic 內的 DIExtension 即可。

```C#
public static class DiExtension  
{  
	public static void AddServices(this IServiceCollection services)  
	{  
		services.AddScoped<IUserService>(provider =>
		{
			var service = provider.GetService<IParameterService>();
			var userId  = service.GetUserId();

			return new UserService(userId);
		});  
	}
}
```

## 延伸閱讀

- [使用 DI 注入時，使用 Request 的參數，建立不同參數的物件]({{< ref "../di-service-provider-httpcontextaccessor/index.md" >}})