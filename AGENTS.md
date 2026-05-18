<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Testing Guidance

Agents may create focused tests, test files, or test scripts when they materially improve verification. Keep them scoped to the current change and avoid throwaway/demo test pages. After adding tests, run the relevant repo gates such as `bun run lint`, `bun run typecheck`, `bun run build`, and the new or affected test command.
