---
title: "rmx v0.2 发布:Windows 目录删除的正确打开方式"
excerpt: "并发模型重写、符号链接安全、实时进度、CI 二进制。在 NTFS 上比上个版本快 1.8×。"
coverLabel: "v0.2 Release"
date: "2026-02-08T00:00:00.000Z"
author: "zerx"
category: "release"
tags: ["rust", "performance"]
featured: false
---

# rmx v0.2 发布:Windows 目录删除的正确打开方式

如果你在 Windows 上删过一个 `node_modules`,你就知道资源管理器会花上几分钟列出每一个文件再删除。`rmx` 用 Rust 把这件事拆成可并行的任务图。

## 新版本做了什么

- **并发模型重写**:从 Tokio 的 async fs 改为 Rayon + `std::fs`,在 NTFS 上快 1.8×
- **符号链接安全**:默认不跟进,避免删到系统目录
- **实时进度**:删除过程按秒刷新吞吐,长目录不再"黑屏"
- **CI 二进制**:GitHub Actions 自动出 x86_64 / aarch64 两套 exe

## 安装

```bash
cargo install rmx
# 或下载预编译:
# https://github.com/zerx-lab/rmx/releases
```

## 为什么不用 PowerShell?

`Remove-Item -Recurse -Force` 本身不慢,慢的是它走的是托管文件 API,每一级目录都要通过 .NET 层过一遍。而 `rmx` 直接调原生 Win32 `RemoveDirectoryW`,并用线程池把"枚举 + 删除"流水线化。
