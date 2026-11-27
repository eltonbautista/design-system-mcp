#!/bin/sh
# Reproducible demo run: same starter, same prompt, same model. The only difference is the MCP server.
#   demo/run.sh without [n] [prompt]   Claude Code with no MCP servers (the package is still installed in node_modules)
#   demo/run.sh with [n] [prompt]      Claude Code with only the Cabinet MCP server
# n = trial number (default 1); prompt = v2 (PROMPT.md, default) or v1 (PROMPT-v1.md).
set -eu
MODE="${1:?usage: demo/run.sh with|without [n] [v1|v2]}"
TRIAL="${2:-1}"
PROMPT_VERSION="${3:-v2}"
MODEL="${DEMO_MODEL:-claude-sonnet-5-5}"
HERE="$(cd "$(dirname "$0")" && pwd)"
RUN="$HERE/runs/${DEMO_RUNSET:-$PROMPT_VERSION}/$MODE-$TRIAL"
PROMPT_FILE="$HERE/PROMPT.md"
[ "$PROMPT_VERSION" = v1 ] && PROMPT_FILE="$HERE/PROMPT-v1.md"

rm -rf "$RUN" && mkdir -p "$RUN"
cp -R "$HERE/starter/." "$RUN/"
(cd "$RUN" && npm install --no-audit --no-fund > install.log 2>&1)

case "$MODE" in
  with)    MCP_FLAGS="--mcp-config $HERE/mcp.json --strict-mcp-config" ;;
  without) MCP_FLAGS="--strict-mcp-config" ;;
  *) echo "mode must be with or without" >&2; exit 2 ;;
esac

cd "$RUN"
# shellcheck disable=SC2086
# --setting-sources project: no user-level settings, so none of the operator's plugins, skills, hooks
# or permission rules load. Both arms get stock Claude Code plus (for "with") the Cabinet MCP server.
claude -p "$(cat "$PROMPT_FILE")" \
  --setting-sources project \
  --model "$MODEL" \
  --output-format stream-json --verbose \
  --permission-mode acceptEdits \
  --allowedTools "Read,Edit,Write,Glob,Grep,Bash(npm run build),mcp__cabinet__list_components,mcp__cabinet__get_component,mcp__cabinet__get_tokens,mcp__cabinet__get_usage_example" \
  $MCP_FLAGS < /dev/null > transcript.jsonl

cd "$HERE/.." && npx tsx demo/redact.ts "$RUN/transcript.jsonl"

npx tsx demo/score.ts "$RUN"
