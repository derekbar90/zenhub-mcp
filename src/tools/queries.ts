import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class GenericQueryTool extends BaseTool {
  name = "zenhub_query";
  description = "FALLBACK: Execute custom GraphQL queries when specific tools don't meet your needs";
  inputSchema = {
    type: "object",
    properties: {
      
      query: { type: "string", description: "GraphQL query to execute" },
      variables: { type: "object", description: "Variables for the GraphQL query" },
    },
    required: ["query"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { query, variables = {} } = args;
    return this.executeGraphQL(client, query, variables);
  }
}

class SearchIssuesByPipelineTool extends BaseTool {
  name = "zenhub_search_issues";
  description = "Search and filter issues within a specific pipeline by title, labels, or assignees";
  inputSchema = {
    type: "object",
    properties: {
      
      pipeline_id: { type: "string", description: "Pipeline ID to search in" },
      query: { type: "string", description: "Search query for title" },
      filters: {
        type: "object",
        properties: {
          labels: { type: "object", properties: { in: { type: "array", items: { type: "string" } } } },
          assignees: { type: "object", properties: { in: { type: "array", items: { type: "string" } } } },
        },
      },
    },
    required: ["pipeline_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { pipeline_id, query = "", filters = {} } = args;

    const searchQuery = gql`
      query searchIssuesByPipeline($pipelineId: ID!, $query: String, $filters: IssueSearchFiltersInput!) {
        searchIssuesByPipeline(pipelineId: $pipelineId, query: $query, filters: $filters) {
          nodes {
            id
            title
            number
          }
        }
      }
    `;

    const variables = {
      pipelineId: pipeline_id,
      query,
      filters,
    };

    return this.executeGraphQL(client, searchQuery, variables);
  }
}

class SearchIssuesTool extends BaseTool {
  name = "zenhub_search_issues_in_repository";
  description = "Search and filter issues in a workspace by user, repository, and pipeline";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: { type: "string", description: "Workspace ID to search in" },
      user: { type: "string", description: "User to search for (query)" },
      repo_ids: { type: "array", items: { type: "string" }, description: "Array of repository IDs to filter" },
      pipeline_ids: { type: "array", items: { type: "string" }, description: "Array of pipeline IDs to filter" },
    },
    required: ["workspace_id", "user", "repo_ids", "pipeline_ids"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id, user, repo_ids, pipeline_ids } = args;

    const searchQuery = gql`
      query searchIssues($workspaceId: ID!, $user: String!, $repoIds: [ID!]!, $pipelineIds: [ID!]!) {
        searchIssues(workspaceId: $workspaceId, query: $user, filters: {
          pipelineIds: $pipelineIds
          repositoryIds: $repoIds
        }){
          nodes {
              id
              state
              body
              state
              labels {
                nodes {
                  id
                  name
                }
              }
              closedAt
              creator {
                id
                githubUser {
                  login
                }
                name
              }
              estimate {
                value
              }
              htmlUrl
              assignees {
                nodes {
                  id
                  login
                }
              }
            }
        }
      }
    `;

    const variables = {
      workspaceId: workspace_id,
      user,
      repoIds: repo_ids,
      pipelineIds: pipeline_ids,
    };

    return this.executeGraphQL(client, searchQuery, variables);
  }
}

class GetWorkspaceIssuesTool extends BaseTool {
  name = "zenhub_get_workspace_issues";
  description = "Get all issues in a workspace (paginated)";
  inputSchema = {
    type: "object",
    properties: {
      
      workspace_id: { type: "string", description: "Workspace ID" },
      after: { type: "string", description: "Cursor for pagination" },
    },
    required: ["workspace_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id, after } = args;

    const query = gql`
      query workspaceIssues($workspaceId: ID!, $after: String) {
        workspace(id: $workspaceId) {
          issues(after: $after) {
            nodes {
              id
              pullRequest
              type
              title
              number
              state
              assignees {
                nodes {
                  name
                  id
                  ghId
                  login
                }
              }
              parentZenhubEpics {
                totalCount
              }
              repository {
                name
                ownerName
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
      workspaceId: workspace_id,
      ...(after && { after }),
    };

    return this.executeGraphQL(client, query, variables);
  }
}

class GetViewerTool extends BaseTool {
  name = "zenhub_get_viewer";
  description = "Get current authenticated user's ZenHub and GitHub profile information";
  inputSchema = {
    type: "object",
    properties: {
      
    },
    required: [],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const query = gql`
      query viewer {
        viewer {
          id
          name
          email
          imageUrl
          githubUser {
            login
            avatarUrl
          }
        }
      }
    `;

    return this.executeGraphQL(client, query);
  }
}

class GetIssueByInfoTool extends BaseTool {
  name = "zenhub_get_issue_by_info";
  description = "Lookup an issue by repository and issue number";
  inputSchema = {
    type: "object",
    properties: {
      
      repository_gh_id: { type: "number", description: "GitHub repository ID" },
      issue_number: { type: "number", description: "Issue number" },
    },
    required: ["repository_gh_id", "issue_number"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { repository_gh_id, issue_number } = args;

    const query = gql`
      query issueByInfo($repositoryGhId: Int!, $issueNumber: Int!) {
        issueByInfo(repositoryGhId: $repositoryGhId, issueNumber: $issueNumber) {
          id
          title
          number
          state
          htmlUrl
          labels {
            nodes {
              name
            }
          }
          assignees {
            nodes {
              login
            }
          }
          milestone {
            title
          }
        }
      }
    `;

    const variables = {
      repositoryGhId: repository_gh_id,
      issueNumber: issue_number,
    };

    return this.executeGraphQL(client, query, variables);
  }
}

class GetRepositoriesByGhIdTool extends BaseTool {
  name = "zenhub_get_repositories";
  description = "Lookup repositories by their GitHub IDs";
  inputSchema = {
    type: "object",
    properties: {
      
      repository_gh_ids: { type: "array", items: { type: "number" }, description: "Array of GitHub repository IDs" },
    },
    required: ["repository_gh_ids"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { repository_gh_ids } = args;

    const query = gql`
      query repositoriesByGhId($ghIds: [Int!]!) {
        repositoriesByGhId(ghIds: $ghIds) {
          id
          name
          ownerName
          ghId
          owner {
            login
          }
        }
      }
    `;

    const variables = {
      ghIds: repository_gh_ids,
    };

    return this.executeGraphQL(client, query, variables);
  }
}

export const queryTools: ZenHubTool[] = [
  new GetViewerTool(),
  new GetIssueByInfoTool(),
  new GetRepositoriesByGhIdTool(),
  new SearchIssuesByPipelineTool(),
  new SearchIssuesTool(),
  new GetWorkspaceIssuesTool(),
  new GenericQueryTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));