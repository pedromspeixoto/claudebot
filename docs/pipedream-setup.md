# Pipedream Setup — Sentry to GitHub Issues

This guide explains how to set up [Pipedream](https://pipedream.com) as a bridge between Sentry and GitHub, so that new Sentry errors automatically create GitHub issues — which then trigger Claude to analyze and fix them.

## Why Pipedream?

Sentry's built-in GitHub issue creation requires a paid plan (Team or above). Pipedream acts as a free, serverless intermediary that receives Sentry webhooks and creates GitHub issues via the API — no server or deployment needed.

## Flow

```
Sentry error → Sentry webhook → Pipedream → GitHub Issues API → Issue created → Claude on Issue workflow → Analysis & fix PR
```

## Prerequisites

- A [Pipedream](https://pipedream.com) account (free tier — 100 invocations/day)
- A **GitHub Personal Access Token** with `repo` scope ([create one here](https://github.com/settings/tokens))
- A Sentry organization with at least one project configured

## Step 1 — Create a Pipedream Workflow

1. Log in to [pipedream.com](https://pipedream.com)
2. Click **New Workflow**
3. Choose **HTTP / Webhook** as the trigger
4. Select **HTTP Requests** → **New Requests**
5. Pipedream will generate a unique webhook URL (e.g., `https://eo...m.pipedream.net`). Copy this URL — you'll need it for Sentry

## Step 2 — Add the GitHub Issue Creation Step

1. Click **+** to add a step after the trigger
2. Choose **Run custom code** (Python)
3. Paste the following code:

```python
import requests

def handler(pd: "pipedream"):
    owner = "<YOUR_GITHUB_ORG_OR_USER>"
    repo = "<YOUR_REPO_NAME>"
    token = pd.inputs["env"]["GITHUB_PAT"]

    payload = pd.steps["trigger"]["event"]["body"]
    data = payload.get("data", {})
    event = data.get("event", {})
    rule = data.get("triggered_rule", "N/A")
    title = event.get("title", "Unknown Sentry Error")
    culprit = event.get("culprit", "N/A")
    level = event.get("level", "error")
    environment = event.get("environment", "N/A")
    event_id = event.get("event_id", "")
    timestamp = event.get("datetime", "N/A")
    platform = event.get("platform", "N/A")
    web_url = event.get("web_url", "")

    body = "\n".join([
        "## Sentry Error",
        "",
        "| Field | Value |",
        "| ----- | ----- |",
        f"| **Level** | `{level}` |",
        f"| **Platform** | `{platform}` |",
        f"| **Environment** | `{environment}` |",
        f"| **Culprit** | `{culprit}` |",
        f"| **Timestamp** | {timestamp} |",
        f"| **Alert Rule** | {rule} |",
        f"| **Event ID** | `{event_id}` |",
        f"| **Sentry Link** | [View in Sentry]({web_url}) |",
        "",
        "---",
        "*Automatically created via Sentry + Pipedream integration.*",
    ])

    response = requests.post(
        f"https://api.github.com/repos/{owner}/{repo}/issues",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
        },
        json={
            "title": f"[Sentry] {title}",
            "body": body,
            "labels": ["sentry"],
        },
    )
    response.raise_for_status()

    return response.json()
```

4. Replace `<YOUR_GITHUB_ORG_OR_USER>` and `<YOUR_REPO_NAME>` with your repository details

5. Store the GitHub token securely:
   - Go to **Settings > Environment Variables** in Pipedream
   - Add `GITHUB_PAT` with your token value
   - The code above references it via `pd.inputs["env"]["GITHUB_PAT"]`

### Creating the GitHub Token

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta) (Fine-grained tokens)
2. Click **Generate new token**
3. Configure:
   - **Token name**: `Pipedream Sentry Bridge`
   - **Expiration**: choose a duration (or no expiration)
   - **Repository access**: Select **Only select repositories** → pick your repo
   - **Permissions**: Under **Repository permissions**, set **Issues** to **Read and write**
4. Click **Generate token** and copy the value
5. Paste it into the Pipedream `GITHUB_PAT` environment variable (see above)

## Step 3 — Configure Sentry Webhook

### Create an Internal Integration

1. In Sentry, go to **Settings > Developer Settings**
2. Click **Create New Integration** → **Internal Integration**
3. Configure:
   - **Name**: `Pipedream GitHub Bridge`
   - **Webhook URL**: Paste the Pipedream webhook URL from Step 1
   - **Permissions**: No special permissions needed
   - **Webhooks**: Check **issue** (to fire when new issues are created)
4. Click **Save**

### Create an Alert Rule

1. Go to **Alerts > Create Alert Rule**
2. Choose **Issue Alert**
3. Set conditions — e.g., "A new issue is created"
4. Under **Actions**, select **Send a notification via an integration** → pick the `Pipedream GitHub Bridge` integration
5. Save the alert rule

## Step 4 — Deploy and Test

1. In Pipedream, click **Deploy** to activate the workflow
2. Trigger a test error in your application
3. Verify:
   - **Pipedream**: Check the Event Inspector for the incoming Sentry webhook
   - **GitHub Issues**: A new issue with `[Sentry]` prefix should appear
   - **GitHub Actions**: The `Claude on Issue` workflow should trigger and Claude should comment on the issue with analysis

## Security Notes

- **Never commit your GitHub PAT** to source code — use Pipedream environment variables
- Use a **fine-grained PAT** scoped to only the target repository with `issues: write` permission when possible
- The Pipedream webhook URL is secret — only paste it into Sentry's integration settings

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| Pipedream not receiving events | Verify the webhook URL in Sentry's Internal Integration settings |
| Issue not created on GitHub | Check Pipedream logs for errors; verify the PAT has `repo` scope |
| Claude not responding to issue | Ensure `claude_on_issue.yml` is on the default branch and `ANTHROPIC_API_KEY` secret is set |
| `sentry` label error | Create the `sentry` label in your repo first, or remove the `labels` field from the code |
