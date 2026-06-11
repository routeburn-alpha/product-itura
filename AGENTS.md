# Agent Notes

- use git and gh outside the sandbox
- keep green:
  ```
  # from app/
  npm ci
  npm run check
  npm run build
  npm test
  ```
- always manually smoke test the app before pushing
  - look for functional as well as visual quality
- follow docs/design-system.md
- Keep at most one local dev server running per worktree.
- Do not leave extra dev servers running after verification. Stop any server you started unless the user
  explicitly asks to keep it running.
