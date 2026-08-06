---
title: "WordZero 为什么比 Python 方案快 21 倍"
excerpt: "零依赖、类型驱动样式继承、Writer 组合式输出 —— 把 OOXML 解析做到 2.62ms 的三件事。"
coverLabel: "Benchmark"
date: "2026-03-22T00:00:00.000Z"
author: "zerx"
category: "engineering"
tags: ["go", "performance", "wordzero"]
featured: true
---

# WordZero 为什么比 Python 方案快 21 倍

WordZero 是一个用纯 Go 实现的 Word 文档处理引擎。平均处理耗时 2.62ms,而对应 Python 的方案需要 55.98ms。差距不是 2 倍,是 21 倍。

## 基准怎么做的

基准测试的前提永远比数字重要:

- **任务**:一份 20 页、含表格与样式的 .docx,读取全部段落并改写标题样式后输出
- **环境**:MacBook Pro M1,Go 1.22,Python 3.12,关闭虚拟机、禁用后台服务
- **重复**:单次任务跑 200 轮,去掉前后各 10 个样本取均值

## 为什么 Go 快这么多

1. **零依赖 OOXML 解析**。没有 DOM 树、没有反射,直接按字节流扫描 XML
2. **样式继承在类型系统中表达**,避免运行时递归查表
3. **输出用 Writer 组合** 而不是先构建完整树再 marshal
4. Python 方案的 `python-docx` 基于 lxml,解析整个 DOM 进内存是开销大头

## 这对用户意味着什么

当处理单份文档时,21 倍感知不强。但如果是**服务端批处理**(合同生成、报告导出),这个差距意味着同样的硬件能支撑 20 倍并发,或省掉 90% 的实例费用。

```go
package main

import "github.com/zerx-lab/wordzero"

func main() {
    doc, err := wordzero.Open("report.docx")
    if err != nil {
        panic(err)
    }
    doc.ApplyStyle("Heading 1", wordzero.StyleBold)
    doc.SaveAs("report-styled.docx")
}
```

完整 benchmark 源码在仓库的 `benchmark/` 目录。
