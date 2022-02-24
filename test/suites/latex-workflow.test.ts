import * as path from 'node:path';
import fs from 'node:fs';
import * as process from 'node:process';
import mockArgv from 'mock-argv';
import { join } from 'desm';
import filenamify from 'filenamify';
import { latexWorkflowCli } from '~/utils/cli.js';
import { compileLatex } from '~/utils/latex.js';

const fixturesPath = join(import.meta.url, '../fixtures');
process.chdir(fixturesPath);

function cleanArtifactDirectories() {
	fs.rmSync('out', { force: true, recursive: true });
	fs.rmSync('../.latex-workflow', { force: true, recursive: true });
}

beforeAll(() => {
	cleanArtifactDirectories();
});

afterAll(() => {
	// CleanArtifactDirectories();
});

const ignoreDirectories = ['out'];

function getOutDir() {
	return path.join('out', filenamify(expect.getState().currentTestName));
}

const docNames = {
	plainDoc: 'plain-doc.tex',
	docWithBib: 'doc-with-bib.tex',
	docWithPython: 'doc-with-python.tex',
	docWithBibAndPython: 'doc-with-bib-and-python.tex',
};

function docPdfName(docName: string) {
	return `${path.basename(docName, '.tex')}.pdf`;
}

test('cli works', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithPython);
	const outDir = getOutDir();
	await mockArgv([latexFilePath, `--output-directory=${outDir}`], async () => {
		latexWorkflowCli();
	});
	expect(
		fs.existsSync(path.join(outDir, docPdfName(docNames.docWithPython)))
	).toBe(true);
});

test('compiles plain latex file', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.plainDoc);
	const outDir = getOutDir();
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
		ignoreDirectories,
	});
	expect(fs.existsSync(path.join(outDir, docPdfName(docNames.plainDoc)))).toBe(
		true
	);
});

test('compiles latex file with python', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithPython);
	const outDir = getOutDir();
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
		ignoreDirectories,
	});
	expect(
		fs.existsSync(path.join(outDir, docPdfName(docNames.docWithPython)))
	).toBe(true);
});

test('works with absolute path', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithPython);
	const outDir = path.join(fixturesPath, getOutDir());
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
		ignoreDirectories,
	});
	expect(
		fs.existsSync(path.join(outDir, docPdfName(docNames.docWithPython)))
	).toBe(true);
});

test('compiles latex file with bibliography', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithBib);
	const outDir = getOutDir();
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
		ignoreDirectories,
	});
	expect(
		fs.existsSync(path.join(outDir, docPdfName(docNames.docWithBib)))
	).toBe(true);
});

test('compiles latex with bibliography and python', async () => {
	const latexFilePath = path.join(fixturesPath, docNames.docWithBibAndPython);
	const outDir = getOutDir();
	compileLatex({
		latexFilePath,
		outputDirectory: outDir,
		ignoreDirectories,
	});
	expect(
		fs.existsSync(path.join(outDir, docPdfName(docNames.docWithBibAndPython)))
	).toBe(true);
});
