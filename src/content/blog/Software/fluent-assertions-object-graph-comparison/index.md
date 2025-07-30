---
title: "[Fluent Assertions] Object graph comparison"
description: 使用 FluentAssertions 4.13.1 版進行單元測試時，發現使用 Should().BeEquivalentTo() 比對失敗，在物件內容相同的情況下，仍報告資料不符合。此問題並非資料有誤，而是該方法本身有問題。解決方向為換為 ShouldBeEquivalentTo() 或升級到 5.0 版本以上。
tags:
  - 單元測試
date: 2021-02-11 14:00:22
categories:
  - 測試
keywords:
  - Fluent Assertion
slug: fluent-assertions-object-graph-comparison
lastmod: 2023-01-11T08:52:19.233Z
epic: software
---

日前在撰寫單元測試時，發生測試失敗，使用 `Should().BeEquivalentTo(expected)` 進行物件比對，已確認 `待測物件` 與 `期望物件` 內的資料相同，但卻出現 `be it misses` 造成的測試結果`失敗`。

所使用的 FlunentAssertion Nuget 版本為 `4.13.1` 。

<!--more-->

## 問題描述

為簡化問題的本身，在測試案例中，新增 `待測物件` 與 `期望物件` 兩個物件，且資料相同。以下是測試案列與錯誤訊息。

```csharp
[Fact]
public void Test()
{
    var actual = new List<Account>
    {
        new Account {Name = "T1", Money = 100},
        new Account {Name = "T2", Money = 20}
    };
    var expected = new List<Account>
    {
        new Account {Name = "T1", Money = 100},
        new Account {Name = "T2", Money = 20}
    };
    actual.Should().BeEquivalentTo(expected);
}

public class Account
{
    public string Name { get; set; }
    public decimal Money { get; set; }
}
```

測試錯誤訊息如下

```log
Xunit.Sdk.XunitException
Expected collection {

TestProject1.Account
{
   Money = 100M
   Name = "T1"
},

TestProject1.Account
{
   Money = 20M
   Name = "T2"
}} to be equivalent to {

TestProject1.Account
{
   Money = 100M
   Name = "T1"
},

TestProject1.Account
{
   Money = 20M
   Name = "T2"
}}, but it misses {

TestProject1.Account
{
   Money = 100M
   Name = "T1"
},

TestProject1.Account
{
   Money = 20M
   Name = "T2"
}}.
   at FluentAssertions.Execution.XUnit2TestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Collections.CollectionAssertions`2.BeEquivalentTo[T](IEnumerable`1 expected, String because, Object[] becauseArgs)
```

## 問題排除

查詢 `Should().BeEquivalentTo`，發現 `Fluentassertions` 已經有人反應這個 [issue](https://github.com/fluentassertions/fluentassertions/issues/771) 了。

### 方案一: 變更使用的方法

在 Fluentassertions Nuget 套件不升級的條件下，將 `Should().BeEquivalentTo` 變更為 `ShouldBeEquivalentTo`() 或 `ShouldAllBeEquivalentTo()` 就能順利通過測試。

```csharp
[Fact]
public void Test()
{
    var actual = new List<Account>
    {
        new Account {Name = "T1", Money = 100},
        new Account {Name = "T2", Money = 20}
    };

    var expected = new List<Account>
    {
        new Account {Name = "T1", Money = 100},
        new Account {Name = "T2", Money = 20}
    };

    // 以下兩種驗證方式，均通過測試
    actual.ShouldBeEquivalentTo(expected);
    actual.ShouldAllBeEquivalentTo(expected);
}
```

### 方案二: 升級到 version 5.0 以上

在反應的 [Issue](https://github.com/fluentassertions/fluentassertions/issues/771) 的最後，[FluentAssertions](https://github.com/fluentassertions) 專案的維護者 `Dennis Dooman` 也回應在 5.0 以上的版本，已修正此問題。

筆者實際升級到 5.0 之後，確實也能順利通過測試。

## 函數小筆記

### `.Should().BeEquivalentTo()`

- 可用於比對 Collection, Dictionaries
- 針對物件再次出現(recurs)的 Field 與 Properity 進行比對。預設比對方式如同 `Object.Equals`

### `.ShouldBeEquivalentTo()`

- 因為容易與 `Should().BeEquivalentTo()` 搞混，所以在 5.0 之後，該方法已經被拔除。

### `.ShouldAllBeEquivalentTo ()`

- 在 5.0 之後，該方法已經被拔除。

### 小結

|                                  | version 5.0 before | version 5.0 later |
| -------------------------------: | :----------------: | :---------------: |
| .Should().ShouldBeEquivalentTo() |         V          |         V         |
|          .ShouldBeEquivalentTo() |         V          |                   |
|      .ShouldAllBeEquivalentTo () |         V          |                   |

## 參考資訊

- [Fluent Assertions](https://fluentassertions.com/)
- [Object graph comparison](https://fluentassertions.com/objectgraphs/)
- [Fluent Assertions 5.0: The best unit test assertion library in the .NET realm just got better](https://www.continuousimprover.com/2018/02/fluent-assertions-50-best-unit-test.html)
- [FluentAssertions: ShouldBeEquivalentTo vs Should().Be() vs Should](https://stackoverflow.com/questions/25925568/fluentassertions-shouldbeequivalentto-vs-should-be-vs-should-beequivalent)
