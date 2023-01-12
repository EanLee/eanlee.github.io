---
title: 程式碼版控 - 觀念與 Git 簡述
date: 2022-07-29T10:14:10+08:00
description: 初步簡單的介紹版控的觀念，並介紹常用的 Git 指令與 Git Flow
categories:
  - 軟體開發
keywords:
  - 版控
  - Git
  - Git Flow
tags:
  - 版控
lastmod: 2023-01-12T07:14:12.252Z
---

> [2019 iT 邦幫忙鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/1906)文章補完計劃，[從零開始建立自動化發佈的流水線]({{< ref "../foreword/index.md#版控篇">}}) 版控篇

當軟體持續發展，難免出現客制化需求，或是要求針對特定版本進行功能異動，尤其是團隊協作的情況下，有沒有那種方式可以提供有效的統整現有的程式碼，讓協作開發人員，都可以取得最新的開發版本。也可以快速的調出過往的程式異動版本，以便追查問題或調整。

<!--more-->

```chat
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

```chat
Eric:
  簡單說明「集中式版本控制」與「分散式版本控制」兩者之間的差異，其中 Subservion 是很經典的集中式版制系統。
  不過，因為你之前沒有使用過版控系統，個人建議使用分散式散本控制系統中的 Git。

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

```chat
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

```chat
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

```chat
Eric:
  說了這麼多，但還有很有很多指令都還沒有提到，像 request push、rebase 等等，有機會你再去好好了解它們的用法。

吉米:
  這樣就對有我很大的幫助。不過，對於我這樣的新手，git 沒有提供 GUI 工具呢？

Eric:
  好問題，在 Git 官網中，有提供 GUI Client 的軟體清單，提供下載，可以選擇自己喜歡的軟體。
```

## Git Flow

```chat
吉米在了解 Git 版本控制的觀念後，使用了兩週的時間，發現自己無法很好的管理分支與控制變動。
在網路上找到 git flow 的介紹，但研究後，還是有部份的疑問。
因此，吉米打電話跟 Eric 請教 git flow 的問題。

Eric:
  喂，我是 Eric，那裡找？

吉米:
  我是吉米，Eric 現在方便講電話嗎？有些事想請教你一下。

Eric:
 可以啊，什麼事？

吉米:
 我使用 Git 進行版控到現在，發現不知道要怎麼管理分支。後來我在網路上，看到有人推薦 git flow，又看到有人說 git flow 不建議使用。想詢問一下你的看法。

Eric:
 原來如此，那我們分析一下 git flow 的特點吧。
```

gitflow 是 Vincent Driessen 在 2010 年提出來的一種關於 git 工作流程的建議。

