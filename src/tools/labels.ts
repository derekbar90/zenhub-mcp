import { getSdk } from "../generated/graphql.js";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class CreateGithubLabelTool extends BaseTool {
  name = "zenhub_create_github_label";
  description = "Create a GitHub label";
  inputSchema = {
    type: "object",
    properties: {
      repository_id: { type: "string", description: "Repository ID" },
      name: { type: "string", description: "Label name" },
      color: { type: "string", description: "Label color (hex without #)" },
      description: { type: "string", description: "Label description" },
    },
    required: ["repository_id", "name", "color"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { repository_id, name, color, description } = args;

    const result = await sdk.createGithubLabel({
      input: {
        repositoryId: repository_id,
        name,
        color,
        ...(description && { description }),
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

class CreateZenhubLabelTool extends BaseTool {
  name = "zenhub_create_zenhub_label";
  description = "Create a ZenHub label";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
      name: { type: "string", description: "Label name" },
      color: { type: "string", description: "Label color (hex without #)" },
      description: { type: "string", description: "Label description" },
    },
    required: ["workspace_id", "name", "color"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id, name, color, description } = args;

    const result = await sdk.createZenhubLabel({
      input: {
        workspaceId: workspace_id,
        name,
        color,
        ...(description && { description }),
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
class DeleteZenhubLabelsTool extends BaseTool {
  name = "zenhub_delete_zenhub_labels";
  description = "Delete ZenHub labels";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
      label_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of ZenHub label IDs",
      },
    },
    required: ["label_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id, label_ids } = args;

    const result = await sdk.deleteZenhubLabels({
      input: {
        names: label_ids,
        zenhubOrganizationId: workspace_id,
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


class GetRepositoryLabelsTool extends BaseTool {
  name = "zenhub_get_repository_labels";
  description = "Get all labels in a repository";
  inputSchema = {
    type: "object",
    properties: {
      repository_id: { type: "string", description: "GitHub Repository ID" },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { repository_id } = args;

    const result = await sdk.getRepositoryLabels({
      repositoryGhId: parseInt(repository_id),
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

class GetWorkspaceLabelsTool extends BaseTool {
  name = "zenhub_get_workspace_labels";
  description = "Get all ZenHub labels in a workspace";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
    },
    required: ["workspace_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id } = args;

    const result = await sdk.getWorkspaceLabels({
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

export const labelTools: ZenHubTool[] = [
  new CreateGithubLabelTool(),
  new CreateZenhubLabelTool(),
  new DeleteZenhubLabelsTool(),
  new GetRepositoryLabelsTool(),
  new GetWorkspaceLabelsTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));