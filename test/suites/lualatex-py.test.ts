import * as path from 'node:path';
import fs from 'node:fs';
import * as process from 'node:process';
import mockArgv from 'mock-argv';
import { join } from 'desm';
import filenamify from 'filenamify';
import { lualatexPyCli } from '~/utils/cli.js';
import { compileLatex } from '~/utils/latex.js';

const fixturesPath = join(import.meta.url, '../fixtures');
process.chdir(fixturesPath);

function cleanOutDir() {
	fs.rmSync('out', { force: true, recursive: true });
}

beforeAll(() => {
	cleanOutDir();
});

afterAll(() => {
	cleanOutDir();
});

function getOutDir() {
	return path.join('out', filenamify(expect.getState().currentTestName));
}

const docNames = {
	docWithPython: 'doc-with-python.tex',
	docWithoutPython: 'doc-without-python.tex',
};

function docPdfName(docName: string) {
	return `${path.basename(docName, '.tex')}.pdf`;
}

test('cli works', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithPython);
	const outDir = getOutDir();
	await mockArgv([latexFilePath, `--output-directory=${outDir}`], async () => {
		lualatexPyCli();
	});
	expect(fs.existsSync(path.join(outDir, docNames.docWithPython))).toBe(true);
});

test('compiles latex file', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithPython);
	const outDir = getOutDir();
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
	});
	expect(fs.existsSync(path.join(outDir, docNames.docWithPython))).toBe(true);
});

test('works with absolute path', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithPython);
	const outDir = path.join(fixturesPath, getOutDir());
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
	});
	expect(
		fs.existsSync(path.join(outDir, docPdfName(docNames.docWithPython)))
	).toBe(true);
});

test('compiles latex file when there is no python', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithoutPython);
	const outDir = getOutDir();
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
	});
	expect(
		fs.existsSync(path.join(outDir, docPdfName(docNames.docWithoutPython)))
	).toBe(true);
});
