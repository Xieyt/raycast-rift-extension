# Rift Window Manager — Raycast Extension

Window switching and workspace management for [Rift](https://github.com/rift-wm/rift) via Raycast.

## Commands

| Command | Default Hotkey | Description |
|---|---|---|
| Switch Windows in Focused Workspace | Hyper+O | Switch between windows in the active workspace |
| Switch Windows in All Workspaces | Hyper+P | Search and switch to any window across all workspaces |
| Go to Workspace | — | Navigate between workspaces |

## Prerequisites

- [Raycast](https://raycast.com)
- [Rift window manager](https://github.com/rift-wm/rift) running with `rift-cli` in PATH

## Installation

```bash
# Install dependencies
npm install

# Start development mode (hot reload)
npm run dev
```

Raycast will detect the extension automatically in dev mode.

## Hotkeys

1. Open Raycast Preferences (`⌘,`) → **Extensions → Rift Window Manager**
2. Assign hotkeys to each command

Recommended:
- **Switch Windows (Focused)** → `⌃⌥⌘⇧O`
- **Switch Windows (All)** → `⌃⌥⌘⇧P`

## Preferences

**Show Window Titles First** — Display window title (document name, browser tab) as the primary field instead of app name. Available per command.

## Troubleshooting

**`rift-cli: command not found`**

The extension loads your shell PATH via `shell-env`. If `rift-cli` still isn't found:

```bash
which rift-cli          # Confirm it's accessible in terminal
# Then restart Raycast
```

**Windows not showing**

```bash
rift-cli query workspaces   # Should return JSON with windows array
```

**Window focus not working**

Focusing uses AppleScript — ensure Raycast has Accessibility permissions:  
**System Settings → Privacy & Security → Accessibility → Raycast ✓**

**App icons missing**

Icons resolve via macOS Spotlight. If an app isn't Spotlight-indexed, its icon won't appear — functionality is unaffected.

## Development

```bash
npm run dev        # Development mode with hot reload
npm run build      # Production build
npm run lint       # Lint check
npm run fix-lint   # Auto-fix lint errors
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for internals and [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) to contribute.

## License

MIT
