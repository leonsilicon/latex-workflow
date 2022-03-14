import * as path from 'node:path';
import fs from 'node:fs';
import mockArgv from 'mock-argv';
import { join } from 'desm';
import filenamify from 'filenamify';
import { beforeAll, afterAll, test, expect } from 'vitest';
import { latexWorkflowCli } from '~/utils/cli.js';
import { compileLatex, LatexError } from '~/index.js';

const fixturesPath = join(import.meta.url, '../fixtures');

function cleanArtifactDirectories() {
	fs.rmSync('out', { force: true, recursive: true });
}

beforeAll(() => {
	cleanArtifactDirectories();
});

afterAll(() => {
	// Don't delete the artifact folder in case we want to inspect the PDFs
	// `cleanArtifactDirectories();`
});

const ignoreDirectories: string[] = [];

function getOutDir(testName: string) {
	return path.join(fixturesPath, 'out', filenamify(testName));
}

const docFilePaths = {
	plainDoc: 'plain-doc/plain-doc.tex',
	docWithBib: 'doc-with-bib/doc-with-bib.tex',
	docWithPython: 'doc-with-python/doc-with-python.tex',
	docWithBibAndPython: 'doc-with-bib-and-python/doc-with-bib-and-python.tex',
	docWithImages: 'doc-with-images/doc-with-images.tex',
	badDoc: 'bad-doc/bad-doc.tex',
	badDocWithImages: 'bad-doc-with-images/bad-doc-with-images.tex',
	jslatexDoc: 'jslatex-doc/test.tex',
};

function getDocNameFromPath(docFilePath: string) {
	return path.basename(docFilePath, '.tex');
}

function getLatexFilePath(docFilePath: string) {
	return path.join(fixturesPath, docFilePath);
}

function getOutputPdfPath(testName: string, docFilePath: string) {
	const outDir = getOutDir(testName);
	return path.join(outDir, `${getDocNameFromPath(docFilePath)}.pdf`);
}

{
	const testName = 'cli works';
	test.concurrent(testName, async () => {
		const latexFilePath = getLatexFilePath(docFilePaths.docWithPython);
		const outDir = getOutDir(testName);
		await mockArgv(
			[latexFilePath, `--output-directory=${outDir}`],
			async () => {
				await latexWorkflowCli();
			}
		);
		expect(
			fs.existsSync(getOutputPdfPath(testName, docFilePaths.docWithPython))
		).toBe(true);
	});
}

{
	const testName = 'compiles plain latex file';
	test.concurrent(testName, async () => {
		const latexFilePath = path.join(fixturesPath, docFilePaths.plainDoc);
		await compileLatex({
			latexFilePath,
			outputDirectory: getOutDir(testName),
			ignoreDirectories,
		});
		expect(
			fs.existsSync(getOutputPdfPath(testName, docFilePaths.plainDoc))
		).toBe(true);
	});
}

{
	const testName = 'compiles latex file with python';
	test.concurrent(testName, async () => {
		const latexFilePath = getLatexFilePath(docFilePaths.docWithPython);
		await compileLatex({
			latexFilePath,
			outputDirectory: getOutDir(testName),
			ignoreDirectories,
		});
		expect(
			fs.existsSync(getOutputPdfPath(testName, docFilePaths.docWithPython))
		).toBe(true);
	});
}

{
	const testName = 'works with absolute path';
	test.concurrent(testName, async () => {
		await compileLatex({
			latexFilePath: getLatexFilePath(docFilePaths.docWithPython),
			outputDirectory: getOutDir(testName),
			ignoreDirectories,
		});
		expect(
			fs.existsSync(getOutputPdfPath(testName, docFilePaths.docWithPython))
		).toBe(true);
	});
}

{
	const testName = 'compiles latex file with bibliography';
	test.concurrent(testName, async () => {
		await compileLatex({
			latexFilePath: getLatexFilePath(docFilePaths.docWithBib),
			outputDirectory: getOutDir(testName),
			ignoreDirectories,
		});
		expect(
			fs.existsSync(getOutputPdfPath(testName, docFilePaths.docWithBib))
		).toBe(true);
	});
}

{
	const testName = 'compiles latex with bibliography and python';
	test.concurrent(testName, async () => {
		await compileLatex({
			latexFilePath: getLatexFilePath(docFilePaths.docWithBibAndPython),
			outputDirectory: getOutDir(testName),
			ignoreDirectories,
		});
		expect(
			fs.existsSync(
				getOutputPdfPath(testName, docFilePaths.docWithBibAndPython)
			)
		).toBe(true);
	});
}

{
	const testName = 'compiles latex with images';
	test.concurrent(testName, async () => {
		await compileLatex({
			latexFilePath: getLatexFilePath(docFilePaths.docWithImages),
			outputDirectory: getOutDir(testName),
			ignoreDirectories,
		});
		expect(
			fs.existsSync(getOutputPdfPath(testName, docFilePaths.docWithImages))
		).toBe(true);
	});
}

{
	const testName = 'copies artifacts to output directory on failure';
	test.concurrent(testName, async () => {
		const outDir = getOutDir(testName);

		await expect(async () => {
			await compileLatex({
				latexFilePath: getLatexFilePath(docFilePaths.badDoc),
				outputDirectory: outDir,
				ignoreDirectories,
			});
		}).rejects.toThrow();

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
}

{
	const testName = 'fails when there is a bad doc with images';
	test.concurrent(testName, async () => {
		await expect(async () => {
			await compileLatex({
				latexFilePath: getLatexFilePath(docFilePaths.badDocWithImages),
				outputDirectory: getOutDir(testName),
				ignoreDirectories,
			});
		}).rejects.toThrow(LatexError);
	});
}

{
	const testName = 'can compile multiple files at once';
	test.concurrent(testName, async () => {
		const promises: Array<ReturnType<typeof compileLatex>> = [];
		const outputDirectories = Array.from({ length: 5 }).map((_, i) =>
			path.join(getOutDir(testName), `doc${i}`)
		);
		for (const outputDirectory of outputDirectories) {
			promises.push(
				compileLatex({
					latexFilePath: getLatexFilePath(docFilePaths.plainDoc),
					outputDirectory,
					ignoreDirectories,
				})
			);
		}

		await Promise.all(promises);

		for (const outputDirectory of outputDirectories) {
			expect(
				fs.existsSync(
					path.join(
						outputDirectory,
						`${getDocNameFromPath(docFilePaths.plainDoc)}.pdf`
					)
				)
			).toBe(true);
		}
	});
}

{
	const testName = 'compiles jslatex doc';
	test.concurrent(testName, async () => {
		await compileLatex({
			latexFilePath: getLatexFilePath(docFilePaths.jslatexDoc),
			outputDirectory: getOutDir(testName),
			ignoreDirectories,
		});
		expect(
			fs.existsSync(getOutputPdfPath(testName, docFilePaths.jslatexDoc))
		).toBe(true);
	});
}
