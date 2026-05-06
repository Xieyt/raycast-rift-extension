# Architecture

## Overview

The extension is a thin Raycast UI layer over `rift-cli`. It has no native bindings — all Rift state is read and mutated via CLI subprocess calls.

```
src/
├── switchWindowsFocused.tsx   # Command: windows in active workspace only
├── switchWindowsAll.tsx       # Command: all windows grouped by workspace
├── goToWorkspace.tsx          # Command: workspace switcher
└── utils/
    └── rift.tsx               # All rift-cli communication
```

## Data Flow

```
Raycast command renders
  → useCachedState() returns stale data immediately (instant UI)
  → queryWorkspaces() / queryWindows() spawns rift-cli subprocess
  → JSON parsed into typed structs
  → React state updated, list re-renders with fresh data
```

## `utils/rift.tsx`

Central module for all Rift integration. Exports:

| Function | CLI Command | Description |
|---|---|---|
| `queryWorkspaces()` | `rift-cli query workspaces` | Returns all workspaces with their windows |
| `queryWindows()` | `rift-cli query windows` | Returns flat list of all windows |
| `focusWindow(window)` | AppleScript | Activates app by PID, raises window by title |
| `gotoWorkspace(index)` | `rift-cli execute workspace switch <n>` | Switches to workspace by numeric index |

All CLI calls use `child_process.spawnSync` with the shell PATH loaded via `shell-env` (needed because Raycast doesn't inherit the user's shell PATH by default).

## Window Focusing

`rift-cli` has no focus-by-ID command — it only supports directional focus (`focus <direction>`). Window focusing is implemented via AppleScript:

1. Activate the app process by PID (`set frontmost of targetProcess to true`)
2. Raise the specific window by matching its title (`perform action "AXRaise"`)

This requires Raycast to have **Accessibility** permission in System Settings.

## Caching

`useCachedState` (from `@raycast/utils`) is used in all commands. It persists the last-known window/workspace list to disk and returns it synchronously on next launch, eliminating the blank loading state. Fresh data is fetched in parallel and merged once ready.

## Key Constraints

- **rift-cli in PATH**: The extension spawns `rift-cli` directly. If it's not in PATH, all queries fail. `shell-env` is used to load the user's shell PATH at runtime.
- **Accessibility permission**: Required for the AppleScript window focus mechanism.
- **macOS only**: Both Rift and the AppleScript approach are macOS-specific.
- **No native bindings**: Everything goes through CLI — no IPC, no native modules.
