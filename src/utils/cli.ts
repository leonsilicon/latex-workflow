import process from 'node:process';
import { program } from 'commander';
import type { ExecaError } from 'execa';
import { compileLatex } from '~/utils/latex.js';

export function latexWorkflowCli() {
	program
		.name('latex-workflow')
		.showHelpAfterError()
		.argument('<file>', 'full path to latex file')
		.requiredOption('--output-directory <dir>');

	const cli = program.parse();
	const latexFilePath = cli.args[0]!;
	const outputDirectory = cli.opts().outputDirectory as string;

	try {
		compileLatex({ latexFilePath, outputDirectory });
	} catch (error: unknown) {
		// Don't log execa errors
		if (!('exitCode' in (error as ExecaError))) {
			console.error(error);
		}

		process.exit(1);
	}
}
