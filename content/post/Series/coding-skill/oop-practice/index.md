---
title: 物件導向設計原則
description: 知道物件導向的特性，就可以寫出具備閱讀性、維謢性、擴充性的程式碼？夢想很豐滿、現實很骨感。就算已經熟悉物件導向的特性，但在實務上還是很難寫寫出具備閱讀性、維謢性、擴充性的程式碼。此時可以配合
  SOLID 原則來輔助開發。
date: 2023-01-16T04:05:34.363Z
keywords:
  - OOP
  - Object-oriented
  - SOLID
  - SRP
  - OCP
  - ISP
  - DIP
  - Coupling
categories:
  - 軟體開發
tags:
  - OOP
slug: oop-practice
---

> [2018 iT 邦幫忙鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/1430)文章補完計劃，[持續優化程式碼品質-總覽]({{< ref "..\foreword\index.md#物件導向設計篇-object-oriented" >}})物件導向設計篇

知道物件導向的特性，就可以寫出具備**閱讀性**、**維謢性**、**擴充性**的程式碼？

夢想很豐滿、現實很骨感。就算已經熟悉物件導向的特性，但在實務上還是很難寫寫出具備閱讀性、維謢性、擴充性的程式碼。常見的因素有…

- 為了方便，類別函數全部設為 Public。(未有效使用**封裝**的特性。)
- 單一類別中，混雜了許多功能，導至要修改特定功能時，相關程式碼的變動量過大。(高耦合、不符合**單一職責**)
- 資料與商業邏輯混雜在一起。(高耦合)
- 當出現特定需求變更時，直接變更原本程式碼。除了可能改壞原本程式功能外，也會增加維護上的麻煩。

當然還有許多因素，是筆者沒有想到或是沒有列出來的。

<!--more-->

使用物件導向開發軟體的過程中，如果能配上*Robert C. Martin*提出的物件導向設計的五個原則(SOLID)：**單一職責**、**開放封閉**、**里氏替換**、**接口隔離**以及**依賴反轉**。這樣會更容易開發出易維護與擴展的系統。

## 物件導向設計的五原則 SOLID

### 單一職責原則(Single responsibility principle, SRP)

每個物件，不管是類別、函數，負責的功能，都應該只做一件事。

對函數而言，一個函數內，同時做了兩件以上的事情。當發生錯誤時，很難快速定位錯誤的原因。另外，也容易間接導至程式碼的可閱讀性降低。

### 開放封閉原則(Open-Close principle, OCP)

> 藉由**增加新的程式碼**來擴充系統的功能，而不是藉由**修改原本已經存在的程式碼**來擴充系統的功能。

當需求有異動時，要如何在不變動現在正常運行的程式碼，藉由**繼承**、**相依性注入**等方式，增加新的程式碼，以實作新的需求。

假若為了新需求，去修改了原本的程式中的某一個函數，可能會造成其他呼叫使用該函數的的功能，出現非預期的錯誤。

### 里氏替換原則(Liskov substitution principle, LSP)

> Functions that use pointers or references to base classes must be able to use objects of derived classes without knowing it.

簡單來說，當實作繼承了 interface 或 base-class的 sub-class，那麼在程式中，只要出現該 interface 或 base-class 的部份，都可以用 sub-class 替換。

### 接口隔離原則(Interface segregation principle, ISP)

針對不同需求的用戶，開放其對應需求的介面，提拱使用。可避免不相關的需求介面異動，造成被強迫一同面對異動的情況。

### 依賴反轉原則(Dependency inversion principle, DIP)

依賴反轉(Dependency inversion principle, DIP)是個人認為相當重要的原則，實務上使用的機率相當的高，不管是**單元測試**的實作、功能模組的替換，或是 Clean Architecture。都可以看到它的身影。

> 📝 DIP 的定義  📝
>
> A. High-level modules should not depend on low-level modules. Both should depend on abstractions. 高階模組不應該依賴於低階模組，兩者都該依賴抽象。
>
> B. Abstractions should not depend on details. Details should depend on abstractions. 抽象不應該依賴於具體實作方式。具體實作方式則應該依賴抽象。

