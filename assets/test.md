# Documentation Workflow: Markdown → HTML (SSG)

This document establishes the standard for creating, versioning, and automatically publishing technical documentation. We use Markdown as the single source of truth and Static Site Generators (SSG) to render professional HTML portals.

## 1. Recommended Tools

To convert simple text files into a polished documentation portal, we recommend one of the following tools based on the project's needs:

| Tool | Main advantage | Tech stack |
|---|---|---|
| MkDocs | Extreme simplicity and fast configuration. | Python |
| Docusaurus | Robust portals with React component support (MDX). | Node.js |

## 2. Repository Structure (GitHub)

Maintain the following folder organization to ensure the automation scripts work correctly:

```text
.github/workflows/        # CI/CD Deployment automation
docs/                     # Root folder for all .md files
  index.md                # Documentation Home page
  setup-guide/            # Subfolders for thematic organization
  assets/                 # Images, diagrams, and screenshots
mkdocs.yml                # Configuration (if using MkDocs)
docusaurus.config.js      # Configuration (if using Docusaurus)
```

## 3. Automated Workflow

The goal is to have the HTML generated without manual intervention. Developers only need to focus on the content.

1. **Editing:** The contributor creates/edits the `.md` file locally or via the GitHub interface.
2. **Pull Request:** Changes are submitted for peer review.
3. **Build & Deploy:** Once merged into the `main` branch, GitHub Actions compiles the Markdown and publishes the site to GitHub Pages.

## 4. Automation Pipeline (CI/CD)

Create a file at `.github/workflows/deploy.yml` to automate the process (example using MkDocs):

```yaml
name: Publish Documentation

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: 3.x

      - name: Install MkDocs Material
        run: pip install mkdocs-material

      - name: Build and Deploy to GitHub Pages
        run: mkdocs gh-deploy --force
```

## 5. Writing Standards & Readability

### Code blocks

Always declare the language to enable syntax highlighting:

```js
// Example of formatted code
const config = {
  host: "localhost",
  port: 5432,
};
```

> **Warning**: Never include passwords, secrets, or access tokens directly in Markdown files.

### Reference tables

| Field | Type | Required |
|---|---|---|
| user_id | UUID | Yes |
| last_login | Timestamp | No |

## 6. Conclusion & Next Steps

1. Pick your tool: Start with MkDocs if you need to get up and running quickly.
2. Create the `/docs` folder: Place your first `index.md` file there.
3. Configure the workflow: Add the GitHub Action file mentioned in Section 4.
4. Enable Pages: Under **Settings → Pages** on GitHub, point the source to the `gh-pages` branch.
