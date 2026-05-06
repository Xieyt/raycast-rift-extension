import { Action, ActionPanel, List, getPreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { useEffect, useMemo } from "react";
import { getAllWindows, focusWindow, checkRiftInstalled, type WindowWithWorkspace } from "./utils/rift";

interface Preferences {
  showWindowTitlesFirst: boolean;
}

export default function Command() {
  const [windows, setWindows] = useCachedState<WindowWithWorkspace[]>("windows-all", []);
  const [isLoading, setIsLoading] = useCachedState<boolean>("loading-all", true);
  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    async function loadWindows() {
      const isInstalled = await checkRiftInstalled();
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }

      const fetchedWindows = await getAllWindows();
      setWindows(fetchedWindows);
      setIsLoading(false);
    }

    loadWindows();
  }, []);

  const groupedByWorkspace = useMemo(() => {
    const groups: Record<string, WindowWithWorkspace[]> = {};
    for (const window of windows) {
      const key = window.workspace_name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(window);
    }
    return groups;
  }, [windows]);

  return (
    <List isLoading={isLoading} navigationTitle="All Windows" searchBarPlaceholder="Search windows...">
      {Object.entries(groupedByWorkspace).map(([workspaceName, windowList]) => (
        <List.Section key={workspaceName} title={`Workspace: ${workspaceName}`}>
          {windowList.map((window: WindowWithWorkspace) => {
            const windowTitle = window.title || "";
            const appName = window.app_name;

            const title = preferences.showWindowTitlesFirst ? windowTitle || appName : appName;
            const subtitle = preferences.showWindowTitlesFirst ? appName : windowTitle;

            const titleTokens = windowTitle.split(/[\s\-_|:]+/).filter((token: string) => token.length > 0);
            const appTokens = appName.split(/[\s\-_]+/).filter((token: string) => token.length > 0);
            const keywords = [...appTokens, ...titleTokens, appName, windowTitle];

            return (
              <List.Item
                key={window.window_server_id}
                title={title}
                subtitle={subtitle}
                icon={window.app_path ? { fileIcon: window.app_path } : undefined}
                keywords={keywords}
                accessories={[{ text: window.is_focused ? "●" : "" }]}
                actions={
                  <ActionPanel>
                    <Action
                      title="Focus Window"
                      onAction={() => {
                        focusWindow(window.window_server_id, window);
                      }}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}
