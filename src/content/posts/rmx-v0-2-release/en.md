---
title: "rmx v0.2: The Right Way to Delete Directories on Windows"
excerpt: "Rewritten concurrency, symlink safety, live progress, CI binaries. 1.8× faster than the previous release on NTFS."
coverLabel: "v0.2 Release"
date: "2026-02-08T00:00:00.000Z"
author: "zerx"
category: "release"
tags: ["rust", "performance"]
featured: false
---

# rmx v0.2: The Right Way to Delete Directories on Windows

If you have ever deleted a `node_modules` on Windows, you know Explorer will sit there enumerating every file before it removes anything. `rmx` is a Rust tool that turns this into a parallelizable task graph.

## What is new

- **Rewritten concurrency**: switched from Tokio async fs to Rayon + `std::fs`, 1.8× faster on NTFS
- **Symlink safe**: no follow by default, no more accidental system-wide rm
- **Live progress**: per-second throughput while deleting, no more "black screen" on huge trees
- **CI binaries**: GitHub Actions now ships x86_64 and aarch64 executables

## Install

```bash
cargo install rmx
# or grab a prebuilt binary:
# https://github.com/zerx-lab/rmx/releases
```

## Why not PowerShell?

`Remove-Item -Recurse -Force` is not slow per se; it is slow because it runs through the managed file API — every directory level goes through the .NET layer. `rmx` talks directly to Win32 `RemoveDirectoryW` and pipelines "enumerate + delete" via a thread pool.
