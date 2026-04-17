/**
 * ============================================================================
 * RSS Feed — 英文入口
 * ----------------------------------------------------------------------------
 * 端点:
 *   /en/rss.xml     本文件(en,en-us)
 *   /rss.xml        src/pages/rss.xml.ts(zh,zh-cn,默认语言无前缀)
 *
 * 实现:
 *   核心 feed 构造逻辑全部在 src/pages/rss.xml.ts 的 buildLocalizedFeed() 中,
 *   本文件只负责传入 lang = "en" 得到一个 APIRoute 并 export。
 *
 *   这样做的好处:
 *     - 中英 feed 的字段映射、文章筛选、日期排序、CDATA 清理、绝对 URL 拼接
 *       等所有行为都经过同一条代码路径,两种语言 feed 的质量始终同步
 *     - 新增字段 / 修 bug 只改一处
 *     - 未来扩展新语言(如 ja / es),只需再加一个几行的入口文件
 *
 * 与中文 feed 的差异(均由 buildLocalizedFeed 内部处理):
 *   1. <language> 输出 "en-us" 而非 "zh-cn"
 *   2. <description> 输出英文站点简介
 *   3. 每条 <item> 取 titleEn / excerptEn / categoryNameEn,link 形如
 *      https://zerx.dev/en/blog/:slug,guid 同 link(跨 feed 唯一)
 *   4. <atom:link rel="self"> 指向 /en/rss.xml 自身
 *
 * 订阅入口:
 *   站点中所有 "RSS" 按钮在 /en/* 页面会指向 /en/rss.xml,
 *   由 useTranslatedPath("en") 自动生成,不需要硬编码。
 * ============================================================================
 */

import type { APIRoute } from "astro";
import { buildLocalizedFeed } from "../rss.xml";

export const GET: APIRoute = buildLocalizedFeed("en");
