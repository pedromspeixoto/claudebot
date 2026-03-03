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

    # --- Extract stack trace ---
    stacktrace_text = ""
    # Sentry sends exception data in event.exception.values
    exception_info = event.get("exception", {})
    exc_values = exception_info.get("values", [])
    # Fallback: some payloads nest it under event.entries
    if not exc_values:
        for entry in event.get("entries", []):
            if entry.get("type") == "exception":
                exc_values = entry.get("data", {}).get("values", [])
                break

    for exc in exc_values:
        exc_type = exc.get("type", "Exception")
        exc_value = exc.get("value", "")
        frames = exc.get("stacktrace", {}).get("frames", [])

        lines = [f"**{exc_type}: {exc_value}**", "", "```"]
        for frame in frames:
            filename = frame.get("filename") or frame.get("abs_path", "?")
            lineno = frame.get("lineno", "?")
            func = frame.get("function", "?")
            lines.append(f"  File \"{filename}\", line {lineno}, in {func}")
            context_line = frame.get("context_line")
            if context_line:
                lines.append(f"    {context_line.strip()}")
        lines.append("```")
        stacktrace_text += "\n".join(lines) + "\n"

    # --- Extract request info (if available) ---
    request_text = ""
    request_info = event.get("request", {})
    if not request_info:
        for entry in event.get("entries", []):
            if entry.get("type") == "request":
                request_info = entry.get("data", {})
                break
    if request_info:
        method = request_info.get("method", "")
        url = request_info.get("url", "")
        if method and url:
            request_text = f"**Request**: `{method} {url}`\n"

    # --- Extract tags ---
    tags_text = ""
    tags = event.get("tags", [])
    if tags:
        tag_items = []
        for tag in tags:
            if isinstance(tag, dict):
                tag_items.append(f"`{tag.get('key', '')}:{tag.get('value', '')}`")
            elif isinstance(tag, (list, tuple)) and len(tag) >= 2:
                tag_items.append(f"`{tag[0]}:{tag[1]}`")
        if tag_items:
            tags_text = "**Tags**: " + ", ".join(tag_items) + "\n"

    # --- Build issue body ---
    body_parts = [
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
    ]

    if request_text:
        body_parts += [request_text, ""]

    if tags_text:
        body_parts += [tags_text, ""]

    if stacktrace_text:
        body_parts += ["## Stack Trace", "", stacktrace_text, ""]

    body_parts += [
        "---",
        "@claude Analyze this Sentry error. Identify the root cause from the stack trace, find the relevant code in the repository, and create a pull request with a fix.",
    ]

    body = "\n".join(body_parts)

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
