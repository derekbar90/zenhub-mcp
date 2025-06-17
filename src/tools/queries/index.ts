import { GraphQLClient } from "graphql-request";
import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";

class GenericQueryTool extends BaseTool {
  name = "zenhub_query_potentially_dangerous";
  description =
    "FALLBACK: Execute custom GraphQL queries when specific tools don't meet your needs. **IMPORTANT: Mutations but have EXPLICT appoval from the user by repeating back a super minimal confirmation message.**";
  inputSchema = {
    type: "object",
    properties: {
      query: { type: "string", description: "GraphQL query to execute" },
      variables: {
        type: "object",
        description: "Variables for the GraphQL query",
      },
    },
    required: ["query"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { query, variables = {} } = args;
    // This tool is a fallback and uses raw queries, so we can't use the SDK here.
    // We'll need to create a new GraphQLClient to execute the query.
    const client = new GraphQLClient("https://api.zenhub.com/public/graphql", {
      headers: {
        Authorization: `Bearer ${process.env.ZENHUB_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    try {
      const result = await client.request(query, variables);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `GraphQL Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

class SearchIssuesByPipelineTool extends BaseTool {
  name = "zenhub_search_issues";
  description =
    "Search and filter issues within a specific pipeline by title, labels, or assignees";
  inputSchema = {
    type: "object",
    properties: {
      pipeline_id: {
        type: "string",
        description:
          "Pipeline ID to search in. Use zenhub_get_workspace_overview to get pipeline IDs.",
      },
      query: {
        type: "string",
        description:
          "Search query for title, user (github login name), content",
      },
      filters: {
        type: "object",
        properties: {
          labels: {
            description: "Filter by labels. Use zenhub_get_workspace_labels to get label IDs.",
            type: "object",
            properties: { in: { type: "array", items: { type: "string" } } },
          },
          assignees: {
            description: "Filter by assignees github handles. Use zenhub_get_workspace_users.",
            type: "object",
            properties: { in: { type: "array", items: { type: "string" } } },
          },
        },
      },
    },
    required: ["pipeline_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { pipeline_id, query = "", filters = {} } = args;

    const result = await sdk.searchIssuesByPipeline({
      pipelineId: pipeline_id,
      query,
      filters,
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

class SearchIssuesTool extends BaseTool {
  name = "zenhub_search_issues_in_repository";
  description =
    "Search and filter issues in a workspace by user, repository, and pipeline. Use zenhub_get_workspace_overview to get repository IDs and pipeline IDs before using this tool.";
  inputSchema = {
    type: "object",
    properties: {
      workspace_id: {
        type: "string",
        description: "Workspace ID to search in",
      },
      query: {
        type: "string",
        description:
          "Query to search for user (github login name), content, title",
      },
      repo_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of repository IDs to filter.",
        optional: false,
      },
      pipeline_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of pipeline IDs to filter.",
        optional: false,
      },
    },
    required: ["workspace_id", "query", "repo_ids", "pipeline_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id, user, repo_ids, pipeline_ids } = args;

    const result = await sdk.searchIssues({
      workspaceId: workspace_id,
      user: user,
      repoIds: repo_ids || [],
      pipelineIds: pipeline_ids || [],
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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id, after } = args;

    const result = await sdk.workspaceIssues({
      workspaceId: workspace_id,
      ...(after && { after }),
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

class GetViewerTool extends BaseTool {
  name = "zenhub_get_viewer";
  description =
    "Get current authenticated user's ZenHub and GitHub profile information";
  inputSchema = {
    type: "object",
    properties: {},
    required: [],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const result = await sdk.viewer();

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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { repository_gh_id, issue_number } = args;

    const result = await sdk.issueByInfo({
      repositoryGhId: repository_gh_id,
      issueNumber: issue_number,
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

class GetRepositoriesByGhIdTool extends BaseTool {
  name = "zenhub_get_repositories";
  description = "Lookup repositories by their GitHub IDs";
  inputSchema = {
    type: "object",
    properties: {
      repository_gh_ids: {
        type: "array",
        items: { type: "number" },
        description: "Array of GitHub repository IDs",
      },
    },
    required: ["repository_gh_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { repository_gh_ids } = args;

    const result = await sdk.getRepositoriesByGhIds({
      ghIds: repository_gh_ids,
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

export const queryTools: ZenHubTool[] = [
  new GenericQueryTool(),
  new SearchIssuesByPipelineTool(),
  new SearchIssuesTool(),
  new GetWorkspaceIssuesTool(),
  new GetViewerTool(),
  new GetIssueByInfoTool(),
  new GetRepositoriesByGhIdTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));
