---
title: Docker | 使用 Docker 建立 Redis
description: null
date: 2023-02-18T05:44:45.393Z
categories: null
tags: null
keywords: null
draft: true
---

> 🔖 長話短說 🔖
>

<!--more-->

[redis - Official Image | Docker Hub](https://hub.docker.com/_/redis)

```shell
docker pull redis
```

[persistence](http://redis.io/topics/persistence).

docker-compose.yml
```yml
ersion: '3.8'
services:
  myredis:
    container_name: myredis
    image: redis:6.0.6
    restart: always
    ports:
      - 6379:6379
    privileged: true
    command: redis-server /etc/redis/redis.conf --appendonly yes
    volumes:
      - $PWD/data:/data
      - $PWD/conf/redis.conf:/etc/redis/redis.conf
    networks:
      - myweb

networks:

  myweb:
    driver: bridge
```

## 延伸閱讀

▶ 站內文章



- [docker-compose 安装 redis](https://blog.51cto.com/u_6192297/3299825)