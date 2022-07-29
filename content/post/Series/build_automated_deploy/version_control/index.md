---
title: 程式碼版控 - 觀念與 Git 簡述
date: 2022-07-29T10:14:10+08:00
description: 初步簡單的介紹版控的觀念，並介紹常用的 Git 指令
categories:
  - 軟體開發
keywords:
  - 版控
  - Git
tags:
  - 版控
---

> [從零開始建立自動化發佈的流水線]({{< ref "../foreword/index.md#版控篇">}}) 版控篇

當軟體持續發展，難免出現客制化需求，或是要求針對特定版本進行功能異動，尤其是團隊協作的情況下，有沒有那種方式可以提供有效的統整現有的程式碼，讓協作開發人員，都可以取得最新的開發版本。也可以快速的調出過往的程式異動版本，以便追查問題或調整。

<!--more-->

```plan
吉米與 Eric 相約在咖啡廳會面後，閒聊一會後，吉米直接將自己遇到的情況詳細說明給 Eric 知道。並詢問是否有其他建議的作法。

Eric:
  吉米，你目前的原始碼，是使用什麼方式來進行管控？

吉米:
  大多都是在交付軟體時，才會將程式碼所在的資料夾壓縮成 zip 檔，用這種方式來管理程式碼的版本。

Eric:
  嗯，聽起來你是使用本地版本管控 的概念，來管理你的程式碼。不過這種備份方式，萬一需要比對程式碼差異時，需要額外花費一番功夫。

吉米:
  確實，之前有幾次要確認某個功能，是從那一個版本之後才新增的，花了不少時間去進行程式碼的比對。

Eric:
  你交付軟體的間隔時間大約多久？

吉米:
  一般來說，大約一個月到兩個月左右，就會交付軟體給客戶。

Eric:
  除了在交付程式時的備份外，其他時間也會進行備份嗎？針對這些程式碼壓縮檔，有異地備份嗎？

吉米:
  都是在完成某一項功能後，如果有想到備份，才會備份，但大部份都會忘記。至於備份下來的壓縮檔，都會同步到網路硬碟。

Eric:
  嗯，大致了解你的情況。吉米，你的程式碼版本管控的方式，風險相當高。例如開發環境突然掛掉、軟體開發到一半，突然發現方向錯誤……，雖然都可以解決，但都需要花費額外的時間去處理。

吉米:
  嗯嗯，換個角度來說，這就是隱性(時間)成本的耗損吧。

Eric:
  沒錯！看起來你現在需要的是版本管控系統來協助你管理原始碼，如果沒有使用其他的版控軟體，建議你可以去用許多開發人員使用的版控軟體 Git。
```

## 版本控制系統( Version Control System, VCS)

在版本控制系統中，最重要的，莫過於「**倉庫(Repository)**」，在 Repository 中，會記錄所有的版本資訊、**分支(Branch)**、**合併(Merge)** 等等資料。而版控所有的指令，都是建立於系統對 Repository 的操作行為。

此外，版本控制系統，也一定存在**同步**、**追溯**與**檔案備份**，這三種特性。

- 同步 - 確保每個使用者，最終取回的內容都是相同的。
- 追溯 - 可以知道所有版本間的變動項目與原因，也能回復到歷史版本中的任一版本。
- 檔案備份 - 因為將所有的變動都同步到 Respository，間接的達到備份的功用。

目前主流的版本控制系統的架構，大致上，都可以歸屬於**集中式**與**分散式**這兩種類型。在下面的圖中，Subversion 就是集中式版本控制系統，Git 則是分散式版本控制系統。

