import { describe, it } from "node:test";
import assert from "node:assert/strict";
import snapshot from "../../content/data/livebench.json";
import { cycleSort, defaultFilters, modelScore, normalizeFilters, parseFilters, scoreColumns, scoreShades, serializeFilters, visibleModels, type Category, type Model } from "./filters";

const data = snapshot as unknown as { categories: Category[]; models: Model[] };
const models = data.models;

const example: Model[] = [
	{ id: "base", name: "Base Unique", organization: "A", overall: 80, scores: { Reasoning: 90, Coding: 70 }, subtasks: { logic: 91 }, openWeights: true, finetune: false, baseId: null, variantGroup: "base" },
	{ id: "base-variant", name: "Variant", organization: "A", overall: 84, scores: { Reasoning: 88, Coding: 60 }, subtasks: { logic: null }, openWeights: true, finetune: false, baseId: null, variantGroup: "base" },
	{ id: "fine", name: "Fine", organization: "B", overall: 92, scores: { Reasoning: 80, Coding: 100 }, subtasks: { logic: 95 }, openWeights: false, finetune: true, baseId: "base", variantGroup: "base" },
	{ id: "other", name: "Other", organization: "B", overall: 70, scores: { Reasoning: null, Coding: 60 }, subtasks: { logic: null }, openWeights: false, finetune: false, baseId: null, variantGroup: "other" },
];
const exampleCategories: Category[] = [
	{ id: "Reasoning", name: "Reasoning", subtasks: ["logic"] },
	{ id: "Coding", name: "Coding", subtasks: [] },
];

