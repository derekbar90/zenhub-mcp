import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";

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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const {
      name,
      start_date,
      end_date,
      timezone = "UTC",
      workspace_id,
      settings = {},
    } = args;

    const sprintSettings: any = {
      moveUnfinishedIssues: settings.move_unfinished_issues || false,
    };

    if (settings.pipeline_id) {
      sprintSettings.issuesFromPipeline = {
        pipelineId: settings.pipeline_id,
        enabled: true,
        totalStoryPoints: settings.total_story_points || 0,
      };
    }

    const result = await sdk.createSprintConfig({
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
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
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
      state: {
        type: "string",
        enum: ["OPEN", "CLOSED"],
        description: "Sprint state",
      },
    },
    required: ["sprint_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { sprint_id, name, start_date, end_date, state } = args;

    const result = await sdk.updateSprint({
      input: {
        sprintId: sprint_id,
        ...(name && { name }),
        ...(start_date && { startAt: start_date }),
        ...(end_date && { endAt: end_date }),
        ...(state && { state }),
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
}

class AddIssuesToSprintsTool extends BaseTool {
  name = "zenhub_add_issues_to_sprints";
  description = "Add issues to sprints";
  inputSchema = {
    type: "object",
    properties: {
      issue_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of issue IDs",
      },
      sprint_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of sprint IDs",
      },
    },
    required: ["issue_ids", "sprint_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, sprint_ids } = args;

    const result = await sdk.addIssuesToSprints({
      input: {
        issueIds: issue_ids,
        sprintIds: sprint_ids,
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
}

class RemoveIssuesFromSprintsTool extends BaseTool {
  name = "zenhub_remove_issues_from_sprints";
  description = "Remove issues from sprints";
  inputSchema = {
    type: "object",
    properties: {
      issue_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of issue IDs",
      },
      sprint_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of sprint IDs",
      },
    },
    required: ["issue_ids", "sprint_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, sprint_ids } = args;

    const result = await sdk.removeIssuesFromSprints({
      input: {
        issueIds: issue_ids,
        sprintIds: sprint_ids,
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id } = args;

    const result = await sdk.deleteSprintConfigAndOpenSprints({
      input: {
        workspaceId: workspace_id,
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id } = args;

    const result = await sdk.getWorkspaceSprints({
      workspaceId: workspace_id,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
}

export const sprintTools: ZenHubTool[] = [
  new CreateSprintTool(),
  new UpdateSprintTool(),
  new AddIssuesToSprintsTool(),
  // new RemoveIssuesFromSprintsTool(),
  // new DeleteSprintTool(),
  new GetWorkspaceSprintsTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));