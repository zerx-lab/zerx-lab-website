---
title: "Why WordZero is 21× Faster than the Python Path"
excerpt: "Zero deps, type-driven style inheritance, Writer-composed output — three things that bring OOXML parsing down to 2.62ms."
coverLabel: "Benchmark"
date: "2026-03-22T00:00:00.000Z"
author: "zerx"
category: "engineering"
tags: ["go", "performance", "wordzero"]
featured: true
---

# Why WordZero is 21× Faster than the Python Path

WordZero is a pure-Go Word document engine. Average processing time is 2.62ms, while the corresponding Python solution takes 55.98ms. That is not 2× — it is 21×.

## How the benchmark was run

Benchmark context matters more than the number itself:

- **Task**: a 20-page .docx with tables and styles; read all paragraphs and restyle headings, then write out
- **Environment**: MacBook Pro M1, Go 1.22, Python 3.12, VMs off, background services disabled
- **Repetition**: 200 runs per task; mean computed after trimming the first and last 10 samples

## Why Go is this much faster

1. **Zero-dependency OOXML parsing**. No DOM tree, no reflection — XML is walked as a byte stream
2. **Style inheritance expressed in the type system**, avoiding runtime recursive lookups
3. **Output built via Writer composition** rather than building a full tree then marshalling
4. The Python path's `python-docx` relies on lxml; parsing the entire DOM into memory dominates cost

## What this means for users

For a single document, 21× is barely felt. But for **server-side batch workloads** (contract generation, report export), the gap means the same hardware can serve 20× concurrent requests, or 90% cheaper infra.

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

Full benchmark source lives in `benchmark/` under the repo.
