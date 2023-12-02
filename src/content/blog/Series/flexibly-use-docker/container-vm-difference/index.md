---
title: 靈活運用 Docker - Container 觀念與 VM 的差異
description: 「靈活運用 Docker 打造高效的容器化應用環境」系列的文章之一。本文探討虛擬機器 (Virtual Machine, VM) 與容器 (Container) 技術的差異。 VM 是從操作系統層虛擬化，建立 Guest OS 環境；Container 則從應用程序層入手，將應用程序打包成映像檔，共用 Host OS。
date: 2023-11-30T07:28:30.651Z
lastmod: 2023-12-02T10:08:22+08:00
tags:
  - Container
categories:
  - Container
keywords:
  - Docker
  - Host OS
  - Guest OS
slug: container-vm-difference
series: 靈活運用 Docker 打造高效的容器化應用環境
---

![What's the Diff: Containers vs VMs](https://www.backblaze.com/blog/wp-content/uploads/2018/06/whats-the-diff-container-vs-vm.jpg)
(圖片來源: [What’s the Diff: VMs vs Containers](https://www.backblaze.com/blog/vm-vs-containers/))

在討論容器化技術之前，要先了解到底 **容器(Container)** 與 **虛擬機器(Virtual Machine, VM)** 兩者之間的差異到底在那。

雖然 Container 與 Virtual Machine 都是基於作業系統 (Operating System, OS) 的高階虛擬化的技術，但是兩者的架構與完全不一樣。

VM 是從操作系統層虛擬化，在 `主要作業系統(Host OS)` 上，再建立`獨立的 OS 環境(Guest OS)`。

Container 則從應用程序層入手，將應用程序打包成映像檔，共用`主要作業系統(Host OS)`。

## 容器(Container) v.s. 虛擬機器(Virtual Machine, VM)

### Vitual Machine, VM

Virtual Machine 是從 **作業系統** 下手，它的目標就是 **建立一個可以執行完整作業系統的獨立環境**。

說到這，就不得不提到 **Hypervisor**，它又稱為虛擬機器監視器 (Virtual Machine Monitor, VMM)，是 Guest OS 與實體機器(physical hardware)的中間層。

一方面，以軟體的方式，模擬硬體環境替代實體機器，提供適當的 CPU、記憶體、硬碟容量……等虛擬硬體資源給 OS 使用。

另一方面，負責協調不同虛擬硬體之間對實體機器的操作，以達到多個 OS 與應用程式共用同一套實體機器的資源。例如 VMware vSphere 或 Microsoft Hyper-V 就是 Hypervisor。

可以想成，Hypervisor 就是硬體提供商，它單純只提供硬體。因此，需要安裝作業系統，才能執行應用程式。而安裝在 Hypervisor 上的 OS，又稱為 Guest OS。

### Container

Container 則是直接針對 **應用程式層** 下手，一方面將 **應用程式本身與相關的函式庫、環境配置檔，打包成映像檔 (Image)**，以達到應用程式的獨立與模組化。

另一方面，藉由 OS 層的抽象化，經由 **Containers Daemon** 的支援，讓每一個 Container 都是獨立環境的前提下，共用 Host OS。這種架構，讓 Container 可運行在實體機、虛擬器，或是雲端基礎設施 (cloud infrastructure)。

因為 Container 共用 Host OS，所以不像 VM，需要等待 Guest OS 的啟動時間。自然 Container 的啟動時間遠快於 VM。

🔔 題外話 🔔

Container 技術最早是被發佈與運用在 Linux 之中，經過 Docker 的推廣，才讓 Container 真正的大紅，因此早期僅支援 Linux 環境。

若要在 Windows 之中使用，只能透過 Virtaul Machine 安裝 Linux Kernel 才能使用，造成 container 在 Windows 的環境下，效能表現不佳，讓許多基於 Windows 的軟體開發商避而不用。

雖然 Microsoft 先是推出 Windows Subsystem for Linux (WSL)，提供 Linux 的程式於 Windows 上使用，但依然有所局限。

在 2017 年 Linux Container on Windows (LCOW) 與 Windows Container on Linux (WCOL) 的推出，更是消弭了 Windows 與 Linux 之間的那道牆。

在 2020 年 9 月 Microsoft 調整 WSL 的架構，推出 WSL2，讓完整的 Linux 核心跑在 Hyper-V 的虛擬機器，提供更貼近原生 Linux 的使用體驗。

## 補充資料

▶ 延伸閱讀

- [Container 簡介](../../build-automated-deploy/container-intro/index.md)
- [靈活運用 Docker - 打造高效的容器化應用環境](../flexibly-use-docker-foreword/index.md)

▶ 外部文章
