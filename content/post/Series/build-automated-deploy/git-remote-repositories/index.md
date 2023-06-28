---
title: 程式碼托管平台 - GitHub/BitBucket/Azure DevOps
description: 介紹了版控的概念與 Git 的操作方式後，接著要找 Remote Repositories 來進行程式碼的托管，達到異地備份的效果。將針對
  GitHub、BitBucket、Azure DevOps 內的 Azure Repos 三個托管平台進行介紹。
date: 2023-01-12T10:10:37+08:00
tags:
  - 版控
  - Azure
categories:
  - DevOps
keywords:
  - 版控
  - Git
  - BitBucket
  - GitHub
  - Azure DevOps
  - Azure Repos
slug: git-remote-repositories
lastmod: 2023-06-28T10:41:48+08:00
---

> [2019 iT 邦幫忙鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/1906)文章補完計劃，[從零開始建立自動化發佈的流水線]({{< ref "../build-ci-cd-from-scratch/index.md#版控篇" >}}) 版控篇

在[程式碼版控 - 觀念與 Git 簡述]({{< ref "../version_control/index.md" >}})介紹了版控的概念與 Git 的操作方式。接著，就必須找一個 Remote Repositories 來進行程式碼的托管，達到異地備份的效果。

本篇文章的內容，會針對 `GitHub`、`BitBucket`、`Azure DevOps` 內的 `Azure Repos` 三個托管平台進行介紹。

<!--more-->

## 程式碼托管平台

### GitHub

```chat
Eric:
  通常，我們習慣將提供 Remote Repository 服務的平台，稱為程式碼托管平台。而提到托管平台，就不得不提到 GitHub。
  GitHub 是目前最大的 open source 的集散地。就連 Microsoft 都將部份產品的程式碼儲存在這。提供給社群內的人們有參與專案的機會。

吉米:
  GitHub 有聽過，但沒有真正的去了解它。

Eric:
  一進到 GitHub 的首頁，它就明白的說明，GitHub 是提供給開發人員的用的平台。不管是要用於 Open Source 或是商業用途，都可以好好的運用它。

吉米:
  真是大氣的宣言啊。

Eric:
  我們直接進到 GitHub 的首頁，就會看到它的宣言了。
```

