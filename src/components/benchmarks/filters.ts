export interface Category {
	id: string;
	name: string;
	subtasks: string[];
}

export interface Model {
	id: string;
	name: string;
	organization: string;
	overall: number;
	scores: Record<string, number | null>;
	subtasks: Record<string, number | null>;
	openWeights: boolean;
	finetune: boolean;
	baseId: string | null;
	variantGroup: string;
}

export interface FilterState {
	q: string;
	open: boolean;
	ft: "hide" | "all" | "only";
	showorg: boolean;
	org: string;
	compare: string[];
	hide: string[];
	cats: string[];
	sort: string;
	dir: "default" | "asc" | "desc";
}

export const defaultFilters = (): FilterState => ({
	q: "", open: false, ft: "hide", showorg: true, org: "", compare: [], hide: [], cats: [], sort: "overall", dir: "default",
});

export function scoreColumns(categories: Category[], cats: string[]): string[] {
	if (cats.length === 1) return [cats[0], ...(categories.find((category) => category.id === cats[0])?.subtasks ?? [])];
	return ["overall", ...(cats.length ? cats : categories.map((category) => category.id))];
}

export function normalizeFilters(state: FilterState, categories: Category[], models: Model[]): FilterState {
	const categoryIds = new Set(categories.map((category) => category.id));
	const modelIds = new Set(models.map((model) => model.id));
	const orgs = new Set(models.map((model) => model.organization));
	const allColumns = new Set(["overall", ...categories.flatMap((category) => [category.id, ...category.subtasks])]);
	const unique = (values: string[], valid: Set<string>) => [...new Set(values.filter((value) => valid.has(value)))];
	const cats = unique(state.cats, categoryIds);
	const columns = scoreColumns(categories, cats);
	const hide = unique(state.hide, allColumns);
	const visible = columns.filter((column) => !hide.includes(column));
	return {
		q: state.q.trim(), open: state.open === true, ft: ["hide", "all", "only"].includes(state.ft) ? state.ft : "hide",
		showorg: state.showorg !== false, org: orgs.has(state.org) ? state.org : "",
		compare: unique(state.compare, modelIds), hide, cats,
		sort: state.dir !== "default" && visible.includes(state.sort) ? state.sort : visible[0] ?? "", dir: state.dir === "default" ? "default" : state.dir === "asc" ? "asc" : "desc",
	};
}

export function parseFilters(params: URLSearchParams, categories: Category[], models: Model[]): FilterState {
	return normalizeFilters({
		q: params.get("q") ?? "", open: params.get("open") === "1", ft: params.get("ft") as FilterState["ft"],
		showorg: params.get("showorg") !== "0", org: params.get("org") ?? "",
		compare: (params.get("compare") ?? "").split(",").filter(Boolean),
		hide: (params.get("hide") ?? "").split(",").filter(Boolean),
		cats: (params.get("cats") ?? "").split(",").filter(Boolean),
		sort: params.get("sort") ?? "overall", dir: params.get("dir") === "asc" ? "asc" : params.has("sort") || params.get("dir") === "desc" ? "desc" : "default",
	}, categories, models);
}

const filterKeys = ["open", "ft", "showorg", "org", "compare", "hide", "cats", "q", "sort", "dir"];
export function serializeFilters(params: URLSearchParams, state: FilterState, categories: Category[], models: Model[]): URLSearchParams {
	const next = new URLSearchParams(params);
	for (const key of filterKeys) next.delete(key);
	const s = normalizeFilters(state, categories, models);
	if (s.open) next.set("open", "1");
	if (s.ft !== "hide") next.set("ft", s.ft);
	if (!s.showorg) next.set("showorg", "0");
	if (s.org) next.set("org", s.org);
	if (s.compare.length) next.set("compare", s.compare.join(","));
	if (s.hide.length) next.set("hide", s.hide.join(","));
	if (s.cats.length) next.set("cats", s.cats.join(","));
	if (s.q) next.set("q", s.q);
	if (s.dir !== "default") {
		if (s.sort) next.set("sort", s.sort);
		next.set("dir", s.dir);
	}
	return next;
}

export function cycleSort(state: FilterState, column: string): FilterState {
	const dir = state.sort !== column || state.dir === "default" ? "desc" : state.dir === "desc" ? "asc" : "default";
	return { ...state, sort: column, dir };
}

export function modelScore(model: Model, column: string, cats: string[]): number | null {
	if (column === "overall") {
		if (!cats.length) return model.overall;
		const values = cats.map((cat) => model.scores[cat]).filter((score): score is number => score != null);
		return values.length ? values.reduce((sum, score) => sum + score, 0) / values.length : null;
	}
	return model.scores[column] ?? model.subtasks[column] ?? null;
}

// Match LiveBench: rank the visible rows independently in each score column.
const scoreTints = [0.24, 0.17, 0.115, 0.07, 0.035].map((alpha) => `rgba(47, 84, 235, ${alpha})`);
export function scoreShades(rows: Model[], columns: string[], cats: string[]): Map<string, Map<string, string>> {
	const shades = new Map<string, Map<string, string>>();
	for (const column of columns) {
		const ranked = rows.map((model) => ({ id: model.id, score: modelScore(model, column, cats) }))
			.filter((entry): entry is { id: string; score: number } => entry.score !== null && Number.isFinite(entry.score))
			.sort((a, b) => b.score - a.score);
		shades.set(column, new Map(ranked.slice(0, scoreTints.length).map((entry, index) => [entry.id, scoreTints[index]])));
	}
	return shades;
}

export function visibleModels(models: Model[], state: FilterState): Model[] {
	const query = state.q.toLocaleLowerCase();
	const finetunedBases = new Set(models.filter((model) => model.finetune).map((model) => model.baseId).filter(Boolean));
	const compare = new Set(state.compare);
	const candidates = models.filter((model) =>
		(!state.open || model.openWeights) &&
		(state.ft === "all" || (state.ft === "hide" ? !model.finetune : model.finetune || finetunedBases.has(model.id))) &&
		(!state.org || model.organization === state.org) &&
		(!query || `${model.name} ${model.id} ${model.organization}`.toLocaleLowerCase().includes(query)) &&
		(!compare.size || compare.has(model.id)),
	);
	const selected = new Map<string, Model>();
	for (const model of candidates) {
		const key = compare.size || state.ft === "only" ? model.id : model.variantGroup;
		const incumbent = selected.get(key);
		if (!incumbent || model.overall > incumbent.overall || (model.overall === incumbent.overall && model.name.localeCompare(incumbent.name) < 0)) selected.set(key, model);
	}
	const direction = state.dir === "asc" ? 1 : -1;
	return [...selected.values()].sort((a, b) => {
		const left = modelScore(a, state.sort, state.cats);
		const right = modelScore(b, state.sort, state.cats);
		if (left == null) return right == null ? b.overall - a.overall || a.id.localeCompare(b.id) : 1;
		if (right == null) return -1;
		return (left - right) * direction || b.overall - a.overall || a.id.localeCompare(b.id);
	});
}
