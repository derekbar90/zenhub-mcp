import { BaseTool } from "./base.js";
class CreateSprintTool extends BaseTool {
    name = "zenhub_create_sprint";
    description = "Create a new sprint";
    inputSchema = {
        type: "object",
        properties: {
            name: { type: "string", description: "Sprint name" },
            start_date: { type: "string", description: "Start date (ISO format)" },
            end_date: { type: "string", description: "End date (ISO format)" },
            timezone: { type: "string", description: "Timezone identifier" },
            workspace_id: { type: "string", description: "Workspace ID" },
            settings: {
                type: "object",
                properties: {
                    pipeline_id: { type: "string" },
                    total_story_points: { type: "number" },
                    move_unfinished_issues: { type: "boolean" },
                },
            },
        },
        required: ["name", "start_date", "end_date", "workspace_id"],
    };
    async handle(args, client) {
        const { name, start_date, end_date, timezone = "UTC", workspace_id, settings = {} } = args;
        const mutation = `
      mutation createSprintConfig($input: CreateSprintConfigInput!) {
        createSprintConfig(input: $input) {
          sprintConfig {
            id
            name
          }
        }
      }
    `;
        const sprintSettings = {
            moveUnfinishedIssues: settings.move_unfinished_issues || false,
        };
        if (settings.pipeline_id) {
            sprintSettings.issuesFromPipeline = {
                pipelineId: settings.pipeline_id,
                enabled: true,
                totalStoryPoints: settings.total_story_points || 0,
            };
        }
        const variables = {
            input: {
                sprintConfig: {
                    name,
                    startOn: start_date,
                    endOn: end_date,
                    tzIdentifier: timezone,
                    workspaceId: workspace_id,
                    settings: sprintSettings,
                },
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class UpdateSprintTool extends BaseTool {
    name = "zenhub_update_sprint";
    description = "Update an existing sprint";
    inputSchema = {
        type: "object",
        properties: {
            sprint_id: { type: "string", description: "Sprint ID" },
            name: { type: "string", description: "Sprint name" },
            start_date: { type: "string", description: "Start date (ISO format)" },
            end_date: { type: "string", description: "End date (ISO format)" },
            state: { type: "string", enum: ["OPEN", "CLOSED"], description: "Sprint state" },
        },
        required: ["sprint_id"],
    };
    async handle(args, client) {
        const { sprint_id, name, start_date, end_date, state } = args;
        const mutation = `
      mutation updateSprint($input: UpdateSprintInput!) {
        updateSprint(input: $input) {
          sprint {
            id
            name
            startOn
            endOn
            state
          }
        }
      }
    `;
        const variables = {
            input: {
                id: sprint_id,
                ...(name && { name }),
                ...(start_date && { startOn: start_date }),
                ...(end_date && { endOn: end_date }),
                ...(state && { state }),
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class AddIssuesToSprintsTool extends BaseTool {
    name = "zenhub_add_issues_to_sprints";
    description = "Add issues to sprints";
    inputSchema = {
        type: "object",
        properties: {
            issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
            sprint_ids: { type: "array", items: { type: "string" }, description: "Array of sprint IDs" },
        },
        required: ["issue_ids", "sprint_ids"],
    };
    async handle(args, client) {
        const { issue_ids, sprint_ids } = args;
        const mutation = `
      mutation addIssuesToSprints($input: AddIssuesToSprintsInput!) {
        addIssuesToSprints(input: $input) {
          sprintIssues {
            id
          }
        }
      }
    `;
        const variables = {
            input: {
                issueIds: issue_ids,
                sprintIds: sprint_ids,
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class RemoveIssuesFromSprintsTool extends BaseTool {
    name = "zenhub_remove_issues_from_sprints";
    description = "Remove issues from sprints";
    inputSchema = {
        type: "object",
        properties: {
            issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
            sprint_ids: { type: "array", items: { type: "string" }, description: "Array of sprint IDs" },
        },
        required: ["issue_ids", "sprint_ids"],
    };
    async handle(args, client) {
        const { issue_ids, sprint_ids } = args;
        const mutation = `
      mutation removeIssuesFromSprints($input: RemoveIssuesFromSprintsInput!) {
        removeIssuesFromSprints(input: $input) {
          successCount
        }
      }
    `;
        const variables = {
            input: {
                issueIds: issue_ids,
                sprintIds: sprint_ids,
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class DeleteSprintTool extends BaseTool {
    name = "zenhub_delete_sprint";
    description = "Delete a sprint and open sprints for a workspace";
    inputSchema = {
        type: "object",
        properties: {
            workspace_id: { type: "string", description: "Workspace ID" },
        },
        required: ["workspace_id"],
    };
    async handle(args, client) {
        const { workspace_id } = args;
        const mutation = `
      mutation deleteSprintConfigAndOpenSprints($input: DeleteSprintConfigAndOpenSprintsInput!) {
        deleteSprintConfigAndOpenSprints(input: $input) {
          success
        }
      }
    `;
        const variables = {
            input: {
                workspaceId: workspace_id,
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class GetWorkspaceSprintsTool extends BaseTool {
    name = "zenhub_get_workspace_sprints";
    description = "Get all sprints in a workspace";
    inputSchema = {
        type: "object",
        properties: {
            workspace_id: { type: "string", description: "Workspace ID" },
        },
        required: ["workspace_id"],
    };
    async handle(args, client) {
        const { workspace_id } = args;
        const query = `
      query workspace($workspaceId: ID!) {
        workspace(id: $workspaceId) {
          id
          name
          sprints {
            nodes {
              id
              name
              startOn
              endOn
              state
              issues {
                totalCount
              }
            }
          }
        }
      }
    `;
        const variables = {
            workspaceId: workspace_id,
        };
        return this.executeGraphQL(client, query, variables);
    }
}
export const sprintTools = [
    new CreateSprintTool(),
    new UpdateSprintTool(),
    new AddIssuesToSprintsTool(),
    new RemoveIssuesFromSprintsTool(),
    new DeleteSprintTool(),
    new GetWorkspaceSprintsTool(),
].map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    handler: tool.handle.bind(tool),
}));
