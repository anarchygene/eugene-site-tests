# eugene-site-tests: functional tests for eugene-site
Use Playwright with TypeScript. Tests run against the live URL supplied through
the BASE_URL environment variable.

## Role
- You are the checker. Never edit the site.
- Write tests only from SPEC.md and supplied GitHub issue text.
- Do not clone, fetch, inspect, or infer from the site's source repository.
- Each test checks one stated requirement and identifies the relevant SPEC.md line.
- If the specification is ambiguous, report the ambiguity instead of silently
  inventing behavior.
- Run Chromium only.
- Keep selectors based on specified user-visible behavior, roles, labels, or
  required IDs—not implementation details.
