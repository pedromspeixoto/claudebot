# Claude GitHub Workflows Setup

This guide explains how to configure the Claude issue reviewer and PR reviewer workflows in your GitHub repository.

## Prerequisites

- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

## 1. Add the Repository Secret

1. Go to **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Add the following secret:

| Secret Name         | Value                  |
| ------------------- | ---------------------- |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

## 2. Configure Workflow Permissions

1. Go to **Settings > Actions > General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**

## 3. Create Caller Workflows

The reusable workflows (`claude_issue_reviewer.yml` and `claude_pr_reviewer.yml`) need caller workflows to trigger them. Create the following files in your repository:

### Issue Reviewer Caller

`.github/workflows/claude_on_issue.yml`

```yaml
name: Claude on Issue
on:
  issues:
    types: [opened, edited]
  issue_comment:
    types: [created]

jobs:
  claude-issue:
    uses: ./.github/workflows/claude_issue_reviewer.yml
    secrets:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### PR Reviewer Caller

`.github/workflows/claude_on_pr.yml`

```yaml
name: Claude on PR
on:
  pull_request:
    types: [opened, synchronize]
  pull_request_review:
    types: [submitted]
  pull_request_review_comment:
    types: [created]
  issue_comment:
    types: [created]

jobs:
  claude-pr:
    uses: ./.github/workflows/claude_pr_reviewer.yml
    secrets:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

You can override the default inputs if needed:

```yaml
jobs:
  claude-pr:
    uses: ./.github/workflows/claude_pr_reviewer.yml
    with:
      model: 'claude-sonnet-4-5-20250929'
      max_turns: '10'
      prompt: 'Your custom review prompt here.'
    secrets:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Usage

Once configured, mention **`@claude`** in any of the following to trigger the workflows:

| Context                      | Triggers              |
| ---------------------------- | --------------------- |
| Issue title or body          | Issue Reviewer        |
| Issue comment                | Issue Reviewer        |
| PR title or body             | PR Reviewer           |
| PR review                    | PR Reviewer           |
| PR review comment            | PR Reviewer           |
| PR issue comment             | PR Reviewer           |

Claude will analyze the issue or review the PR and respond directly in the GitHub thread. For issues, it may also create a pull request with a suggested fix.
