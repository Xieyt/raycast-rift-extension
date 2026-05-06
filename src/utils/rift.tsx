import { popToRoot, closeMainWindow, showToast, Toast } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { spawnSync } from "child_process";
import { shellEnvSync } from "shell-env";

// ============================================================================
// Type Definitions
// ============================================================================

export interface RiftWindow {
  app_name: string;
  bundle_id: string;
  title: string;
  window_server_id: number;
  id: { idx: number; pid: number };
  is_floating: boolean;
  is_focused: boolean;
  frame: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
}

export interface RiftWorkspace {
  id: string;
  index: number;
  is_active: boolean;
  layout_mode: string;
  name: string;
  window_count: number;
  windows: RiftWindow[];
}

export interface WindowWithWorkspace extends RiftWindow {
  workspace_name: string;
  workspace_index: number;
  app_path?: string; // Added by getAppPath()
}

// ============================================================================
// Environment & Path Resolution
// ============================================================================

let cachedEnv: Record<string, string> | null = null;

/**
 * Get shell environment (fixes PATH issues when Raycast launches extension)
 * Raycast doesn't inherit your shell's PATH, so we need to load it explicitly
 */
function env(): Record<string, string> {
  if (cachedEnv) {
    return cachedEnv;
  }
  cachedEnv = shellEnvSync();
  return cachedEnv;
}

// ============================================================================
// CLI Execution Helpers
// ============================================================================

/**
 * Execute rift-cli command and return stdout
 * Throws if command fails or times out
 */
function execRiftCli(args: string[], timeoutMs = 15000): string {
  const result = spawnSync("rift-cli", args, {
    env: env(),
    encoding: "utf8",
    timeout: timeoutMs,
  });

  if (result.error) {
    throw new Error(`Failed to execute rift-cli: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`rift-cli exited with code ${result.status}: ${result.stderr}`);
  }

  return result.stdout;
}

// ============================================================================
// App Icon Resolution (macOS Spotlight)
// ============================================================================

/**
 * Get app path for bundle ID (used to display app icons in Raycast)
 * Uses macOS Spotlight (mdfind) to locate .app bundles
 */
async function getAppPath(bundleId: string): Promise<string | undefined> {
  try {
    const result = spawnSync("mdfind", [`kMDItemCFBundleIdentifier="${bundleId}"`], {
      env: env(),
      encoding: "utf8",
      timeout: 5000,
    });

    const path = result.stdout.trim().split("\n")[0]; // Take first match
    return path || undefined;
  } catch (error) {
    console.error(`Failed to find app path for ${bundleId}:`, error);
    return undefined;
  }
}

// ============================================================================
// Core Query Functions
// ============================================================================

/**
 * Get all workspaces with their windows
 */
export async function getWorkspaces(): Promise<RiftWorkspace[]> {
  try {
    const output = execRiftCli(["query", "workspaces"]);
    const workspaces: RiftWorkspace[] = JSON.parse(output);
    return workspaces;
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to get workspaces",
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Get windows from focused workspace only
 */
export async function getWindowsInFocusedWorkspace(): Promise<WindowWithWorkspace[]> {
  const workspaces = await getWorkspaces();
  const focusedWorkspace = workspaces.find((ws) => ws.is_active);

  if (!focusedWorkspace) {
    return [];
  }

  // Enhance windows with workspace metadata and app paths
  const enhancedWindows = await Promise.all(
    focusedWorkspace.windows.map(async (window) => ({
      ...window,
      workspace_name: focusedWorkspace.name,
      workspace_index: focusedWorkspace.index,
      app_path: await getAppPath(window.bundle_id),
    }))
  );

  return enhancedWindows;
}

/**
 * Get windows from all workspaces (flat list)
 */
export async function getAllWindows(): Promise<WindowWithWorkspace[]> {
  const workspaces = await getWorkspaces();

  const allWindows: WindowWithWorkspace[] = [];

  for (const workspace of workspaces) {
    for (const window of workspace.windows) {
      allWindows.push({
        ...window,
        workspace_name: workspace.name,
        workspace_index: workspace.index,
        app_path: await getAppPath(window.bundle_id),
      });
    }
  }

  return allWindows;
}

// ============================================================================
// Window Actions
// ============================================================================

export async function focusWindow(windowServerId: number, window: WindowWithWorkspace): Promise<void> {
  try {
    const script = `
      tell application "System Events"
        set targetProcess to first process whose unix id is ${window.id.pid}
        set frontmost of targetProcess to true
        
        tell targetProcess
          repeat with w in windows
            if name of w is "${window.title.replace(/"/g, '\\"')}" then
              perform action "AXRaise" of w
              exit repeat
            end if
          end repeat
        end tell
      end tell
    `;

    await runAppleScript(script);

    await popToRoot({ clearSearchBar: true });
    await closeMainWindow({ clearRootSearch: true });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to focus window",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function goToWorkspace(workspaceIndex: number): Promise<void> {
  try {
    execRiftCli(["execute", "workspace", "switch", String(workspaceIndex)]);
    await popToRoot({ clearSearchBar: true });
    await closeMainWindow({ clearRootSearch: true });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to switch workspace",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if Rift is installed and accessible
 */
export async function checkRiftInstalled(): Promise<boolean> {
  try {
    execRiftCli(["--help"], 2000);
    return true;
  } catch {
    await showToast({
      style: Toast.Style.Failure,
      title: "Rift not found",
      message: "Make sure Rift window manager is installed and rift-cli is in your PATH",
    });
    return false;
  }
}
