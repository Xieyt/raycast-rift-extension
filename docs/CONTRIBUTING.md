# Contributing

## Setup

```bash
npm install
npm run dev   # Starts Raycast in dev mode with hot reload
```

Raycast picks up the extension automatically when `npm run dev` is running. Changes to `src/` trigger an auto-rebuild.

## Code Style

- TypeScript strict mode — no `any`, no type suppressions (`@ts-ignore`, `@ts-expect-error`)
- Prettier for formatting (config in `.prettierrc`)
- ESLint via `@raycast/eslint-config`

Run before committing:

```bash
npm run lint       # Check
npm run fix-lint   # Auto-fix
```

## Making Changes

**Adding a new command:**
1. Create `src/<commandName>.tsx`
2. Register it in `package.json` under `commands`
3. Follow the pattern in existing commands — `useCachedState` for data, `List` for UI

**Changing Rift CLI integration:**
- All CLI calls live in `src/utils/rift.tsx`
- Keep data fetching out of components — components only call utils functions

**Changing window focus behavior:**
- The AppleScript path is in `focusWindow()` inside `src/utils/rift.tsx`
- Test manually with `osascript` before changing it

## Testing

There are no automated tests (Raycast extensions are GUI-only). Manual testing steps:

1. `npm run dev`
2. In Raycast, search for each command and verify it renders
3. Select a window / workspace and confirm the action fires correctly
4. Check Raycast's dev console (`⌘⌥⇧I`) for errors

## Submitting Changes

1. Fork the repo
2. Make your changes on a feature branch
3. Ensure `npm run lint` and `npm run build` pass cleanly
4. Open a PR with a clear description of what changed and why
