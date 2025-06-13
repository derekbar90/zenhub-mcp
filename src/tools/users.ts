import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ToolResponse, ZenHubTool } from "../types.js";

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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id } = args;

    const query = gql`
      query getWorkspaceUsers($workspaceId: ID!) {
        workspace(id: $workspaceId) {
          id
          name
    			description
          assignees {
            totalCount
            nodes {
              id
              ghId
              login
              name
              zenhubUser {
                email
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

class GetRepositoryCollaboratorsTool extends BaseTool {
  name = "zenhub_get_repository_collaborators";
  description = "Get all collaborators for a repository who can be assigned to issues (Note: Repository collaborators not available in ZenHub API - use workspace users instead)";
  inputSchema = {
    type: "object",
    properties: {
      
      repository_id: { type: "string", description: "Repository ID (Note: Not supported in ZenHub API)" },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    // Repository collaborators not available in ZenHub API
    // Return error message suggesting to use workspace users instead
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: "Repository collaborators not available in ZenHub GraphQL API. Use zenhub_get_workspace_users instead.",
            suggestion: "Use zenhub_get_workspace_users to get users who can be assigned to issues in a workspace."
          }, null, 2),
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
      
      login: { type: "string", description: "GitHub username or organization name" },
    },
    required: ["login"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { login } = args;

    const query = gql`
      query ownerByLogin($login: String!) {
        ownerByLogin(login: $login) {
          id
          login
          avatarUrl
          ... on User {
            name
          }
          ... on Organization {
            login
          }
        }
      }
    `;

    const variables = {
      login,
    };

    return this.executeGraphQL(client, query, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { github_id } = args;

    const query = gql`
      query ownerByGhId($ghId: Int!) {
        ownerByGhId(ghId: $ghId) {
          id
          login
          avatarUrl
          ... on User {
            name
          }
          ... on Organization {
            login
          }
        }
      }
    `;

    const variables = {
      ghId: github_id,
    };

    return this.executeGraphQL(client, query, variables);
  }
}

class SearchUsersTool extends BaseTool {
  name = "zenhub_search_users";
  description = "Search for users who can be assigned to issues";
  inputSchema = {
    type: "object",
    properties: {
      
      query: { type: "string", description: "Search query (username, name, or email)" },
      workspace_id: { type: "string", description: "Workspace ID to limit search to workspace users" },
    },
    required: ["query"],
  };

  async handle(args: ToolArgs, client: GraphQLClient): Promise<ToolResponse> {
    const { query: searchQuery, workspace_id } = args;

    if (workspace_id) {
      // Search within workspace users
      const query = gql`
        query searchWorkspaceUsers($workspaceId: ID!) {
          workspace(id: $workspaceId) {
            zenhubUsers {
              nodes {
                id
                name
                email
              }
            }
          }
        }
      `;

      const variables = {
        workspaceId: workspace_id,
      };

      const result = await this.executeGraphQL(client, query, variables);
      
      // Filter results client-side based on search query
      if (result.content[0].text) {
        const data = JSON.parse(result.content[0].text);
        const users = data.workspace?.zenhubUsers?.nodes || [];
        const filteredUsers = users.filter((user: any) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ users: filteredUsers }, null, 2),
            },
          ],
        };
      }
      
      return result;
    } else {
      // Search by login globally
      return this.executeGraphQL(client, gql`
        query searchOwnerByLogin($login: String!) {
          ownerByLogin(login: $login) {
            id
            login
            avatarUrl
            ... on User {
              name
            }
          }
        }
      `, { login: searchQuery });
    }
  }
}

export const userTools: ZenHubTool[] = [
  new GetWorkspaceUsersTool(),
  new GetRepositoryCollaboratorsTool(),
  new GetOwnerByLoginTool(),
  new GetOwnerByGhIdTool(),
  new SearchUsersTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));