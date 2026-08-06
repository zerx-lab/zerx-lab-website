// 本地冒烟用的最小静态服务器:按 GitHub Pages 的规则伺服 dist/
// (目录 → index.html,未命中 → 404.html)。仅供开发调试,不参与部署。
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const ROOT = resolve("dist");
const PORT = Number(process.env.PORT ?? 4322);

const MIME = {
	".html": "text/html; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".svg": "image/svg+xml",
	".txt": "text/plain; charset=utf-8",
};

async function resolveFile(pathname) {
	const target = join(ROOT, decodeURIComponent(pathname));
	try {
		const info = await stat(target);
		if (info.isDirectory()) return join(target, "index.html");
		return target;
	} catch {
		return null;
	}
}

createServer(async (req, res) => {
	const { pathname } = new URL(req.url, "http://localhost");
	const file = await resolveFile(pathname);
	if (!file) {
		const body = await readFile(join(ROOT, "404.html")).catch(() => "404");
		res.writeHead(404, { "content-type": MIME[".html"] }).end(body);
		return;
	}
	const body = await readFile(file).catch(() => null);
	if (!body) {
		res.writeHead(404, { "content-type": MIME[".html"] }).end("404");
		return;
	}
	res
		.writeHead(200, {
			"content-type": MIME[extname(file)] ?? "application/octet-stream",
		})
		.end(body);
}).listen(PORT, () => console.log(`serving dist on http://localhost:${PORT}/`));
