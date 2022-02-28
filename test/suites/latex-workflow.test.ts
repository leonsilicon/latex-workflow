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
	// Don't delete the artifact folder in case we want to inspect the PDFs
	// `cleanArtifactDirectories();`
});

const ignoreDirectories = ['out'];

function getOutDir() {
	return path.join(
		fixturesPath,
		'out',
		filenamify(expect.getState().currentTestName)
	);
}

const docFilePaths = {
	plainDoc: 'plain-doc/plain-doc.tex',
	docWithBib: 'doc-with-bib/doc-with-bib.tex',
	docWithPython: 'doc-with-python/doc-with-python.tex',
	docWithBibAndPython: 'doc-with-bib-and-python/doc-with-bib-and-python.tex',
	docWithImages: 'doc-with-images/doc-with-images.tex',
	badDoc: 'bad-doc/bad-doc.tex',
};

function getDocNameFromPath(docFilePath: string) {
	return path.basename(docFilePath, '.tex');
}

function getLatexFilePath(docFilePath: string) {
	return path.join(fixturesPath, docFilePath);
}

function getOutputPdfPath(docFilePath: string) {
	const outDir = getOutDir();
	return path.join(outDir, `${getDocNameFromPath(docFilePath)}.pdf`);
}

test('cli works', async () => {
	const latexFilePath = getLatexFilePath(docFilePaths.docWithPython);
	const outDir = getOutDir();
	await mockArgv([latexFilePath, `--output-directory=${outDir}`], async () => {
		latexWorkflowCli();
	});
	expect(fs.existsSync(getOutputPdfPath(docFilePaths.docWithPython))).toBe(
		true
	);
});

test('compiles plain latex file', async () => {
	const latexFilePath = path.join(fixturesPath, docFilePaths.plainDoc);
	compileLatex({
		latexFilePath,
		outputDirectory: getOutDir(),
		ignoreDirectories,
	});
	expect(fs.existsSync(getOutputPdfPath(docFilePaths.plainDoc))).toBe(true);
});

test('compiles latex file with python', async () => {
	const latexFilePath = getLatexFilePath(docFilePaths.docWithPython);
	compileLatex({
		latexFilePath,
		outputDirectory: getOutDir(),
		ignoreDirectories,
	});
	expect(fs.existsSync(getOutputPdfPath(docFilePaths.docWithPython))).toBe(
		true
	);
});

test('works with absolute path', async () => {
	compileLatex({
		latexFilePath: getLatexFilePath(docFilePaths.docWithPython),
		outputDirectory: getOutDir(),
		ignoreDirectories,
	});
	expect(fs.existsSync(getOutputPdfPath(docFilePaths.docWithPython))).toBe(
		true
	);
});

test('compiles latex file with bibliography', async () => {
	compileLatex({
		latexFilePath: getLatexFilePath(docFilePaths.docWithBib),
		outputDirectory: getOutDir(),
		ignoreDirectories,
	});
	expect(fs.existsSync(getOutputPdfPath(docFilePaths.docWithBib))).toBe(true);
});

test('compiles latex with bibliography and python', async () => {
	compileLatex({
		latexFilePath: getLatexFilePath(docFilePaths.docWithBibAndPython),
		outputDirectory: getOutDir(),
		ignoreDirectories,
	});
	expect(
		fs.existsSync(getOutputPdfPath(docFilePaths.docWithBibAndPython))
	).toBe(true);
});

test('compiles latex with images', async () => {
	compileLatex({
		latexFilePath: getLatexFilePath(docFilePaths.docWithImages),
		outputDirectory: getOutDir(),
		ignoreDirectories,
	});
	expect(fs.existsSync(getOutputPdfPath(docFilePaths.docWithImages))).toBe(
		true
	);
});

test('copies artifacts to output directory on failure', async () => {
	const outDir = getOutDir();

	expect(() => {
		compileLatex({
			latexFilePath: getLatexFilePath(docFilePaths.badDoc),
			outputDirectory: outDir,
			ignoreDirectories,
		});
	}).toThrow();

	expect(
		fs.existsSync(
			path.join(
				outDir,
				path.basename(docFilePaths.badDoc),
				`pythontex-files-${getDocNameFromPath(docFilePaths.badDoc)}`
			)
		)
	);
});
