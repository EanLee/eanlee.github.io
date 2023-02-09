---
title: Fluent Assertions 使用筆記
description: null
date: 2023-02-08T02:37:57.885Z
categories:
  - 軟體開發
  - 測試
tags:
  - 單元測試
keywords:
  - Fluent Assertion
draft: true
slug: fluent-assertions-notes
---

> 🔖 長話短說 🔖
> FluentAssertion 的筆記如下
>
> - 針對 Exception 的 assert，先將待測方法委派給 `Action` 後，再對 Action 使用 `.Should().Throw<Exception>()`
>

<!--more-->

## Fluent Assertions 使用筆記

### Throw Exception

```C#
public class TestObject
{
    public void Method()
    {
        throw new Exception();
    }
}


[Fact]
public void TestCase()
{
    // arrange
    var testObject = new TestObject();

    // 待測試的方法
    Action action = () => testObject.Method();

    // assert
    action.Should().Throw<Exception>();
}
```

### 物件內的部份欄位比對

## 延伸閱讀

▶ 站內文章

- [Exceptions - Fluent Assertions](https://fluentassertions.com/exceptions/)