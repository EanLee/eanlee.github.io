---
title: 淺談單元測試的撰寫
description: 分享寫單元測試過程中，經常被人詢問議題，或是自己遇到困惑點
date: 2022-08-04T06:22:43.518Z
keywords:
  - 單元測試
  - Unit Test
categories:
  - 測試
  - 開發雜談
tags:
  - 單元測試
lastmod: 2022-08-04T12:30:07.612Z
slug: talking-writing-unit-tests
---

近年來，在業界各位前輩的推展下，越來越多人知道單元測試，並且開始撰寫單元測試。

但有些撰寫單元測試過程中，遇到有些經常被人詢問議題，或是自己撰寫過程所遇到困惑點，在這分享個人的觀點。

- 運用單元測試，讓工具可以自動化一再反覆驗證核心業務邏輯或是高風險的邏輯，以確保業務邏輯或規則的正確性。
- 對於沒有測試保護的程式，使用已知的使用情境案例，從修改部份進行最大範圍的框選，運用粗顆粒的測試案例，讓修改部份，有個基本的保護。
- 對於需要注入眾多物件的類別，應考量是否需要進行功能切分。減少單元測試的複雜性，提升程式的維護性。

<!--more-->

## 單元測試的重點

在單元測試，有時我們會去關心測試覆蓋率 (Code Coverage) 的數值，但是是否需要追求 100% 的 Code coverage 嗎？

個人認為不需要，依據 80/20 法則，可能程式碼內的 20% 的部份，乘載了 80% 的業務行為。這 20% 的程式碼是系統的核心關鍵業務，換個角度來看，這 20% 的程式碼，承擔了 80% 的風險。

回到測試的本質，是為了讓核心業務邏輯或是高風險的邏輯，可以一再被的反覆驗證。所以運用單元測試，讓開發工具可以自動化針對程式內的業務邏輯，進行驗證，以確保業務邏輯或規則的正確性。

以電商系統而言，可能購物車金額計算與結帳交易的部份，只佔整個系統不到 20%，但這部份卻是最重要的業務核心。針對這個部份進行單元測試的撰寫，以最小的範圍的測試保護，得到最大的成效。

高變動性的操作邏輯或是防保是否需要進行單元測試，個人認為不需要，因為變動過多，會導致額外維護單元測試的工作。可考量右移至整合測試或 End-To-End 測試的階段。

順帶一提，若防保的檢查機制與業務邏輯相關的話，就必需列入單元測試的考量範圍內。

## 沒有測試保護的程式，要如何下手？

當接手 Legacy Code 時，可能會發現沒有任何測試保護，造成程式調整後，開發人員自己也無法百分百保証，原先的功能都能正確動作。就可能出現改 A 壞 B 的情況發生。

個人認為可以先從要修改部份，最大範圍的進行框選，使用已知的使用情境案例，撰寫測試，進行保護。無需執著於單元測試這個名稱。

這些測試案例的測試維度，基本上顆粒極大，可能很包含很多很雜的識責。但沒有關係，重點在於有個基本的保護。

後續隨著功能修改與重構，也會增加對應的測試案例，這些測試案例的顆粒度會更細，更針對應特定業務邏輯。

隨著案例的增加，可能在某一天，原本粗顆粒的測試案例的業務邏輯，已完全被其他測試案例的 Cover，這時團隊的開發人員，可以討論原本粗顆粒的測試案例是否保留或是移除。

順帶一提，在補上測試案例時，可能會與 Refactoring 配合交互進行，所以調整的步伐要盡可能的小步。

## 需注入眾多相依物件的類別，是否需要 Mock 所有的依賴類別？

已經存在一個運行數年的類別 ShoppingCartService，也已經存在了多組測試案例保護。

如今，購物車需要支援優惠活動，而活動的折扣計算，依據活動的扣折規則與會員等級的不同，計算出不同的扣折金額。

此時，因為這個扣折金額與購物車相關，所以我們可能會下意識，將取得折扣金額的方法 `GetDiscount`，放入 ShoppingCartService 之中。

```C# {linenos=inline, hl_lines=[11,"26-32"]}
/// <summary>
/// 購物車
/// </Summary>
public class ShoppingCartService
{
    void ShoppingCartService(
        IProductionService productionSerice,
        IProductionSkuService prouctionSkuService,
        IMemberService memberService,
        IRateLimitService rateLimitService,
        IPromotionService promotionService,
        IShoppingCartRepository shoppingCartRepository,
        ...)
    {
        // ....
    }

    /// <summary>
    /// 計算購物車內的金額
    /// </summary>
    public void Calcualate(ShoppingCartEntity shoppingCart)
    {
       // 使用 IProductionService, IProductionSkuService, IMemberService, etc.
    }

    /// <summary>
    /// 取得購物車的折扣金額
    /// </summary>
    public decimal GetDiscount(ShoppingCartEntity shoppingCart)
    {
        // 只使用 IMemberService, IPromotionService 進行購物車折扣後的計算
    } 

    private void Verify(ShoppingCartEntity shoppingCart)
    {
        // 使用 IProductionService, IProductionSkuService
    }
}

```

若要針對全新的方法 `GetDiscount` 進行測試的補足，在撰寫的單元測試時，可能會出現兩種撰寫風格。這兩種風格沒有好壞，只要團隊成員成員有共識即可。

