---
title: 淺談 YAML 格式
date: 2022-07-29T14:12:44+08:00
description: 深入探討 YAML 語法規則與最佳實踐，學習如何撰寫清晰、高效的設定檔。本文從基礎格式、資料類型到進階語法如錨點與引用、多行字串，並提供常見錯誤與安全考量，助你掌握 YAML 在 DevOps 和 CI/CD 中的應用，輕鬆應對 Travis CI、Azure Pipelines 等工具的組態設定。
keywords:
  - YAML
categories:
  - 軟體開發
  - DevOps
slug: yaml
lastmod: 2025-08-11T02:36:55+08:00
series: 從零開始建立自動化發佈的流水線
---
> [2019 iT 邦幫忙鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/1906)文章補完計劃，[從零開始建立自動化發佈的流水線](../build-ci-cd-from-scratch/index.md) 額外補充

當在進行 CI/CD 工具的 pipelines 或軟體組態設定時，可能都有機會看到 YAML 格式撰寫的設定檔。下面詳細介紹 YAML 撰寫規則和最佳實踐。
P
<!--more-->

```
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
  在 YAML 的官網中，指出 YAML 是 JSON 的超集，因此，YAML 支援 JSON 的格式。實務上，JSON 與 YAML 應用的場景不盡相同。
  JSON 大多用於資料傳輸，YAML 大多用於組態設定，所以不用刻意去區分兩者間的差異。
```

## YAML 簡介

在 YAML 官網，它強調 **YAML 不是標註語言**，而是一種 **適用於所有語言，人性化的資料序列標準**。說白一點，YAML 就是一種描述設定的文字格式，以便讓人們可以直接明白它所要表示的意思。

### 檔案格式規範

- **副檔名**：可使用 `.yaml` 或 `.yml`，通常 `.yml` 較簡潔常用
- **編碼**：必須使用 UTF-8 編碼
- **縮排**：強烈建議使用 **2 或 4 個空格**，禁用 Tab 字元

YAML 格式中，含有一個到多個 **節點 (node)**，每個節點必定是 **純量 (Scalar)**、**序列 (Sequence)**、**映射(Mapping)資料** 其中一種。

- **純量 (scalar)**  
    運用零個或多個 Unicode 字元，以表示 **自定義資料 (opaque datum)**。說白一點，就是將**最基本的、不可再分的值**，全部使用文字來描述。
    
    ```yaml
    dotnet
    ```
    
- **序列 (sequence)**  
    有順序的節點清單。清單內容，不限制節點的類型。以破折號( "- ")，表示該行資料為序列。
    
    ```yaml
    - 20
    - 'Two'
    - 34.3
    ```
    
- **映射 (mapping)**  
    使用 Key: Value 的配對方式，以便快速找到所要的資料。Key 是索引值，所以 Key 必需是 **唯一值**。 以 冒號加空格("`:`") 的方式，來標註 key: value 的組合。
    
    ```yaml
    language: csharp
    ```

## YAML 語法

在 YAML 的區塊集(Block collection) 中，以 **空格** **縮行** 的方式，表示資料的階層。**左側對齊的節點，視為同一階層的資料**。

因為 `Tab` 可能在不同語言，表示方式不同，所以 **YAML 不建議使用 `Tab` 作為縮行的方式**。

### 縮排規則詳解

```yaml
# 正確縮排（使用 2 個空格）
parent:
  child1: value1
  child2: value2
  nested:
    grandchild: value3

# 錯誤縮排
parent:
child1: value1  # 錯誤：縮排不一致
  child2: value2
```

### 註解

YAML 的語法中，支援 **註解** 的標註，在 `#` 後方的文字，都會視為註解內容。

```yaml
# 這是註解
key: value  # 行末註解
```

## 資料類型詳解

### 字串處理

```yaml
# 不需引號的字串
simple_string: Hello World
name: John Doe

# 需要引號的情況
quoted_string: "Hello: World"  # 包含冒號
special_chars: "Version #1.0"  # 包含井字號
preserve_spaces: "  leading and trailing  "

# 單引號 vs 雙引號
single_quote: 'literal string'
double_quote: "string with\nescapes"  # 支援跳脫字元
```

### 數值類型

```yaml
# 整數
integer: 123
negative: -456
octal: 0o755
hex: 0xFF

# 浮點數
float: 123.45
scientific: 1.23e+3
infinity: .inf
not_a_number: .nan
```

### 布林值和空值

```yaml
# 布林值（多種表示方式）
boolean_true: true
boolean_false: false
yes_value: yes
no_value: no
on_value: on
off_value: off

# 空值
null_value: null
tilde_null: ~
empty_null:   # 空值
```

### 資料集合

#### 序列: scalars

```yaml
- John
- Roy
- Alice
```

#### 序列: mapping

```yaml
- name: John
  age: 20
  city: Taipei
- name: Roy
  age: 32
  city: Kaohsiung
```

#### 映射: Scalars to Scalars

```yaml
name: John
age: 20
email: john@example.com
```

#### 映射: Scalars to Sequence

```yaml
person: 
  - John
  - Roy
  - Alice

skills:
  - JavaScript
  - Python
  - Docker
```

### 區塊的結構

YAML 運用三個破折號( "`---`") ，表示 `---` 下方的，是一個新的資料區塊。並以三個點號("'`...`")，表示該區塊的結束。

```yaml
--- # 文檔開始
title: Document 1
content: First document
... # 文檔結束
--- # 第二個文檔開始
title: Document 2
content: Second document
...
```

### 多行資料的表示方式

- `|` 表示後面的文字，**每一行資料都視為獨立的資料**（保留換行）。
    
    ```yaml
    description: |
      This is a book.
      It is a pen.
      Each line is preserved.
    ```
    
    取回的資料結果：
    
    ```
    This is a book.
    It is a pen.
    Each line is preserved.
    ```
    
