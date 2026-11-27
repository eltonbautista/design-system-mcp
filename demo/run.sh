#!/bin/sh
# Reproducible demo run: same starter, same prompt, same model. The only difference is the MCP server.
#   demo/run.sh without     Claude Code with no MCP servers (the package is still installed in node_modules)
#   demo/run.sh with        Claude Code with only the Cabinet MCP server
set -eu
MODE="${1:?usage: demo/run.sh with|without}"
MODEL="${DEMO_MODEL:-claude-sonnet-5-5}"
HERE="$(cd "$(dirname "$0")" && pwd)"
RUN="$HERE/runs/$MODE"

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
claude -p "$(cat "$HERE/PROMPT.md")" \
  --model "$MODEL" \
  --output-format stream-json --verbose \
  --permission-mode acceptEdits \
  --allowedTools "Read,Edit,Write,Glob,Grep,Bash(npm run build),mcp__cabinet__list_components,mcp__cabinet__get_component,mcp__cabinet__get_tokens,mcp__cabinet__get_usage_example" \
  $MCP_FLAGS > transcript.jsonl

cd "$HERE/.." && npx tsx demo/score.ts "$RUN"
