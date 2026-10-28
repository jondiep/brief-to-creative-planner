# GitHub Integration Setup

`opencode github install` is a **V1 CLI command**. This machine runs OpenCode **v2.2.0**, whose CLI has no `github` subcommand. The GitHub integration is therefore set up manually with a GitHub Actions workflow.

## What is already done

- Created `.github/workflows/opencode.yml`
- Configured it to trigger on issue comments and PR review comments containing `/oc` or `/opencode`
- Configured it to use `GITHUB_TOKEN` (no OpenCode GitHub App install required)
- Selected the model `opencode/big-pickle`
- Initialized this folder as a local Git repository

## Remaining steps

1. Create an empty GitHub repository, then connect and push:

   ```bash
   cd "Agency Brief-to-Creative Planner - Portfolio Demo"
   git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

   Use the HTTPS URL instead if you prefer:
   `https://github.com/YOUR_USER/YOUR_REPO.git`

2. Create an OpenCode API key:
   - Sign in at https://opencode.ai/console
   - Create a personal or service-account API key (`oc_sk_...`)
   - For CI, a service account key is preferable.

3. Add the key as a repository secret:
   - GitHub repo → **Settings → Secrets and variables → Actions**
   - New repository secret: `OPENCODE_API_KEY`
   - Value: the `oc_sk_...` key

4. Test it:
   - Open an issue and comment `/oc explain this repository`
   - Or comment `/oc` on a pull request
   - Check the **Actions** tab for the run and logs

## Notes and limits

- `use_github_token: true` means the workflow relies on the repository's `GITHUB_TOKEN`. This is simplest, but pull requests from forks get a read-only token and **no secrets**, so OpenCode cannot run there.
- The workflow grants `contents: write`, `pull-requests: write`, and `issues: write` so OpenCode can branch, commit, and comment.
- To use the OpenCode GitHub App with OIDC instead, replace the Run step with the OIDC configuration from https://opencode.ai/docs/github/ and remove `use_github_token`.
- If you prefer a different model, change `model: opencode/big-pickle` and set the matching provider key as a secret.
- The repository and its history contain only fictional demo content, but review the 5 MB demo video before pushing if repository size matters.