當 A 模組在內部使用 B 模組的情況下，我們稱 A 為高階模組，B 為低階模組。**高階模組不應該依賴於低階模組，兩者都該依賴抽象介面。**

這兩條定義，說白一點，類別中，不應該直接使用另一個具有實作類別，而是使用抽象的介面，去承接繼承該介面的實作類別。**它的目標就是解除物件與物件間，兩者的直接相依關係。**

光看文字說明，就跟天書一樣，所以下面用一些例子來說明。

#### 高階模組依賴低階模組

```C#
public class ReportStatistic()
{
    private SQLAccess _access = new SQLAccess();
    
    public double Sum()
    {
        var items = _access.GetAllCost();
        ...
    }
}

public class SQLAccess
{
    public List<CostItem> GetAllCost()
    {
        ...
    }
}
```

從上面的程式碼可以看到，ReportStatistic (高階模組)緊緊依賴與 SQLAccess (低階模組)，筆者習慣稱這種情況為**高耦合**。

#### 解除物件與物件間，兩者的直接相依關係

當我們依據 DIP 的原則，將兩個物件均改為依賴抽象，那麼程式碼會變成……

```c#
public class ReportStatistic()
{
    private IAccess _access = new SQLAccess();
    
    public double Sum()
    {
        var items = _access.GetAllCost();
        ...
    }
}

public interfalce IAccess
{
    List<CostItem GetAllCost();
}

public class SQLAccess : IAccess
{
    public List<CostItem> GetAllCost()
    {
        ...
    }
}
```

#### 將依賴的物件，交給外部指定

雖然，我們使用抽象介面 IAccess 來承接低階模組 SQLAccess，達到使用依賴反轉，解決高階模組直接依賴低階模組的情況。但是，假若有一天，我們要替換低階模組，只好去變動原本程式碼，去達到替換的目標。

在上面的程式碼，可以猜到資料來源是使用 SQLAccess 這個類別，但是，如果今天有需求要求要從 csv 存取資料，我們也依據 DIP 原則，繼承 IAccess 實作了一個 CsvAccess。那程式碼應該會變成……

```c#
public class ReportStatistic()
{
    private IAccess _access = new CsvAccess();
    
    public double Sum()
    {
        var items = _access.GetAllCost();
        ...
    }
}

public class CsvAccess : IAccess
{
    public List<CostItem> GetAllCost()
    {
        ...
    }
}
```

這就很明顯的違背**開放封閉原則**了，那麼……要在不變動原本程式碼的前提下，去達到替換低階模組的目標，要怎麼做呢？

於是乎，就有人想到，那麼就**不要讓高階模組，自行控制低階模組的建立**。而是**將低階模組建立的控制權移到高階模組外部。**再將建立好的低階模組放到高階模組中，讓高階模組使用。

```c#
public class ReportStatistic()
{
    private IAccess _access = null
    
    ReportStatistic(IAccess access)
    {
        _access = access;
    }
    
    public double Sum()
    {
        var items = _access.GetAllCost();
        ...
    }
}

```

這種方式，就是我們常說的 `控制反轉(Inversion of Control ,IoC)` 與 `依賴注入(Dependency Injection, DI)` 這兩個名詞。

## 低耦合、高內聚

為什麼開發程式時，符合**低耦合**、**高內聚**的原則有什好處？

`耦合(Coupling)` 就是**兩個模組間的關連性或相依性**。

當兩模組間的相依性越高，那它們的耦合性越高，稱之為`高耦合`。反之，則謂之為低耦合。

在高耦合的情況下，很容易發生一種情況。明明只是一個很小的需求異動，但是連帶影響到跟它有相依關係的部份。造成修改一小塊程式碼，導至很多地方都出錯，要花額外時間去修正被影響的程式碼。

最常見的情況就是資料與商業邏輯的高耦合，或是 UI 與商業邏輯的高耦合。

`內聚(Cohesion)` 就是**模組本身不需依賴其他模組，就能完成工作。**

當模組的內聚力越高，表示模組包含的物件或功能就越多。

