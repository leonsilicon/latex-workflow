import { program } from 'commander';
import { compileLatex } from '~/utils/latex.js';

export function lualatexPyCli() {
	program
		.name('lualatex-py')
		.showHelpAfterError()
		.argument('<file>', 'full path to latex file')
		.option('--output-directory <dir>');

	const cli = program.parse();
	const latexFilePath = cli.args[0]!;
	const outputDirectory = cli.opts().outputDirectory as string;

	compileLatex({ latexFilePath, outputDirectory });
}
