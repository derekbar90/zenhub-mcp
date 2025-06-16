import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";

class CreateWorkspaceTool extends BaseTool {
  name = "zenhub_create_workspace";
  description = "Create a new workspace in ZenHub";
  inputSchema = {
    type: "object",
    properties: {
      name: { type: "string", description: "Workspace name" },
      description: { type: "string", description: "Workspace description" },
      organization_id: {
        type: "string",
        description: "ZenHub organization ID",
      },
      repository_ids: {
        type: "array",
        items: { type: "number" },
        description: "GitHub repository IDs",
      },
      default_repository_id: {
        type: "number",
        description: "Default repository ID",
      },
    },
    required: ["name", "organization_id", "repository_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const {
      name,
      description = "",
      organization_id,
      repository_ids,
      default_repository_id,
    } = args;

    const result = await sdk.createWorkspace({
      input: {
        name,
        description,
        zenhubOrganizationId: organization_id,
        repositoryGhIds: repository_ids,
        ...(default_repository_id && {
          defaultRepositoryGhId: default_repository_id,
        }),
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

class GetUserWorkspacesTool extends BaseTool {
  name = "zenhub_get_user_workspaces";
  description = "Get all workspaces accessible to the current user";
  inputSchema = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Optional search query to filter workspaces",
      },
      first: {
        type: "number",
        description: "Number of workspaces to return (default: 20)",
      },
    },
    required: [],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { query, first = 20 } = args;

    const result =
      !query || query.trim() === ""
        ? await sdk.getUserWorkspacesFromOrgs({ first })
        : await sdk.searchUserWorkspaces({ query, first });

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

class GetUserOrganizationsTool extends BaseTool {
  name = "zenhub_get_user_organizations";
  description = "Get all ZenHub organizations accessible to the current user";
  inputSchema = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Optional search query to filter organizations",
      },
      first: {
        type: "number",
        description: "Number of organizations to return (default: 10)",
      },
    },
    required: [],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { query = "", first = 10 } = args;

    const result = await sdk.getUserOrganizations({
      ...(query && { query }),
      first,
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

class GetWorkspaceOverviewTool extends BaseTool {
  name = "zenhub_get_workspace_overview";
  description =
    "Get workspace overview including basic metadata, pipelines with issue counts, repositories with issue counts, default repository and its issue types, epic summaries, and workspace users";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
    },
    required: ["workspace_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id } = args;

    const result = await sdk.getWorkspaceOverview({ workspaceId: workspace_id });

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

class GetOrganizationWorkspacesTool extends BaseTool {
  name = "zenhub_get_organization_workspaces";
  description = "Get all workspaces within a specific ZenHub organization";
  inputSchema = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Optional search query to filter organizations",
      },
      first: {
        type: "number",
        description: "Number of organizations to return (default: 10)",
      },
    },
    required: [],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { query = "", first = 10 } = args;

    const result = await sdk.getOrganizationWorkspaces({
      ...(query && { query }),
      first,
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

export const workspaceTools: ZenHubTool[] = [
  new CreateWorkspaceTool(),
  new GetUserWorkspacesTool(),
  new GetUserOrganizationsTool(),
  new GetWorkspaceOverviewTool(),
  new GetOrganizationWorkspacesTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));