![git-model@2x](https://nvie.com/img/git-model@2x.png)

(圖片來源: [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/))

### Branch 規則

在 git flow 中，有兩支最重要的 branch，分別是 **master**、**develop** 。

#### Master

原本的主線，但在 git flow 中，比較接近交付給客戶的產品版本。因此，會變更到 master 的時機點，只有在完成 **release** 與 **hotfix** 後，才會變動。

#### Develop

develop 是基於 master 所分支出的 **開發用主線**。當採用 git flow 作為管理方式時，會自行從 master 開一支名為 develop 的分支。

所有對於需求的新增、修改，或是問題的修正，都會在此作業。直到完成開發後，才會用 **release** ，與 master 進行同步。

#### Feature

所有功能的增加、修改，會不同的需求目標，開一條前綴為 **feature** 的分支。直到完成功能的開發後，就會 merage 回 develop。

而每個 feature 只處理各自需求目標。也就是**一次( feature)只做一件事 (功能)**。

#### Release

當預定的功能都開發完成時，這時就會開一條前綴為 **release** 的分支，此時，只能針對預備釋出的功能，進行 **現有功能的錯誤修正**。

確定所有功能正常無誤，完成 release 後，會先後 merge 到 master 與 develop。

#### HotFix

當交付的軟體回報有問題時，會開前綴為 **hotfix** 的分支。完成修正後，會先後 merge 到 master 與 develop。

### Git Flow 的爭議點

目前 git flow 主要的爭議點，就筆者看到的，大約可分成兩點。

- develop/master 的分割
- 多人協作時，完成 feature 時的衝突。  

#### develop/master 的分割

這可能是因為 develop 與 master 的功用相近，但在 git flow 的流程下，操作相當變得複雜。尤其在講求 **快速交付** 的現在，執行 DevOps 的人眼中看來，develop 存在的意義不大。

但在某些軟體公司而言，因為客戶性質的關係，交付軟體的週期較長。master/develop 可以確保產品維護的同時，又可以進行開功能的開發。

或是開發過程的異動太大，develop 的異動，不會直接影響到 master，就也就己交付軟體的內容。

#### 多人協作時，完成 feature 時的衝突

會發生這個問題，多數是由於負責功能項目，在程式內的耦合性太高，導致兩個 feature 以上，去變更到同一份文件。

這部份能從幾個部份下手，例如 **開發人員之間的溝通協商**、**增加 push 時的審核機制**，例如  Github 所使用的 pull request 機制。或是**優化軟體架構**，讓它其中的物件低耦合，高內聚。

### Git Flow 使用經驗與建議

1. 針對 Feature，要實作的功能範圍應該可能的小，以確保該功能可以在半個到一個工作日內完成。
2. 每天工作前，都應該 Fetch 最新版本。下班前，將完成的 feature push 。
3. 軟體架構內物件，要盡可能的低耦合高內聚，才能減少功能修改時的交互影響。

```chat
吉米:
  Eric，聽完你的說明，感覺 git flow 就可以立即套用。

Eric:
  剛好目前你一個人獨立開發，而在這個時機點，git flow 正好適合你用。如果以後多人協同開發的時候，可能就要搭配其他流程，如 Github flow、Gitlab flow 等等，以便管理，

吉米:
  嗯嗯，適合的最好，以後如果有用到其他的流程，再跟你請救。

Eric:
  哈哈，歡迎歡迎，跟你解釋的同時，我也順便再次理清思慮。沒其他事的話，打電話我就先掛了。

吉米:
  OK，拜拜。

Eric:
  拜拜。
```

## 延伸閱讀

▶ 版控觀念

1. [Local, Central and Distributed Version Control Systems](http://toolsqa.com/git/local-central-and-distributed-version-control-systems/)
2. [三個使用版本控制系統的建議](https://ihower.tw/blog/archives/8076)
3. [How to write the perfect pull request](https://blog.github.com/2015-01-21-how-to-write-the-perfect-pull-request/)
4. [卓越開發者必備的版本控制技巧](https://www.ithome.com.tw/article/97328)

▶ Git

1. [Git 官網](https://git-scm.com/downloads/guis)
2. [連猴子都能懂的 Git 入門指南](https://backlog.com/git-tutorial/tw/)
3. [30 天精通 Git 版本控管](https://ithelp.ithome.com.tw/users/20004901/ironman/525)
4. [Learn Git Branching](https://learngitbranching.js.org/)
5. [Subversion SVN 版本控管](https://demo.tc/post/702)
6. [Git 教學](https://legacy.gitbook.com/book/kingofamani/git-teach/details)
7. [Git 達人教你搞懂 GitHub 基礎觀念](https://www.ithome.com.tw/news/95283)
8. [為你自己學 Git](https://gitbook.tw/)

▶ Git Flow

1. [Git Flow 是什麼？為什麼需要這種東西？](https://gitbook.tw/chapters/gitflow/why-need-git-flow.html)
2. [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)
3. [GitLab Flow：介于GitFlow和Github Flow之间！](http://www.brofive.org/?p=2233)
4. [Follow-up to ‘GitFlow considered harmful’](https://www.endoflineblog.com/follow-up-to-gitflow-considered-harmful)
5. [git flow 實戰經驗談 part1 - 別再讓 gitflow 拖累團隊的開發速度](https://blog.hellojcc.tw/2017/12/14/the-flaw-of-git-flow/)
6. [git flow 實戰經驗談 part2 - 可能更好的 gitflow](https://blog.hellojcc.tw/2018/01/11/a-better-git-flow/)
7. [GitHub Flow 及 Git Flow 流程使用時機](https://blog.wu-boy.com/2017/12/github-flow-vs-git-flow/comment-page-1/)
8. [Git flow 開發流程](https://ihower.tw/blog/archives/5140)
