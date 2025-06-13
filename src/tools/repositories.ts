import { getSdk } from "../generated/graphql.js";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class GetWorkspaceRepositoriesTool extends BaseTool {
  name = "zenhub_get_workspace_repositories";
  description = "Get all repositories for a workspace";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
    },
    required: ["workspace_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id } = args;

    const result = await sdk.getWorkspaceRepositories({
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

class GetRepositoriesByGitHubIdsTool extends BaseTool {
  name = "zenhub_get_repositories_by_github_ids";
  description = "Lookup repositories by their GitHub IDs";
  inputSchema = {
    type: "object",
    properties: {
      github_ids: {
        type: "array",
        items: { type: "number" },
        description: "Array of GitHub repository IDs",
      },
    },
    required: ["github_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { github_ids } = args;

    const result = await sdk.getRepositoriesByGhIds({
      ghIds: github_ids,
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

class AddRepositoryToWorkspaceTool extends BaseTool {
  name = "zenhub_add_repository_to_workspace";
  description = "Add a GitHub repository to a workspace";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
      repository_github_id: {
        type: "number",
        description: "GitHub repository ID",
      },
    },
    required: ["workspace_id", "repository_github_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id, repository_github_id } = args;

    const result = await sdk.addRepositoryToWorkspace({
      input: {
        workspaceId: workspace_id,
        repositoryGhId: repository_github_id,
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

class RemoveRepositoryFromWorkspaceTool extends BaseTool {
  name = "zenhub_remove_repository_from_workspace";
  description = "Remove a repository from a workspace";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
      repository_id: { type: "string", description: "Repository ID" },
    },
    required: ["workspace_id", "repository_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id, repository_id } = args;

    const result = await sdk.disconnectWorkspaceRepository({
      input: {
        workspaceId: workspace_id,
        repositoryGhId: repository_id,
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

class GetRepositoryDetailsTool extends BaseTool {
  name = "zenhub_get_repository_details";
  description = "Get detailed information about a specific repository";
  inputSchema = {
    type: "object",
    properties: {
      repository_id: { type: "string", description: "Repository ID" },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { repository_id } = args;

    const result = await sdk.getRepositoryDetails({
      repositoryId: repository_id,
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

class GetRepositoryAssignableUsersTool extends BaseTool {
  name = "zenhub_get_repository_assignable_users";
  description = "Get users who can be assigned to issues in a repository";
  inputSchema = {
    type: "object",
    properties: {
      repository_id: { type: "string", description: "Repository ID" },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { repository_id } = args;

    const result = await sdk.getRepositoryAssignableUsers({
      repositoryId: repository_id,
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

export const repositoryTools: ZenHubTool[] = [
  new GetWorkspaceRepositoriesTool(),
  new GetRepositoriesByGitHubIdsTool(),
  new AddRepositoryToWorkspaceTool(),
  new RemoveRepositoryFromWorkspaceTool(),
  new GetRepositoryDetailsTool(),
  new GetRepositoryAssignableUsersTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));