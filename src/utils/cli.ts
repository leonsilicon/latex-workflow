import process from 'node:process';
import { program } from 'commander';
import { compileLatex } from '~/utils/latex.js';

export function latexWorkflowCli() {
	program
		.name('latex-workflow')
		.showHelpAfterError()
		.argument('<file>', 'full path to latex file')
		.option('--output-directory <dir>');

	const cli = program.parse();
	const latexFilePath = cli.args[0]!;
	const outputDirectory = cli.opts().outputDirectory as string;

	try {
		compileLatex({ latexFilePath, outputDirectory });
	} catch {
		process.exit(1);
	}
}
