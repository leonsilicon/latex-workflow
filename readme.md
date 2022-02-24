# latex-workflow

A custom LaTeX workflow for compiling LaTeX documents.

## Installation

```shell
# npm
npm install -g latex-workflow

# pnpm
pnpm add --global latex-workflow
```

## Usage

```shell
latex-workflow --output-directory=out doc.tex
```

If you're using VSCode LaTeX Workshop, add the following to your `settings.json` file:

```jsonc
{
  // ... other VSCode configs
  "latex-workshop.latex.recipes": [
    {
      "name": "latex-workflow",
      "tools": [
        "latex-workflow"
      ]
    },
    // ... other recipes
  ],
  "latex-workshop.latex.tools": [
    {
      "name": "latex-workflow",
      "command": "latex-workflow",
      "args": [
        "--output-directory=out",
        "%DOC%.tex"
      ]
    },
    // ... other tools
  ]
}
```
