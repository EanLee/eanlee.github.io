---
title: 淺談 YAML 格式
date: 2022-07-29T14:12:44+08:00
description: 談談 YAML 的格式與使用方式
keywords:
  - YAML
categories:
  - 軟體開發
  - DevOps
slug: yaml
lastmod: 2023-06-28T10:41:46+08:00
---

> [2019 iT 邦幫忙鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/1906)文章補完計劃，[從零開始建立自動化發佈的流水線]({{< ref "../build-ci-cd-from-scratch/index.md#額外補充" >}}) 額外補充

當在進行 CI/CD 工具的 pipelines 或軟體組態設定時，可能都有機會看到 YAML 格式撰寫的設定檔。下面簡單的聊聊 YAML 撰寫規則。

<!--more-->

```Plan
Eric:
  在 Travis CI 與 Azure Pipelines 的設定時，都有提到 `.yml` 的檔案。

吉米:
  對啊！而且它的內容很直覺，不用想太多，就可以明白它的意思。

Eric:
  沒錯，也是因為這個特性，越來越多系統採用 YAML 格式，作為「部署」、「設定」、「管理」的組態文件撰寫格式。
  就目前而言，YAML 在 DevOps 中，己經成為不可缺少的一部份。 

吉米:
  那 YAML 與 JSON 的差異在那呢？

Eric:
  在 YAML 的官網中，指出 YAML 是  JSON 的超集，因此，YAML 支援  JSON 的格式。實務上，JSON 與 YAML 應用的場景不盡相同。
  JSON 大多用於資料傳輸，YAML 大多用於組態設定，所以不用刻意去區分兩者間的差異。
```

## YAML 簡介

在 YAML 官網，它強調 **YAML 不是標註語言**，而是一種 **適用於所有語言，人性化的資料序列標準**。說白一點， YAML 就是一種描述設定的文字格式，以便讓人們可以直接明白它所要表示的意思。

YAML 格式中，含有一個到多個 **節點 (node)**，每個節點必定是 **純量 (Scalar)**、**序列 (Sequence)**、**映射(Mapping)資料** 其中一種。

- 純量 (scalar)

  運用零個或多個 Unicode 字元，以表示 **自定義資料 (opaque datum)**。說白一點，就是將**最基本的、不可再分的值**，全部使用文字來描述。

  ```yaml
  dotnet
  ```

- 序列 (sequence)

  有順序的節點清單。清單內容，不限制節點的類型。以破折號( “- ”)，表示該行資料為序列。

  ```yaml
  - 20
  - 'Two'
  - 34.3
  ```

- 映射 (mapping)

  使用 Key: Value 的配對方式，以便快速找到所要的資料。 Key 是索引值，所以 Key 必需是 **唯一值**。

  以 冒號加空格("`:`") 的方式，來標註 key: value 的組合。

  ```yaml
  language: csharp
  ```

## YAML 語法

在 YAML 的區塊集(Block collection) 中，以 **空格** **縮行** 的方式，表示資料的階層。**左側對齊的節點，視為同一階層的資料**。

因為 `Tab` 可能在不同語言，表示方式不同，所以  **YAML 不建議使用 `Tab` 作為縮行的方式**。

YAML 的語法中，支援 **註解** 的標註，在 `#` 後方的文字，都會視為註解內容。

```yaml
# 註解
```

### 資料集

YAML 的資料，可以利用 Scalar、Sequence、mapping 的各種組合，表示出資料的集合。下面列出幾個常見的組合方式。

#### 序列: scalars

```yaml
- John
- Roy
```

#### 序列: mapping

```yaml
- name: John
  age: 20
- name: Roy
  age: 32
```

#### 映射: Scalars to Scalars

```yaml
name: John
age: 20
```

#### 映射: Scalars to Sequence

```yaml
person: 
  - John
  - Roy
```

### 區塊的結構

有時，可能需要針對 YAML 內的資料，進行區塊的劃分。

YAML 運用三個破折號( “`---`“) ，表示 `---` 下方的，是一個新的資料區塊。並以三個點號("'`...`")，表示該區塊的結束。

```yaml
--- # begin

... # end
```

### 多行資料的表示方式

有時，當 Scalars 內的文字太長或是需要分段落時，會以 `|` 或 `>` 表示。

- `|`  表示後面的文字，**每一行資料都視為獨立的資料**。

  ```yaml
  node: |
      This is a book.
      it is a pen.
  ```

  取回的 node 資料結果，如下

  ```log
  This is a book.
  it is a pen.
  ```

- `>` 表示後面的文字，只有在 **縮行改變** 或 **空行** 時，YAML 才會視為新的資料。

  ```yaml
  node: >
     This is a book.
     it is a pen.
        I want to supermark.
  ```

   取回的 node 資料結果，如下

  ```log
   This is a book. it is a pen.
   I want to supermark.
  ```

### 重複的節點資料

有時，我們希望某個節點被 **重複引用**。這時，就可以將 &、* 兩個符號會搭配在一起使用。

- `&` 錨點，也是希望被重複引用的節點位置。

  ```yaml
  bill-to: &id001
    given: Chris
   family: Dumars
  ```

- `*` 要引用其他節點的位置

  ```yaml
  ship-to: *id001
  ```

在上面的範例，取出來的 `bill-to` 與 `ship-to` 的內容是相同的。

### 映射的複合鍵

前面使用 mapping 時，通常都是單一鍵。若需要以多個 Scalars 組成一個 key ，就要用 `?` 來組成 mapping key。

```yaml
? - Detroit Tigers
  - Chicago cubs
:
  - 2001-07-23
```

範例中的 key ，由 `Detroit Tigers` 與 `Chicago cubs` 組成。

### Tags

如果在 YAML 內，要明確指定節點的類型，必需使用 `!` 指明要使用的 tag。

而 Tag 又分成 **全域(generally)** 與 **局部 (local)**。YAML 會依據使用的 tag schema，進行各種的資料內容檢查或限定。

這部份筆者也不常使用，如果要更明白 tag 的用法，可以直接去查看 YAML 1.2 版的規格。

```Plan
Eric: 了解 YAML 的用法後，應該就能更明白 Travis CI 所使用的 .travis.yml 檔，所描述的內容了。

吉米: 確實，聽你說完 YAML 的用法後，就知道要怎麼撰寫 YAML 內容。不然，原本只會看，不會改。
```

```yaml
# Triavis CI 所使用的 .travis.yml 內容
language: csharp
solution: IronmanDemo.sln

mono: none
dotnet: 2.1.300

script:
    - dotnet restore IronmanDemo
    - dotnet build IronmanDemo
```

## 延伸閱讀

1. Microsoft Document, [YAML schema reference](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=vsts&tabs=schema)
2. [The official YAML web site](http://yaml.org/)
3. Wiki, [YAML](https://zh.wikipedia.org/wiki/YAML)
4. [YAML 语法 & 范例](https://www.jianshu.com/p/44a035cdadad)