雖然提高了模組本身的獨立性，減少跟其他模組的耦合性，但也可能造成重覆程式碼，或違背單一職責原則的情況發生。

> 高內聚、低耦合的目的，就是為了**提升各模組功能的重用性、擴展性、維護性**。
> 講白一點，就是為了達到**盡可能不影響現有功能的前提下，完成需求異動的修改**的目標。

**內聚力**與**耦合性**就像天平的兩端，一邊增加，另一邊就必定減少。要如何取得兩者之間的水平，就非常考驗工程師本身的系統規劃與設計能力。

持續優化程式碼的要點之一，就是在每一次的開發中，適時使用重構的技巧，讓程式盡可能的符合**高內聚**、**低耦合**。這可以有效減少，後續需求變動時，所需變動修改的工作量。

如果軟體工程師沒有特別自我要求，又為了快速開發的目標，極有可能造成高耦合、低內聚這種，充滿壞味道的程式碼。如果軟體交付出去，就不需要維護跟修改，那當然沒有什麼影響。

但是……在軟體業，這樣的情況不能說沒有，但少至又少。大部份的情況，可能會要求變動部份功能，來應付另一個客戶的需求。

看倌們想像一下，有一支軟體當初為了快，造成程式碼中，UI、資料與商業邏輯的程式充滿了高耦合、低內聚的壞味道。而這支軟體，又因為客戶需求些微不同，分成了四、五個版本。

我們先假設，這支軟體原本的資料來源是 txt, 但好死不死，一年後，老闆指示這支軟體，所有出貨的版本，要求能同時支援 csv 的資料來源。

保證負責維護修改該軟體的工程師，會改到想吐血。這是因為高耦合、低內聚的程式，往往修改程式是牽一髮而動全身。而且無法直接替換模組，變成改完一個版本後，相同的事情可能要再重覆做。

## 後言

無論是 SOLID 的設計原則，或是低耦合、高內聚，都是提供軟體更大的需求修改的空間。

要特別提醒的是，符合 SOLID 的開發方式，雖然較易維護與擴展。**但就實務面而言，有時，必需考量使用 SOLID 額外帶來的開發時間，是否是開發期程所能承受的。**

## 延伸閱讀

▶ SOLID

- 搞笑談軟工, [SOLID：五則皆變](http://teddy-chen-tw.blogspot.tw/2014/04/solid.html)
- 搞笑談軟工, [亂談軟體設計（2）：Open-Closed Principle](http://teddy-chen-tw.blogspot.tw/2011/12/2.html)
- 搞笑談軟工, [亂談軟體設計（3）：Single-Responsibility Principle](http://teddy-chen-tw.blogspot.tw/2011/12/3.html)
- 搞笑談軟工, [亂談軟體設計（4）：Liskov Substitution Principle](http://teddy-chen-tw.blogspot.tw/2012/01/4.html)
- 搞笑談軟工, [亂談軟體設計（5）：Dependency-Inversion Principle](http://teddy-chen-tw.blogspot.tw/2012/01/5dependency-inversion-principle.html)
- Wiki, [SOLID (object-oriented design)](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design))
- Miles, [SOLID 之 開關原則（Open-Close principle）](https://ithelp.ithome.com.tw/articles/10192105)

▶ 依賴反轉

- Wiki, [Dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- In91, [[30天快速上手TDD][Day 5]如何隔離相依性 - 基本的可測試性](https://dotblogs.com.tw/hatelove/archive/2012/11/13/learning-tdd-in-30-days-day5-how-to-isolate-dependency-the-basic-testability.aspx)
- Jason Puzzle 中勝拼圖, [控制反轉 (IoC) 與 依賴注入 (DI)](https://blog.jason.party/3/ioc-di)

▶ 低耦合、高內聚

- 搞笑談軟體, [亂談軟體設計（1）：Cohesion and Coupling](http://teddy-chen-tw.blogspot.tw/2011/12/1.html)
- IT閱讀, [java多聚合，少繼承，低耦合，高內聚](http://www.itread01.com/articles/1478405709.html)
- iT邦幫忙, [中鳥階段-高內聚，低耦合。](https://ithelp.ithome.com.tw/articles/10080201)