describe("LiveBench filters", () => {
	it("retains the 57 highest-overall non-finetuned groups by default", () => {
		const visible = visibleModels(models, defaultFilters());
		assert.equal(visible.length, 57);
		assert.ok(visible.every((model) => !model.finetune));
		assert.equal(new Set(visible.map((model) => model.variantGroup)).size, 57);
		for (const shown of visible) assert.ok(models.filter((model) => !model.finetune && model.variantGroup === shown.variantGroup).every((model) => model.overall <= shown.overall));
	});

	it("only fine-tunes includes related base IDs even in the same variant group", () => {
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), ft: "only" }).map((model) => model.id), ["fine", "base"]);
		assert.deepEqual(visibleModels(example, defaultFilters()).map((model) => model.id), ["base-variant", "other"]);
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), ft: "all", compare: ["base", "base-variant"] }).map((model) => model.id), ["base-variant", "base"]);
		const realOnly = new Set(visibleModels(models, { ...defaultFilters(), ft: "only" }).map((model) => model.id));
		for (const fine of models.filter((model) => model.finetune)) {
			assert.ok(realOnly.has(fine.id));
			assert.ok(fine.baseId && realOnly.has(fine.baseId));
		}
	});

	it("applies search, organization and fine-tune mode before comparison", () => {
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), q: "unique" }).map((model) => model.id), ["base"]);
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), q: "base-variant" }).map((model) => model.id), ["base-variant"]);
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), open: true }).map((model) => model.id), ["base-variant"]);
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), ft: "all", org: "B" }).map((model) => model.id), ["fine", "other"]);
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), compare: ["base"] }).map((model) => model.id), ["base"]);
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), compare: ["fine"] }).map((model) => model.id), []);
		assert.deepEqual(visibleModels(example, { ...defaultFilters(), ft: "only", compare: ["fine"] }).map((model) => model.id), ["fine"]);
	});

	it("all, single, and multiple categories use the correct score precision", () => {
		assert.deepEqual(scoreColumns(exampleCategories, []), ["overall", "Reasoning", "Coding"]);
		assert.deepEqual(scoreColumns(exampleCategories, ["Reasoning"]), ["Reasoning", "logic"]);
		assert.deepEqual(scoreColumns(exampleCategories, ["Reasoning", "Coding"]), ["overall", "Reasoning", "Coding"]);
		assert.equal(modelScore(example[0], "overall", []), 80);
		assert.equal(modelScore(example[0], "overall", ["Reasoning", "Coding"]), 80);
		assert.equal(modelScore(example[3], "overall", ["Reasoning", "Coding"]), 60);
		assert.equal(modelScore(example[1], "logic", ["Reasoning"]), null);
		const precise = { ...example[0], scores: { Reasoning: 90.123, Coding: 60.001 } };
		assert.equal(modelScore(precise, "overall", ["Reasoning", "Coding"]), 75.062);
	});

	it("falls back to a visible sort column and normalizes invalid URL values", () => {
		const parsed = parseFilters(new URLSearchParams("ft=wrong&org=missing&compare=unknown,base,base&cats=bad,Reasoning&hide=Reasoning,overall,bad&sort=Reasoning&dir=bogus&q=%20Base%20"), exampleCategories, example);
		assert.deepEqual({ ft: parsed.ft, org: parsed.org, compare: parsed.compare, cats: parsed.cats, hide: parsed.hide, sort: parsed.sort, dir: parsed.dir, q: parsed.q }, { ft: "hide", org: "", compare: ["base"], cats: ["Reasoning"], hide: ["Reasoning", "overall"], sort: "logic", dir: "desc", q: "Base" });
		assert.equal(normalizeFilters({ ...parsed, hide: ["logic"] }, exampleCategories, example).sort, "Reasoning");
	});

	it("round-trips all filter settings while preserving unrelated URL parameters", () => {
		const state = normalizeFilters({ ...defaultFilters(), open: true, ft: "all", showorg: false, org: "A", compare: ["base", "fine"], hide: ["Coding"], cats: ["Reasoning", "Coding"], q: "Base", sort: "Reasoning", dir: "asc" }, exampleCategories, example);
		const params = serializeFilters(new URLSearchParams("campaign=preview&ft=invalid"), state, exampleCategories, example);
		assert.equal(params.get("campaign"), "preview");
		assert.equal(params.get("ft"), "all");
		assert.deepEqual(parseFilters(params, exampleCategories, example), state);
	});
	it("cycles descending, ascending and default without clearing filters", () => {
		let state = normalizeFilters({ ...defaultFilters(), ft: "all", cats: ["Reasoning", "Coding"] }, exampleCategories, example);
		const original = visibleModels(example, state).map((model) => model.id);
		for (const dir of ["desc", "asc", "default"]) {
			state = normalizeFilters(cycleSort(state, "Coding"), exampleCategories, example);
			assert.equal(state.dir, dir);
			assert.equal(state.ft, "all");
			const url = serializeFilters(new URLSearchParams(), state, exampleCategories, example);
			assert.deepEqual(parseFilters(url, exampleCategories, example), state);
		}
		assert.equal(state.sort, "overall");
		assert.deepEqual(visibleModels(example, state).map((model) => model.id), original);
		assert.equal(serializeFilters(new URLSearchParams("sort=Coding&dir=asc"), state, exampleCategories, example).has("sort"), false);
		state = normalizeFilters({ ...state, cats: ["Reasoning"], hide: ["Reasoning"] }, exampleCategories, example);
		assert.equal(state.sort, "logic");
		for (const dir of ["desc", "asc", "default"]) {
			state = normalizeFilters(cycleSort(state, "logic"), exampleCategories, example);
			assert.equal(state.dir, dir);
		}
		assert.equal(state.sort, "logic");
	});
	it("shades each visible column top five and recalculates filtered scope", () => {
		const rows = Array.from({ length: 7 }, (_, i) => ({ ...example[0], id: String(i), overall: i, scores: { Coding: 6 - i }, subtasks: { logic: i === 6 ? null : i } }));
		const shades = scoreShades(rows, ["overall", "Coding", "logic"], []);
		assert.deepEqual([...shades.get("overall")!.keys()], ["6", "5", "4", "3", "2"]);
		assert.deepEqual([...shades.get("Coding")!.keys()], ["0", "1", "2", "3", "4"]);
		assert.deepEqual([...shades.get("logic")!.keys()], ["5", "4", "3", "2", "1"]);
		assert.equal(new Set(shades.get("overall")!.values()).size, 5);
		assert.deepEqual(scoreShades([...rows].reverse(), ["overall"], []).get("overall"), shades.get("overall"));
		assert.deepEqual([...scoreShades(rows.slice(0, 2), ["overall"], []).get("overall")!.keys()], ["1", "0"]);
		assert.deepEqual([...scoreShades(rows, ["overall"], ["Coding"]).get("overall")!.keys()], ["0", "1", "2", "3", "4"]);
	});
});
