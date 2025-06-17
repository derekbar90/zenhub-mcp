import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ToolResponse, ZenHubTool } from "../../types.js";

class GetWorkspaceUsersTool extends BaseTool {
  name = "zenhub_get_workspace_users";
  description = "Get all users in a workspace who can be assigned to issues";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
    },
    required: ["workspace_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id } = args;

    const result = await sdk.getWorkspaceUsers({
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

class GetRepositoryCollaboratorsTool extends BaseTool {
  name = "zenhub_get_repository_collaborators";
  description =
    "Get all collaborators for a repository who can be assigned to issues (Note: Repository collaborators not available in ZenHub API - use workspace users instead)";
  inputSchema = {
    type: "object",
    properties: {
      repository_id: {
        type: "string",
        description: "Repository ID (Note: Not supported in ZenHub API)",
      },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    // Repository collaborators not available in ZenHub API
    // Return error message suggesting to use workspace users instead
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error:
                "Repository collaborators not available in ZenHub GraphQL API. Use zenhub_get_workspace_users instead.",
              suggestion:
                "Use zenhub_get_workspace_users to get users who can be assigned to issues in a workspace.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

class GetOwnerByLoginTool extends BaseTool {
  name = "zenhub_get_owner_by_login";
  description = "Lookup a GitHub user/organization by login";
  inputSchema = {
    type: "object",
    properties: {
      login: {
        type: "string",
        description: "GitHub username or organization name",
      },
    },
    required: ["login"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { login } = args;

    const result = await sdk.ownerByLogin({
      login,
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

class GetOwnerByGhIdTool extends BaseTool {
  name = "zenhub_get_owner_by_gh_id";
  description = "Lookup a GitHub user/organization by GitHub ID";
  inputSchema = {
    type: "object",
    properties: {
      github_id: { type: "number", description: "GitHub user/organization ID" },
    },
    required: ["github_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { github_id } = args;

    const result = await sdk.ownerByGhId({
      ghId: github_id,
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

// class SearchUsersTool extends BaseTool {
//   name = "zenhub_search_users";
//   description = "Search for users who can be assigned to issues";
//   inputSchema = {
//     type: "object",
//     properties: {
//       query: {
//         type: "string",
//         description: "Search query (username, name, or email)",
//       },
//       workspace_id: {
//         type: "string",
//         description: "Workspace ID to limit search to workspace users",
//       },
//     },
//     required: ["query"],
//   };

//   async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>): Promise<ToolResponse> {
//     const { query: searchQuery, workspace_id } = args;

//     if (workspace_id) {
//       // Search within workspace users
//       const result = await sdk.searchWorkspaceUsers({
//         workspaceId: workspace_id,
//       });

//       // Filter results client-side based on search query
//       if (result.workspace?.zenhubUsers.nodes) {
//         const users = result.workspace.zenhubUsers.nodes;
//         const filteredUsers = users.filter(
//           (user: any) =>
//             user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             user.email?.toLowerCase().includes(searchQuery.toLowerCase())
//         );

//         return {
//           content: [
//             {
//               type: "text" as const,
//               text: JSON.stringify({ users: filteredUsers }, null, 2),
//             },
//           ],
//         };
//       }

//       return {
//         content: [
//           {
//             type: "text" as const,
//             text: JSON.stringify(result, null, 2),
//           },
//         ],
//       };
//     } else {
//       // Search by login globally
//       const result = await sdk.searchOwnerByLogin({ login: searchQuery });
//       return {
//         content: [
//           {
//             type: "text" as const,
//             text: JSON.stringify(result, null, 2),
//           },
//         ],
//       };
//     }
//   }
// }

export const userTools: ZenHubTool[] = [
  new GetWorkspaceUsersTool(),
  new GetRepositoryCollaboratorsTool(),
  new GetOwnerByLoginTool(),
  new GetOwnerByGhIdTool(),
  // new SearchUsersTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));