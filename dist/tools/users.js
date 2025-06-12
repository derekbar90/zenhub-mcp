import { BaseTool } from "./base.js";
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
    async handle(args, client) {
        const { workspace_id } = args;
        const query = `
      query workspace($workspaceId: ID!) {
        workspace(id: $workspaceId) {
          id
          name
          zenhubUsers {
            nodes {
              id
              login
              name
              email
              avatarUrl
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
    description = "Get all collaborators for a repository who can be assigned to issues";
    inputSchema = {
        type: "object",
        properties: {
            repository_id: { type: "string", description: "Repository ID" },
        },
        required: ["repository_id"],
    };
    async handle(args, client) {
        const { repository_id } = args;
        const query = `
      query repository($repositoryId: ID!) {
        repository(id: $repositoryId) {
          id
          name
          collaborators {
            nodes {
              id
              login
              name
              avatarUrl
            }
          }
        }
      }
    `;
        const variables = {
            repositoryId: repository_id,
        };
        return this.executeGraphQL(client, query, variables);
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
    async handle(args, client) {
        const { login } = args;
        const query = `
      query ownerByLogin($login: String!) {
        ownerByLogin(login: $login) {
          id
          login
          name
          avatarUrl
          ... on User {
            email
          }
          ... on Organization {
            description
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
    async handle(args, client) {
        const { github_id } = args;
        const query = `
      query ownerByGhId($githubId: Int!) {
        ownerByGhId(githubId: $githubId) {
          id
          login
          name
          avatarUrl
          ... on User {
            email
          }
          ... on Organization {
            description
          }
        }
      }
    `;
        const variables = {
            githubId: github_id,
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
    async handle(args, client) {
        const { query: searchQuery, workspace_id } = args;
        if (workspace_id) {
            // Search within workspace users
            const query = `
        query workspace($workspaceId: ID!) {
          workspace(id: $workspaceId) {
            zenhubUsers {
              nodes {
                id
                login
                name
                email
                avatarUrl
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
                const filteredUsers = users.filter((user) => user.login?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ users: filteredUsers }, null, 2),
                        },
                    ],
                };
            }
            return result;
        }
        else {
            // Search by login globally
            return this.executeGraphQL(client, `
        query ownerByLogin($login: String!) {
          ownerByLogin(login: $login) {
            id
            login
            name
            avatarUrl
            ... on User {
              email
            }
          }
        }
      `, { login: searchQuery });
        }
    }
}
export const userTools = [
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
