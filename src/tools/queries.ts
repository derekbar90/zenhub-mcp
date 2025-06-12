import { GraphQLClient } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class GenericQueryTool extends BaseTool {
  name = "zenhub_query";
  description = "Execute any GraphQL query against the ZenHub API";
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
  description = "Search for issues in a pipeline";
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

    const searchQuery = `
      query searchIssuesByPipeline($pipelineId: ID!, $query: String, $filters: IssueFilters) {
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
  description = "Search and filter issues inside repository";
  inputSchema = {
    type: "object",
    properties: {
      
      repository_id: { type: "string", description: "Repository ID to search in" },
      query: { type: "string", description: "Search query" },
      filters: { type: "object", description: "Filter options" },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { repository_id, query = "", filters = {} } = args;

    const searchQuery = `
      query searchIssues($repositoryId: ID!, $query: String, $filters: IssueFilters) {
        searchIssues(repositoryId: $repositoryId, query: $query, filters: $filters) {
          nodes {
            id
            title
            number
            state
            labels
          }
        }
      }
    `;

    const variables = {
      repositoryId: repository_id,
      query,
      filters,
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

    const query = `
      query workspaceIssues($workspaceId: ID!, $after: String) {
        workspace(id: $workspaceId) {
          issues(after: $after) {
            nodes {
              id
              pullRequest
              type
              title
              number
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
  description = "Get current ZenHub user information";
  inputSchema = {
    type: "object",
    properties: {
      
    },
    required: [],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const query = `
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

    const query = `
      query issueByInfo($repositoryGhId: Int!, $issueNumber: Int!) {
        issueByInfo(repositoryGhId: $repositoryGhId, issueNumber: $issueNumber) {
          id
          title
          number
          state
          htmlUrl
          labels
          assignees {
            login
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

    const query = `
      query repositoriesByGhId($repositoryGhIds: [Int!]!) {
        repositoriesByGhId(repositoryGhIds: $repositoryGhIds) {
          id
          name
          nameWithOwner
          ghId
          owner {
            login
          }
        }
      }
    `;

    const variables = {
      repositoryGhIds: repository_gh_ids,
    };

    return this.executeGraphQL(client, query, variables);
  }
}

export const queryTools: ZenHubTool[] = [
  new GenericQueryTool(),
  new SearchIssuesByPipelineTool(),
  new SearchIssuesTool(),
  new GetWorkspaceIssuesTool(),
  new GetViewerTool(),
  new GetIssueByInfoTool(),
  new GetRepositoriesByGhIdTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));