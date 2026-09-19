import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { renderHeader } from "../extensions/ascii-header.ts";

const info = ["pi: v0.85.1", "cwd: ~/work", "Model: provider/model", "Skills: html, review"];
const art = ["██", "██"];

test("wide layouts use two columns", () => {
	const lines = renderHeader(info, art, 60);
	assert.equal(lines.length, info.length);
	assert.match(lines[0], /pi: v0\.85\.1\s+██$/);
});

test("narrow layouts stack the art below the information", () => {
	const lines = renderHeader(info, art, 25);
	const separator = lines.indexOf("");
	assert.ok(separator >= info.length);
	assert.deepEqual(lines.slice(separator + 1), art);
});

test("every line fits extremely narrow widths", () => {
	for (const line of renderHeader(info, art, 3)) assert.ok(visibleWidth(line) <= 3);
});

test("long skills wrap without losing skill names", () => {
	const skills = ["html", "html-slide", "mr-review", "context-management"];
	const lines = renderHeader([`Skills: ${skills.join(", ")}`], [], 16);
	for (const skill of skills) assert.ok(lines.join("").includes(skill));
	assert.ok(lines.length > 1);
});

test("information renders without art", () => {
	assert.deepEqual(renderHeader(["pi: v0.85.1"], [], 80), ["pi: v0.85.1"]);
});