### 兩種測試案例的撰寫風格

▶ **直接在現有的單元測試類別中，加入新的測試案例。**

```C# {linenos=inline, hl_lines=[8, 17]}
class ShoppingCartServiceTest
{
    IProductionService _productionSerice;
    IProductionSkuService _prouctionSkuService;
    IMemberService _memberService;
    IRateLimitService _rateLimitService;
    IShoppingCartRepository _shoppingCartRepository;
    IPromotionService _promotionService;

    public ShoppingCartServiceTest()
    {
       this._productionSerice = Substitute.For<IProductionService>();
       this._prouctionSkuService = Substitute.For<IProductionSkuService>();
       this._memberService = Substitute.For<IMemberService>();
       this._rateLimitService = Substitute.For<IRateLimitService>();
       this._shoppingCartRepository = Substitute.For<IShoppingCartRepository>();
       this._promotionService = Substitute.For<IPromotionService>();
    }

    public IShoppingCartService CreateShoppingCartService()
    {
        var service = new ShoppingCartService(
            this._productionSerice,
            this._prouctionSkuService,
            this._memberService,
            this._rateLimitService,
            this._promotionService,
            this._shoppingCartRepository);
        
        return service;
    }

```

```C# {linenos=inline, linenostart=312 hl_lines=[7, 17]}
    [Fact]
    public void NewTestCase()
    {
        var service = this.CreateShoppingCartService();
        
        // ...
    }
}
```

假若該測試類別，已經把初始化 ShoppingCartService 抽為一個方法 `CreateShoppingCartService`。

直接使用現有的單元測試類別，並加其中直接加入測試案例的好處。

- 無需再另外 Mock 其他依賴的類別
- 與 ShoppingCartService 相關的測試案例，都集中在同一地方。

但也有比較需要額外注意的地方

- 測試類別內的測試案例過多過雜，要找到特定案例的時間較長。
- 需 Mock 所有相依的物件，即使於與此次測試案例無關，無法在測試案例中直接確認，與案例相關的物件。
- 重覆使用的 Mock 物件，若未注意設定或使用方式，可能會出現非預期的問題。

▶ **另開一個新的測試類別，專門進行折扣的測試案例。**

```C# {linenos=inline, hl_lines=["16-17",19, 21]}
class ShoppingCartDiscountTest
{
    IMemberService _memberService;
    IPromotionService _promotionService;

    public ShoppingCartDiscountTest()
    {
       this._memberService = Substitute.For<IMemberService>();
       this._promotionService = Substitute.For<IPromotionService>();
    }

    [Fact]
    public void NewTestCase()
    {
        var service = new ShoppingCartService(
            null,
            null,
            this._memberService,
            null,
            this._promotionService,
            null); 
        
        // ...
    }
}
```

直接將此次增加的功能，額外建立新的測試類別的好處。

- 測試類別與案例職責相近，而且測試類別內的案例較少。
- 可以直接確認案例與相依的物件。

但也有較不好，需額外注意的地方。

- 測試案例會散於各處，造成案例的破碎化。
- 在建立待測試類別時，可能會傳入一堆 `null` 的參數。如上方程式碼反白處。

### 根本的解法

其實會發生上述的的情況，最主要的問題出在類別本身負責的職責過大或過於複雜，造成需要依賴眾多的其他類別，才能完成工作。

但有趣的是，雖然類別建立時，注入眾多相依的物件，但某些方法僅用到一兩個相依物件。對其他未被使用的物件而言，是種浪費。

尤其是大量調用上述情境的方法時，資源的浪費會變的額外的明顥。

別忘了，所有類別的建立出物件，都是需要消耗資料與建置時間的，就算時間再短，但只要這個類別被大量使用時，無効的浪費就會變的很明顯。

| 請求量 | IPromotionService 物件建立的累積耗時 | 所有物件建立的累積耗時 | 物件建立浪費耗時 |
| -----: | -----------------------------------: | ---------------------: | ---------------: |
|      1 |                                 7 ms |                  85 ms |            78 ms |
|     10 |                                70 ms |                 850 ms |           780 ms |
|    100 |                               700 ms |                8500 ms |          7800 ms |
|   1000 |                              7000 ms |               85000 ms |         78000 ms |

這就是 Code smell 中提到的 Large Class，為此真正應該做的是進行類別層次的重構，依職責或業務行為，再進一步細切。在提升程式的維護性的同時，也間接的提升系統的效能。

```C# {linenos=inline}
/// <summary>
/// 計算折扣
/// </Summary>
public class CalculateDiscountService
{
    void CalculateDiscountService(
        IMemberService memberService,
        IPromotionService promotionService)
    {
        // ....
    }

    /// <summary>
    /// 取得購物車的折扣金額
    /// </summary>
    public decimal GetDiscount(ShoppingCartEntity shoppingCart)
    {
        // 只使用 IMemberService, IPromotionService 進行購物車折扣後的計算
    }
}

```

## 延伸閱讀

- [如何避免單元測試的陷阱？](https://mp.weixin.qq.com/s/6C-t1QhgPI6zwr4gx_uGAg)
- [Code smell](https://zh.wikipedia.org/zh-tw/%E4%BB%A3%E7%A0%81%E5%BC%82%E5%91%B3)