- `>` 表示後面的文字，只有在 **縮行改變** 或 **空行** 時，YAML 才會視為新的資料（摺疊換行）。
    
    ```yaml
    summary: >
      This is a book.
      It is a pen.
      
      This is a new paragraph.
    ```
    
    取回的資料結果：
    
    ```
    This is a book. It is a pen.
    
    This is a new paragraph.
    ```
    

### 重複的節點資料（錨點和引用）

有時，我們希望某個節點被 **重複引用**。這時，就可以將 `&`、`*` 兩個符號搭配使用。

- `&` 錨點，也是希望被重複引用的節點位置。
- `*` 要引用其他節點的位置

```yaml
# 定義錨點
defaults: &default_config
  timeout: 30
  retries: 3
  log_level: info

# 引用錨點
production:
  <<: *default_config  # 合併鍵
  environment: production
  
staging:
  <<: *default_config
  environment: staging
  timeout: 60  # 覆蓋預設值
```

### 映射的複合鍵

若需要以多個 Scalars 組成一個 key，就要用 `?` 來組成 mapping key。

```yaml
? - Detroit Tigers
  - Chicago Cubs
: 
  - 2001-07-23
  - game_result

? [team1, team2]  # 另一種寫法
: match_info
```

### Tags（類型標註）

如果在 YAML 內，要明確指定節點的類型，必需使用 `!` 指明要使用的 tag。

而 Tag 又分成 **全域(generally)** 與 **局部 (local)**。YAML 會依據使用的 tag schema，進行各種的資料內容檢查或限定。

```yaml
# 明確指定類型
explicit_string: !!str 123
explicit_int: !!int "123"
explicit_float: !!float "123.0"

# 自定義 tag
custom_object: !CustomClass
  property: value
```

## 常見錯誤和陷阱

有一些小地方，如果沒有留意到，可能會導致 `YAML` 設定後，實際運行取值的結果，與原本的意圖不符。

常見失誤的地方有 **縮排**、**特殊字元**、**類型** 這幾個地方。

我們可以使用線上驗證器，來驗查語法是否正確。例如：

- [yamllint.com](http://yamllint.com/) - 線上 YAML 語法驗證
- [codebeautify.org](https://codebeautify.org/yaml-validator) - YAML 美化和驗證
- [onlineyamltools.com](https://onlineyamltools.com/) - 各種 YAML 工具集
### 縮排錯誤

為避免這個問題，撰寫時需確保使用一致的空格數量。

```yaml
# 錯誤：縮排不一致
config:
  database:
    host: localhost
   port: 5432  # 錯誤縮排

# 正確寫法
config:
  database:
    host: localhost
    port: 5432
```

### 特殊字元處理

因為設定的值，內容含有 keyword，可能會導致 `YAML` 解析錯誤。

透過使用 `"` 的方式，避免誤判或自動轉換的問題。

```yaml
# 需要引號的情況
version: "1.0"          # 避免被解析為數字
message: "Hello: World" # 包含冒號
path: "C:\Program Files\App"  # 包含反斜線
```

### 布林值陷阱

這也是內容誤判造成的問題，尤其是 `yes`、`no`、`true`、`false` 這些語意本身就有強烈的字眼。

```yaml
# 可能被誤解的值
norway: NO      # 會被解析為 false
answer: yes     # 會被解析為 true

# 明確指定為字串
country: "NO"   # 字串 "NO"
response: "yes" # 字串 "yes"
```

## 實務最佳實踐

### 命名慣例

目前大多 `YAML` 使用 `snake_case` 或是 `kebab-case` 的命名方式。

```yaml
# 建議使用 snake_case
database_config:
  connection_string: "..."
  max_pool_size: 100

# 或使用 kebab-case
database-config:
  connection-string: "..."
  max-pool-size: 100
```
### 安全性考量

`YAML` 雖然易讀易寫，但在處理敏感資訊和部署生產環境時，存在多種安全風險。

一個不小心，就很可能會把機敏資料寫在 YAML 檔之中，並提交至版控平台。

```yaml
# 避免直接存放敏感資訊
database:
  host: localhost
  username: ${DATABASE_USER}     # 使用環境變數
  password: ${DATABASE_PASSWORD} # 使用環境變數
```

為避免上述回問題，我們可以採用以下的方式

- 系統環境變數
- Docker 本身的環境變數
- 外部機密管理系統，例如：AWS Secrets Manager、Azure Key Vault、HashiCorp Vault、etc

---

若我們嘗試撰寫 Travis CI 用的 `YAML` 檔，成果如下。

```yaml
# .travis.yml
language: csharp
solution: IronmanDemo.sln
mono: none
dotnet: 2.1.300

install:
  - dotnet restore IronmanDemo

script:
  - dotnet build IronmanDemo
  - dotnet test IronmanDemo.Tests

deploy:
  provider: azure
  on:
    branch: master
```

```
Eric: 了解完整的 YAML 用法後，不僅能讀懂各種 CI/CD 設定檔，還能避免常見錯誤，寫出更優雅的組態檔案。
吉米: 這樣就很完整了！有了這些最佳實踐和工具推薦，以後寫 YAML 就更有信心了。
```

## 延伸閱讀

1. [The official YAML web site](http://yaml.org/)
2. [YAML 1.2 Specification](https://yaml.org/spec/1.2.2/)
3. Microsoft Document, [YAML schema reference](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=vsts&tabs=schema)
4. [GitHub Actions YAML syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
5. Wiki, [YAML](https://zh.wikipedia.org/wiki/YAML)
6. [YAML 语法 & 范例](https://www.jianshu.com/p/44a035cdadad)
