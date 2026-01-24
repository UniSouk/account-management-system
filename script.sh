#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi


PROMPT='prd.json progress.txt
1. Find the highest-priority feature to work on and work only on that feature.
This should be the one YOU decide has the highest priority - not necessarily the first item in the list.
2. Check that the types check via pnpm typecheck and that the tests pass via pnpm test.
3. Update the PRD with the work that was done.
4. Append your progress to the progress.txt file.
Use this to leave a note for the next person working in the codebase.
5. Make a git commit of that feature.
ONLY WORK ON A SINGLE FEATURE.
If, while implementing the feature, you notice the PRD is complete, output <promise>COMPLETE</promise>.'

WORKSPACE="${2:-$(pwd)}"

for ((i=1; i<=$1; i++)); do
  echo "=== Iteration $i ==="
  
  result=$(docker run --rm \
    -v kiro-data:/home/agent/.local/share/kiro-cli \
    -v "$WORKSPACE":/home/agent/workspace \
    kiro-cli-sandbox \
    /bin/bash -c "kiro-cli chat --no-interactive --trust-all-tools \"$PROMPT\"" 2>&1)
  
  echo "$result"
  
  if echo "$result" | grep -q "<promise>COMPLETE</promise>"; then
    echo "PRD complete after $i iterations."
    exit 0
  fi
done

echo "Completed $1 iterations without PRD completion."
exit 0