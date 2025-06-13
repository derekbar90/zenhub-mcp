import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id } = args;

    const query = gql`
      query getWorkspaceRepositories($workspaceId: ID!) {
        workspace(id: $workspaceId) {
          id
          name
          description
          repositoriesConnection {
            nodes {
              id
              ghId
              createdAt
              name
              description 
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

class GetRepositoriesByGitHubIdsTool extends BaseTool {
  name = "zenhub_get_repositories_by_github_ids";
  description = "Lookup repositories by their GitHub IDs";
  inputSchema = {
    type: "object",
    properties: {
      github_ids: { 
        type: "array", 
        items: { type: "number" },
        description: "Array of GitHub repository IDs" 
      },
    },
    required: ["github_ids"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { github_ids } = args;

    const query = gql`
      query getRepositoriesByGhIds($ghIds: [Int!]!) {
        repositoriesByGhId(ghIds: $ghIds) {
          id
          ghId
          name
          description
          ownerName
          createdAt
          updatedAt
          workspacesConnection {
            nodes {
              id
              name
            }
          }
        }
      }
    `;

    const variables = {
      ghIds: github_ids,
    };

    return this.executeGraphQL(client, query, variables);
  }
}

class AddRepositoryToWorkspaceTool extends BaseTool {
  name = "zenhub_add_repository_to_workspace";
  description = "Add a GitHub repository to a workspace";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID" },
      repository_github_id: { type: "number", description: "GitHub repository ID" },
    },
    required: ["workspace_id", "repository_github_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id, repository_github_id } = args;

    const mutation = gql`
      mutation addRepositoryToWorkspace($input: AddRepositoryToWorkspaceInput!) {
        addRepositoryToWorkspace(input: $input) {
          workspaceRepository {
            id
            repository {
              id
              ghId
              name
              description
            }
            workspace {
              id
              name
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        workspaceId: workspace_id,
        repositoryGhId: repository_github_id,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id, repository_id } = args;

    const mutation = gql`
      mutation disconnectWorkspaceRepository($input: DisconnectWorkspaceRepositoryInput!) {
        disconnectWorkspaceRepository(input: $input) {
          workspace {
            id
            name
          }
        }
      }
    `;

    const variables = {
      input: {
        workspaceId: workspace_id,
        repositoryId: repository_id,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { repository_id } = args;

    const query = gql`
      query getRepositoryDetails($repositoryId: ID!) {
        node(id: $repositoryId) {
          ... on Repository {
            id
            ghId
            name
            description
            ownerName
            createdAt
            updatedAt
            workspacesConnection {
              nodes {
                id
                name
                description
              }
            }
            issues(first: 5) {
              totalCount
              nodes {
                id
                number
                title
                state
              }
            }
            milestones(first: 5) {
              totalCount
              nodes {
                id
                title
                state
              }
            }
            labels(first: 10) {
              totalCount
              nodes {
                id
                name
                color
              }
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

class GetRepositoryAssignableUsersTool extends BaseTool {
  name = "zenhub_get_repository_assignable_users";
  description = "Get users who can be assigned to issues in a repository";
  inputSchema = {
    type: "object",
    properties: {
      repository_id: { type: "string", description: "Repository ID" },
      first: { type: "number", description: "Number of users to return (default: 20)" },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { repository_id, first = 20 } = args;

    const query = gql`
      query getRepositoryAssignableUsers($repositoryId: ID!, $first: Int) {
        node(id: $repositoryId) {
          ... on Repository {
            id
            name
            assignableUsers(first: $first) {
              totalCount
              nodes {
                id
                login
                name
                zenhubUser {
                  imageUrl
                  githubUser {
                    login
                    avatarUrl
                  }
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
    `;

    const variables = {
      repositoryId: repository_id,
      first,
    };

    return this.executeGraphQL(client, query, variables);
  }
}

export const repositoryTools: ZenHubTool[] = [
  new GetWorkspaceRepositoriesTool(),
  new GetRepositoriesByGitHubIdsTool(),
  new AddRepositoryToWorkspaceTool(),
  new RemoveRepositoryFromWorkspaceTool(),
  new GetRepositoryDetailsTool(),
  new GetRepositoryAssignableUsersTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));