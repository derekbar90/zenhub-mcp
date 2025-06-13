import { BaseTool } from "./base.js";
class CreateWorkspaceTool extends BaseTool {
    name = "zenhub_create_workspace";
    description = "Create a new workspace in ZenHub";
    inputSchema = {
        type: "object",
        properties: {
            name: { type: "string", description: "Workspace name" },
            description: { type: "string", description: "Workspace description" },
            organization_id: { type: "string", description: "ZenHub organization ID" },
            repository_ids: { type: "array", items: { type: "number" }, description: "GitHub repository IDs" },
            default_repository_id: { type: "number", description: "Default repository ID" },
        },
        required: ["name", "organization_id", "repository_ids"],
    };
    async handle(args, client) {
        const { name, description = "", organization_id, repository_ids, default_repository_id } = args;
        const mutation = `
      mutation createWorkspace($input: CreateWorkspaceInput!) {
        createWorkspace(input: $input) {
          workspace {
            id
            name
            description
          }
        }
      }
    `;
        const variables = {
            input: {
                name,
                description,
                zenhubOrganizationId: organization_id,
                repositoryGhIds: repository_ids,
                ...(default_repository_id && { defaultRepositoryGhId: default_repository_id }),
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class GetUserWorkspacesTool extends BaseTool {
    name = "zenhub_get_user_workspaces";
    description = "Get all workspaces accessible to the current user";
    inputSchema = {
        type: "object",
        properties: {
            query: { type: "string", description: "Optional search query to filter workspaces" },
            first: { type: "number", description: "Number of workspaces to return (default: 20)" },
        },
        required: [],
    };
    async handle(args, client) {
        const { query, first = 20 } = args;
        // If no query provided, use the organization-based approach
        if (!query) {
            const orgQuery = `
        query getUserWorkspaces($first: Int) {
          viewer {
            zenhubOrganizations(first: 10) {
              nodes {
                id
                name
                workspaces(first: $first) {
                  nodes {
                    id
                    name
                    description
                    pipelinesConnection {
                      totalCount
                    }
                    repositoriesConnection {
                      totalCount
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
          }
        }
      `;
            return this.executeGraphQL(client, orgQuery, { first });
        }
        // Use search when query is provided - but searchWorkspaces requires non-empty query
        const searchQuery = `
      query getUserWorkspaces($query: String!, $first: Int) {
        viewer {
          searchWorkspaces(query: $query, first: $first) {
            nodes {
              id
              name
              description
              pipelinesConnection {
                totalCount
              }
              repositoriesConnection {
                totalCount
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;
        // searchWorkspaces requires a non-empty query string
        const searchTerm = query.trim() || "*";
        return this.executeGraphQL(client, searchQuery, { query: searchTerm, first });
    }
}
class GetUserOrganizationsTool extends BaseTool {
    name = "zenhub_get_user_organizations";
    description = "Get all ZenHub organizations accessible to the current user";
    inputSchema = {
        type: "object",
        properties: {
            query: { type: "string", description: "Optional search query to filter organizations" },
            first: { type: "number", description: "Number of organizations to return (default: 10)" },
        },
        required: [],
    };
    async handle(args, client) {
        const { query = "", first = 10 } = args;
        const searchQuery = `
      query getUserOrganizations($query: String, $first: Int) {
        viewer {
          zenhubOrganizations(query: $query, first: $first) {
            nodes {
              id
              name
              workspaces {
                totalCount
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;
        const variables = {
            ...(query && { query }),
            first,
        };
        return this.executeGraphQL(client, searchQuery, variables);
    }
}
class GetOrganizationWorkspacesTool extends BaseTool {
    name = "zenhub_get_organization_workspaces";
    description = "Get all workspaces within a specific ZenHub organization";
    inputSchema = {
        type: "object",
        properties: {
            organization_id: { type: "string", description: "ZenHub organization ID" },
            query: { type: "string", description: "Optional search query to filter workspaces" },
            first: { type: "number", description: "Number of workspaces to return (default: 20)" },
        },
        required: ["organization_id"],
    };
    async handle(args, client) {
        const { organization_id, query = "", first = 20 } = args;
        // Based on logs, zenhubOrganization field doesn't exist on Query type
        // Use the working pattern from getUserWorkspaces
        const searchQuery = `
      query getOrganizationWorkspaces($orgId: ID!, $query: String, $first: Int) {
        viewer {
          zenhubOrganizations(first: 1, ids: [$orgId]) {
            nodes {
              id
              name
              workspaces(query: $query, first: $first) {
                nodes {
                  id
                  name
                  description
                  pipelinesConnection {
                    totalCount
                  }
                  repositoriesConnection {
                    totalCount
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        }
      }
    `;
        const variables = {
            orgId: organization_id,
            ...(query && { query }),
            first,
        };
        return this.executeGraphQL(client, searchQuery, variables);
    }
}
export const workspaceTools = [
    new GetUserWorkspacesTool(),
    new GetUserOrganizationsTool(),
    new GetOrganizationWorkspacesTool(),
    new CreateWorkspaceTool(),
].map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    handler: tool.handle.bind(tool),
}));