![advantages of distributed version control systems](centralized-vs-distributed-advantages.png)
(圖片出處: [Scriptcrunch](https://scriptcrunch.com/295/))

### 集中式版本控制系統(Centralized VCS)

集中式的版本控制系統，就是基於……同個團隊之間合作的方式，是共用同一個 Repository。系統必須確保每位使用者都需與 Respository 保持一致。為要維持使用者之間保持同步的狀態，分為 **鎖定模式** 與 **合併模式** 兩種作法。

- **鎖定模式**

  當使用者想要修改某檔案、簽出該檔案後，該檔案便會進入鎖定狀態，其他使用成員便無法加以修改，直到簽出者將該檔簽回為止。

  對於維持同步來說，這當然是一個十分保險的作法，因為永遠不會有兩個或以上的使用者同時修改同一個檔案。

  只是，這種方法造成了使用者對於檔案修改的互斥效應，使得使用效率受到影響。

- **合併模式**

  允許多位使用者同時針對同一檔案進行修改，當他們分別將檔案提交回集中的檔案庫時，若發生衝突的情況，便會自動進行合併，而若自動合併失敗，再要求人工進行衝突的調解。

對於 Subversion SVN 版本控管有興趣的話，可以延伸閱讀 DEMO 大的 [Subversion SVN 版本控管](https://demo.tc/post/702)，針對 SVN 寫了一系列的教學文章。

#### 集中式版本控制不足處

- 無法離線工作

  因為所有使用者共用同一個 Respository ，因此 Respository 幾乎存放在網路可連結的主機。使用者想要對 Respository 進行任何動作，都必須在能夠連網的環境下進行。

- 動一鬆而牽全身

  如果某一個使用者，在檔案修改的過程中，就提交到 Respository ，那麼，便有可能影響到 Respository 內的檔案，處於不穩定或異常的狀態。

  若強制使用者必需修成完成後，才能提交檔案至 Respository。但是，在修改的過程中，使用者無法得到版本控制系統的支援，有效控制各階段的修改內容。

### 分散式版本控制系統 (Distributed VCS)

分散式的版本控制系統允許 Respository 存在一份或多份。每個使用者，都可以在自己電腦中，建立 Respository。

對於分散式版本控制系統而言，讓每個使用者都可以修改各自的 Respository，享受版本控制系統的支援，而不受其他因素的限制。

同時，運用 Push、Pull 的動作，使用者之間可分享自己的變更內容，達到同步的結果。因此，為了更有效的同步版本內容，分散式版本控制系統就更重視 Branch、Merge 的支援與功能。

![sauvegarder : git flow](basic-remote-workflow.png)

(圖片出處: [www.git-tower.com](https://www.git-tower.com/learn/git/ebook/en/command-line/remote-repositories/introduction))

在分散式版本控制系統中，分成本地端與遠端 Repository。

在本地端，為了確實的管控所有的檔案變更與異常，並讓使用者充分的運用到版本控制系統的支援。分成**工作區(Working Copy/Working Directory)**、**暫存區(Staging area)**以及**本地Repository**。

- 工作區

  這個部份，是我們進行檔案操作的位置。不管是 **切換 (checkout)**、**複制 (clone)**、**重置 (reset)**、**拉 (pull)**，**複原 (discard)**  等動作結果，都會直接影響這邊。

- 暫存區

  當工作複本內容檔案修改後，會將要上傳變更的內容快照一份放在這邊。在 **提交 (commit)** 時，會將這區域內的資料，上傳到到 Repository。

- 本地 Repository

  保存了所有變更過的檔案，以及各版本的歷史紀錄。

在遠端，也會存在一個**遠端 Repository**，以儲存管理所有使用者，所上傳的最終變更的版本資訊。同時，也是它提供其他使用者同步資訊的共同來源。利用 **推(push)**、**拉 (pull)**、**複制 (clone)**、**拿取(fetch)** 等動作，來達到同步旳結果。

### 版本控制的幾點建議

- 適時的 **提交(Commit)** 變動

  1. 每次的 Commit ，盡可能的確實變動內容的單純性與獨主性。例如，這次 Commit 的 Fix Bug 的變動，那在變動的內容，應盡可能避免與 Fix Bug 無關的內容。

  1. 每次的 Commit，都應確保變更後內容，是可以順利 Build 的。

- 良好的 Commit 訊息

  每次的 Commit ，確認描述此次變動的原因與修改內容。利用有效的訊息，提高軟體的維護性。

## Git 簡說

```Plan
Eric:
  簡單說明「集中式版本控制」與「分散式版本控制」兩者之間的差異，其中 Subservion 是很經典的集中式版制系統。不過，因為你之前沒有使用過版控系統，個人建議使用分散式散本控制系統中的 Git。

吉米:
  為什麼 Eric 你會建議使用 Git 呢？

Eric:
  目前 Git 被許多開發人員使用。再者，有許多的網路服務商提供免費或付費的服務，這部份想必對你有也會很多的幫助。

吉米:
  這麼說來，使用這些網路服務的同時，就等於又多一個備份的機制。

Eric:
  沒錯。

吉米:
  聽完你的說明後，對分散式版本控制系統的架構與流程，有比較客觀的認識。當我在本地端，將版控系統建立起來後，就可以立即享受版控帶來的支援與好處。
  等到那天，需要在其他台電腦或與其他人協合開發時，也可以利用遠端 Repository 來同步開發的進度。

Eric:
   沒錯，接著，我們來了解 Git 本地端的使用方式。
```

### Git 本地端的使用

```powershell
# Init
git init

# 提交 commit
git commit

# 切換 checkout
git checkout master

# 重置 reset
git reset C3
```

```Plan
Eric:
  剛剛提到的 commit、checkout、reset 都是在基本的版本管理與記錄，只會這些是無法支援多變的開發需求的。

吉米:
  確實，假若遇到部份功能客制化的需求，這些指令好像無法派上用途，難道要再建一個新的 Repository 嗎？

Eric:
  哈哈，當然不是。所以接下來，要提到  branch、merge 的觀念了。
```

### Git 分支

當我們使用 Git 時，一定會有一條主線 master，但是在實務上，有時會遇到幾種狀況。(PS: 由於 2020 年的黑人平權運動，已逐漸調整名稱為 main)

- 功能己經寫了一半，但客戶突然告知要放棄該功能。
- 針對現有的軟體，業務跟你說，某客戶要求增修某個功能，但這功能只是個案。
- ……

像這個時候，為了跟原本軟體版本有所差異，只好分成不同支線來控制版本，以方便管理。但最後，別忘了評估那些功能可以合併回主線，盡可能避免無限開分支的情況。

別忘了，當要維護的分支越多，對開發人員的負擔就越大。

```powershell
# 分支 branch
git branch develop

# 合併 merge
git merge master
```

### Git 與遠端同步

```Plan
Eric:
  說完 branch、merge 的觀念後，接著來聊聊 遠端 Repository 與 本地端 Repository 的同步。

吉米:
  嗯嗯，記得先前你有提到 push、pull、clone、fetch  這幾個名詞。

Eric:
  說到本地端與遠端的同步，不外乎就是 把資料丟上去的 push，以及把資料抓下來的 clone、fetch、pull。接下來，我們來聊一下 clone、fetch、clone 三者的差異。
```

因為本地端在沒有設定前，它並不知道遠端 Repository 的位置。所以要同步資訊到遠端前，必需先將遠端 Repository 建立起來後，將它跟本地端進行綁定。

```powershell
# 設定 Remote Repository
git remote add origin http://xxxx.xxx.xx.xx/ironman/git_tech.git

# push 方法一
git push origin master

# push 方法二: 指定遠端的分支名稱
git push origin master:master

# fetch: 確認本地與遠端的異常，此時並不會真正的下載遠端的資料
git fetch

# pull: 確認本地與遠端的異常，並下載遠端資料
git pull

# clone: 將遠端資料複制於本地端。
git clone
```

```Plan
Eric:
  說了這麼多，但還有很有很多指令都還沒有提到，像 request push、rebase 等等，有機會你再去好好了解它們的用法。

吉米:
  這樣就對有我很大的幫助。不過，對於我這樣的新手，git 沒有提供 GUI 工具呢？

Eric:
  好問題，在 Git 官網中，有提供 GUI Client 的軟體清單，提供下載，可以選擇自己喜歡的軟體。
```

## 延伸閱讀

### 版控觀念

1. [Local, Central and Distributed Version Control Systems](http://toolsqa.com/git/local-central-and-distributed-version-control-systems/)
2. [三個使用版本控制系統的建議](https://ihower.tw/blog/archives/8076)
3. [How to write the perfect pull request](https://blog.github.com/2015-01-21-how-to-write-the-perfect-pull-request/)
4. [卓越開發者必備的版本控制技巧](https://www.ithome.com.tw/article/97328)

### Git

1. [Git 官網](https://git-scm.com/downloads/guis)
2. [連猴子都能懂的 Git 入門指南](https://backlog.com/git-tutorial/tw/)
3. [30 天精通 Git 版本控管](https://ithelp.ithome.com.tw/users/20004901/ironman/525)
4. [Learn Git Branching](https://learngitbranching.js.org/)
5. [Subversion SVN 版本控管](https://demo.tc/post/702)
6. [Git 教學](https://legacy.gitbook.com/book/kingofamani/git-teach/details)
7. [Git 達人教你搞懂 GitHub 基礎觀念](https://www.ithome.com.tw/news/95283)
8. [為你自己學 Git](https://gitbook.tw/)