> 📝 資訊補充 📝
>
> 2023 年的 [GitHub](https://github.com/) 首頁的宣言已更換，GitHub 將自己定位為安全的協作平台。

![GitHub 首頁(2018)](images/github-index-2018.png)

![GitHub 首頁(2023)](images/github-index-2023.png)

```chat
Eric:
  因為 GitHub 的申請相當容易，這部份就不過於著墨。

吉米:
  好噢。

Eric:
  那就直接切入主題，如何建立所需要的 Remote Repository 。
```

登入帳號後，直接到右上角選取 `New repository` ，就會進入建立 repository 的設定頁面了。

![GitHub 建立新 Repository 的進入點](images/github-new-repository.png)

![GitHub 建立 Repository 必須資訊](images/github-create-repository.png)

其實，只要設定 `Repository name` 並檢查無相同名稱後，就可以直接按下 `Create repository` 進行建立。完成後，頁面會貼心的提示，本地端的 repository 要如何與 GitHub repository 建立起關連。

預設 Repository 為公開對外，若不想被無關的人檢視內容，記得切換為私有。

也可以選擇額外的設定，讓 GitHub 自行建立 `Readme.md`、`.gitgnore` 與 `license`。

> 📝 資訊補充 📝
>
> 在 2019 年，GitHub 宣佈提供 private repositories 給免費用戶，但 private repositoryes 仍有共用限制，毎個 private repository 最多三位共同開發者使用。

~~但要特別提到一點就是，雖然 GitHub 提供免費的 Repository 空間，但是必需將該專案設為 `公開(public)`。~~

~~假若希望將專案設為 `私有(private)` ，避免被不相關的人檢視內容。在網頁中，也清楚的說明，每個月支付 7 美元，提升帳戶的級層，就可以無限制的使用 `private repositories`。~~

![GitHub Repository 建立完成](images/github-empty-repository.png)

### BitBucket

```chat
Eric:
  前面我們提到了 GitHub，接下來再來聊聊另一個程式碼托管平台 BitBucket。
```

> 📝 資訊補充 📝
>
> 雖然 2023 年的 [BitBucket](https://bitbucket.org/) 首頁的宣言已更換，本質上沒有太大的改變，只是更加強調 BitBucket 是 Atlassian's Open DevOps 解決方案的一員。

![BitBucket index in 2019](images/bitbucket-index-in-2019.png)

![BitBucket Index in 2023](images/bitbucket-index-in-2023.png)

```chat
Eric:
  先前有提到 GitHub 如果要使用 private repository，就必需付費升級帳戶。
  雖然 BitBucket 與 GitHub 相同，也有免費與付費的兩種方案。不過，免費帳戶開放 private repository 提供使用，但限制 Repository 最多可支援到 5 名用戶。

吉米:
  這可真是佛心！

Eric:
  此外，BitBucket 的公司 Atlassian，有許多好用的產品，例如追蹤應用程式問題的 JIRA、Git Client 的 SourceTree、團隊協作的 Confluence，BitBucket 都可以整合使用。

吉米:
  原來如此，以後有機會，也可以來研究一下 JIRA 與 Conflunence。
```

略過註冊的部份，直接來看看 repository 的設定畫面。

![可選擇的新增項目](images/bitbucket-create-option.png)

當按下 `Create` ，並選取 `Respository` 後，會看到設定 repository 的設定畫面。

![建立 Repository 必填資訊](images/bitbucket-create-repository.png)

跟 GitHub 相同，只要輸入 `Repository name` 就可以創立一個新的 repository。

與 GitHub 不同，BitBucket 預設 repository 的存取層級就是私有的。如果要公開的話，記得將 **`Access level`** 的勾選取消。

此外，BitBucket 同時兩種分散式版本控制系統 Git 與 Mercurial，如果沒有需求，直接使用預設值 Git 即可。

![建立完成的畫面](images/bitbucket-created-repository.jpeg)

建立 repository 完成後，BitBucket 一樣會貼心的提示您，如何將本地端的 repository 與 BitBucket repository 建立起關連。

左側的功能列上，也可以選擇看 `Commits`、`Branches` 的相關記錄。而 `Pipelines`、`Deployments` 這兩個功能與 CI/CD 相關。

若需要調整 repository 的設定，都可以從 `Setting` 進行設定的變更。

![Repository 的設定畫面](images/bitbucket-repository-setting.jpeg)

### Azure Repositories of Azure DevOps

```chat
Eric:
  說完了 GitHub、BitBucket ，最後，來了解一下 Microsoft 所推出的 Azure DevOps。

吉米:
  Azure DevOps？

Eric:
  Azure DevOps 的前身是 Visual Studio Team Services (VSTS)，為了因應 DevOps 的的趨勢，Microsoft 將原本單一的 VSTS 服務，依功能種類，打散成一系列的服務。

吉米:
  那 Azure DevOps 現在有那些功能呢？

Eric:
  像是工作管理的 Azure Boards 、私有 Git 儲存庫 Azure Repos、CI/CD 相關的 Azure Pipelines 等等。

```

> 📝 資訊補充 📝
>
> [Azure DevOps](https://azure.microsoft.com/en-us/services/devops/) 的 2023 年的收費方式與 2019 年撰寫文章時，已經完全不同。(友善度也不同)
>
> 順便吐嘈一下 Microsoft，現在使用 Azure DevOps 的入口變的超不友善，每次都要花上不少時間，才能進入 Azure DevOps。

![2019 年 Azure DevOps 定價](images/azure-devops-charge-2019.png)

![2023 年 Azure DevOps 定價](images/azure-devops-charge-2023.jpeg)

```chat
Eric:
  Azure DevOps 也提供免費與付費的服務，若是使用免費帳戶配合 private repository 時，跟 BitBucket 相同，有著使用者人數的限制。

吉米:
  就 Azure DevOps 服務的項目，小型小組的方案最適合我的需求。

Eric:
  我們這次來聊聊 Azure DevOps 與 Azure Repos 。
```

> 📝 資訊補充 📝
>
> 因為 Azure DevOps 與 Azure 整合改版後，初次進入的方式變的複雜，若是沒有特別記下進入的網址，可能要找半天才能順利進入，所以特別補上操作方式。
>
> 若已經使用過 Azure DevOps，進入方式有三種
>
> - [Azure Partal](https://portal.azure.com/)
> - [Azure DevOps Services | 登入](https://aex.dev.azure.com/me?mkt=zh-TW)
> - <https://dev.azure.com/組織名稱>

當在 Google 搜尋 `Azure DevOps` 時，會出現 `Azure DevOps Service` 的頁面，點選後，會進入 Azure DevOps 的宣傳頁面。

![Azure DevOps Ad](images/azure-devops-ad.png)

在這邊要使用 Azure 的帳號登入。若是沒有 Azure 帳號的，它要要求先註冊 Azure 帳號。

登入後，會直接跳到 Azure Dashboard 的頁面。此時，畫面上是找不到 `Azure DevOps` 的項目，請在上面搜尋欄輸入 `DevOps` 並選擇搜尋結果 `Auzre DevOps organizations`。

![Azure Dashboard](images/azure-dashboard.png)

![Azure DevOps organizations](images/azure-devops-organizations.png)

接著點選 `My Azure Devops Organization` 後，網頁會跳 [Azure DevOps Services | 登入](https://aex.dev.azure.com/me?mkt=zh-TW) 書面。

此時，就可以看到目前帳號所屬的 DevOps 組織列表。

![Azure Devops Organization list](images/azure-devops-organization-list.png)

若是沒有任何所屬組織，會要求用戶新增一個組織並建立新專案。

![create organization](images/azure-devops-organization-create.png)

Azure DevOps 與 GitHub、BitBucket 建立比較不同的地方，在於後兩者是直接建立 Repository，而;在 Azure DevOps 則是先建立專案項目。

在建立專案時，需要指定該專案是屬於 `公開` 或 `私有` ，這個決定 Azure DevOps 對專案的支援項目。

![在 Azure Devops 建立新專案的畫面 (2019 年)](images/azure-devops-create-project.png)

![在 Azure Devops 建立新專案的畫面 (2023 年)](images/azure-devops-create-project-2023.png)

專案建立後，會在左側功能看到 Azure DevOps 提供的服務，像 `Boards`、`Repos`、`Pipeline`、`Test Plan`。

![Azure Devops 的專案畫面](images/azure-devops-project-index.png)

點開 `Repos` 後，會發現系統己經自行建立一個與專案名稱相同的 Repository。也一樣會貼心的提示您，如何將本地端的 repository 與 BitBucket repository 建立起關連。

![空白專案的操作方式](images/azure-devops-created.png)

如果需要額外進行 Repository 的新增、滙入與合併，可以直接點選頁面上方的 repository 項目，就會出現操作選單。

![Repository 的延伸操作](images/azure-devops-repos-manage.png)

到這邊，接下來的 Git 設定方式，不管是選擇使用 `Git 指令` 或是 `Git Client GUI` 那一種，跟前面提到的設定方法相同，。

```chat
Eric:
  吉米，除了前面介紹到的 GitHub、BitBucket、Azure DevOps 外，還有許多代管平台可以選擇，例如後起直追的 GitLab 等。
  但不管是使用現有的程式碼托管平台或是自架版控伺服器，還是要考量本身的需求，來選擇最佳的方案。

吉米:
  自架 server 這個選項，就成本與實務上的考量，暫時是不可能的。我先分別試用這三個平台一陣子後，再決定要用那一個。 

Eric:
  嗯嗯，這次跟你分享的這些資訊，你回去後，再好好的研究。如果還有什麼疑惑，也歡迎討論。

吉米:
  OK，今天真的是太謝謝你了。
```

## 參考資料

1. [Azure DevOps 的定價](https://azure.microsoft.com/zh-tw/pricing/details/devops/azure-devops-services/)
2. [微軟化整為零，發表 Azure DevOps 以取代 Visual Studio Team Services](https://www.ithome.com.tw/news/125788)
3. [開發者新年大福音！GitHub 宣布 private repositories 開放免費版用戶 - INSIDE](https://www.inside.com.tw/article/15236-github-open-free-users-to-get-unlimited-private-repositories)
