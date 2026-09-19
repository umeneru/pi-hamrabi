import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { VERSION, type ExtensionAPI, type Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";

const GAP = 2;
const LEFT_MIN_WIDTH = 24;
const RIGHT_MARGIN = 1;
const ART_URL = new URL("../assets/ascii-art.txt", import.meta.url);

const wrapLines = (lines: readonly string[], width: number): string[] =>
	lines.flatMap((line) => wrapTextWithAnsi(line, width));

export function renderHeader(infoLines: readonly string[], artLines: readonly string[], requestedWidth: number): string[] {
	const width = Math.max(1, requestedWidth);
	const artWidth = Math.max(0, ...artLines.map(visibleWidth));
	const leftWidth = width - artWidth - GAP - RIGHT_MARGIN;

	if (artLines.length > 0 && leftWidth >= LEFT_MIN_WIDTH) {
		const left = wrapLines(infoLines, leftWidth);
		return Array.from({ length: Math.max(left.length, artLines.length) }, (_, index) => {
			const leftLine = truncateToWidth(left[index] ?? "", leftWidth);
			const padding = " ".repeat(leftWidth - visibleWidth(leftLine));
			return truncateToWidth(`${leftLine}${padding}${" ".repeat(GAP)}${artLines[index] ?? ""}`, width);
		});
	}

	const info = wrapLines(infoLines, width);
	const art = artLines.map((line) => truncateToWidth(line, width));
	return art.length > 0 ? [...info, "", ...art] : info;
}

export function shortenHome(path: string, home = homedir()): string {
	return path === home ? "~" : path.startsWith(`${home}/`) ? `~${path.slice(home.length)}` : path;
}

const readArt = async (): Promise<string[]> => {
	const content = (await readFile(ART_URL, "utf8")).replaceAll("\r", "").replace(/\n$/, "");
	return content === "" ? [] : content.split("\n");
};

const themedInfo = (theme: Theme, cwd: string, model: string, skills: string): string[] => {
	const line = (label: string, value: string) => `${theme.fg("accent", `${label}:`)} ${value}`;
	return [line("pi", `v${VERSION}`), line("cwd", cwd), line("Model", model), line("Skills", skills)];
};

export default function asciiHeader(pi: ExtensionAPI): void {
	let artPromise: Promise<string[]> | undefined;
	let notifiedArtError = false;

	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		let artLines: string[] = [];
		try {
			artPromise ??= readArt();
			artLines = await artPromise;
		} catch (error: unknown) {
			if (!notifiedArtError) {
				notifiedArtError = true;
				ctx.ui.notify(`ASCII header art could not be loaded: ${error instanceof Error ? error.message : String(error)}`, "error");
			}
		}

		const cwd = shortenHome(ctx.cwd);
		const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "-";
		const skills = pi
			.getCommands()
			.filter((command) => command.source === "skill")
			.map((command) => command.name.replace(/^skill:/, ""))
			.sort((a, b) => a.localeCompare(b))
			.join(", ") || "-";

		ctx.ui.setHeader((_tui, theme) => ({
			render: (width) => renderHeader(themedInfo(theme, cwd, model, skills), artLines.map((line) => theme.fg("accent", line)), width),
			invalidate() {},
		}));
	});
}
