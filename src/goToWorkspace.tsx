import { Action, ActionPanel, List, Icon } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { useEffect } from "react";
import { getWorkspaces, goToWorkspace, checkRiftInstalled, type RiftWorkspace } from "./utils/rift";

export default function Command() {
  const [workspaces, setWorkspaces] = useCachedState<RiftWorkspace[]>("workspaces", []);
  const [isLoading, setIsLoading] = useCachedState<boolean>("loading-workspaces", true);

  useEffect(() => {
    async function loadWorkspaces() {
      const isInstalled = await checkRiftInstalled();
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }

      const fetchedWorkspaces = await getWorkspaces();
      setWorkspaces(fetchedWorkspaces);
      setIsLoading(false);
    }

    loadWorkspaces();
  }, []);

  return (
    <List isLoading={isLoading} navigationTitle="Go to Workspace" searchBarPlaceholder="Search workspaces...">
      {workspaces.map((workspace) => (
        <List.Item
          key={workspace.id}
          title={workspace.name}
          subtitle={`${workspace.window_count} windows`}
          icon={workspace.is_active ? Icon.Checkmark : Icon.Circle}
          accessories={[{ text: `${workspace.index + 1}` }, { text: workspace.layout_mode }]}
          actions={
            <ActionPanel>
              <Action
                title="Go to Workspace"
                onAction={() => {
                  goToWorkspace(workspace.index);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
