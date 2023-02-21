---
title: Docker | 建立 PostgreSQL 的 container 時，同時完成資料庫的初始化
description: ""
tags:
  - Postgresql
  - Docker
categories:
  - container
keywords:
  - Docker
  - Postgresql
date: 2023-02-20T16:13:07.627Z
draft: true
slug: docker-postgresql-initialization-scripts
---



> 🔖 長話短說 🔖
>
> - 若要讓 PostgreSQL container 建立的同時，完成資料庫 schema 初始化。要在在建立 Docker Image 的同時，把 `init.sql` 複制到 `/docker-entrypoint-initdb.d/`
> - `docker-entrypoint-initdb.d` 可放入多個 .sql 檔，其執行順序依地區設定的檔名順序。預設為 `en_US.utf8`

<!--more-->


## 建立含有 db schema 的 postgreSQL Image

### 目的

- 

### 實作

在 [使用 dotnet-ef 建立 PostgreSQL 的 DBContext]({{< ref "../../Develop/efcore-postgresql/index.md">}}) 已經有使用 Docker-compose 建立 PostgreSQL 了，在這邊, 我們要來記錄起動 Container 時，自動把 database schema 建立起來。

在 PostgreSQL 的 [Docker Hub](https://hub.docker.com/_/postgres/) 內容中，`Initialization scripts` 有特別說明，若

#### 單個 init.sql 檔案

把 schema 的 存在 `init.sql`

```sql
CREATE DATABASE labdb;
USE labdb;

CREATE TABLE users (
  id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);


```

These initialization files will be executed in sorted name order as defined by the current locale, which defaults to `en_US.utf8`. Any `*.sql` files will be executed by `POSTGRES_USER`, which defaults to the `postgres` superuser.

```dockerfile
FROM postgres

COPY init.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_USER myuser
ENV POSTGRES_PASSWORD mypassword
ENV POSTGRES_DB mydb

EXPOSE 5432
```

接著將 Docker Image 建置出來。

```shell
docker build 
```

#### 使用多個 sql 檔案

隨著開發的進行，可能因為需求異動或增刪欄位，而頻繁更新 schema。導致每次異動，都需要更新建置 Image 的 init.sq。

或者，開發人員可能需要含有測試資料的開發專用的資料庫 Image。

在 PostgreSQL 的 `Initialization script` 也支援多個 .sql 的檔案，但會**依據檔案名稱的順序，逐一執行**，若沒有改變 docker 內的地區設定，預設使用 `en_US.utf8` 。

例如，想要 Migration 所有的資料庫異動，並加入測試資料。

```sql
-- migration-20230103
-- 資料庫的異動
ALTER TABLE users ADD COLUMN address VARCHAR(200);

```

```sql
-- test-data.sql
-- 增加測試資料
INSERT INTO users (id, name, email) VALUES
  (1, 'Alice', 'alice@example.com'),
  (2, 'Bob', 'bob@example.com'),
  (3, 'Charlie', 'charlie@example.com');

```

此時，

```dockerfile
FROM postgres

COPY init.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_USER myuser
ENV POSTGRES_PASSWORD mypassword
ENV POSTGRES_DB mydb

EXPOSE 5432
```

## 補充資料

▶ 站內文章

-  [使用 dotnet-ef 建立 PostgreSQL 的 DBContext]({{< ref "../../Develop/efcore-postgresql/index.md">}})

▶ 外部文章

- [Creating and filling a Postgres DB with Docker compose | by José David Arévalo | Level Up Coding](https://levelup.gitconnected.com/creating-and-filling-a-postgres-db-with-docker-compose-e1607f6f882f)