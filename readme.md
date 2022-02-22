# lualatex-py

A small script that only runs `pythontex` if the LaTeX document has Python code.

## Installation

```shell
# npm
npm install -g lualatex-py

# pnpm
pnpm add --global lualatex-py
```

## Usage

```shell
lualatex-py --output-directory=out doc.tex
```

If you're using VSCode LaTeX Workshop, add the following to your `settings.json` file:

```jsonc
{
  // ... other VSCode configs
  "latex-workshop.latex.recipes": [
    {
      "name": "lualatex-py",
      "tools": [
        "lualatex-py"
      ]
    },
    // ... other recipes
  ],
  "latex-workshop.latex.tools": [
    {
      "name": "lualatex-py",
      "command": "lualatex-py",
      "args": [
        "--output-directory=out",
        "%DOC%.tex"
      ]
    },
    // ... other tools
  ]
}
```
