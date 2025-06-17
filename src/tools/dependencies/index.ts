import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";

class CreateIssueDependencyTool extends BaseTool {
  name = "zenhub_create_issue_dependency";
  description = "Create a dependency between two issues (blocking → blocked)";
  inputSchema = {
    type: "object",
    properties: {
      blocking_repository_gh_id: {
        type: "number",
        description: "GitHub repository numeric ID for the blocking issue",
      },
      blocking_issue_number: {
        type: "number",
        description: "Issue number of the blocking issue within the repository",
      },
      blocked_repository_gh_id: {
        type: "number",
        description: "GitHub repository numeric ID for the blocked issue",
      },
      blocked_issue_number: {
        type: "number",
        description: "Issue number of the blocked issue within the repository",
      },
    },
    required: [
      "blocking_repository_gh_id",
      "blocking_issue_number",
      "blocked_repository_gh_id",
      "blocked_issue_number",
    ],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const {
      blocking_repository_gh_id,
      blocking_issue_number,
      blocked_repository_gh_id,
      blocked_issue_number,
    } = args;

    const result = await sdk.createIssueDependency({
      input: {
        blockingIssue: {
          repositoryGhId: blocking_repository_gh_id,
          issueNumber: blocking_issue_number,
        },
        blockedIssue: {
          repositoryGhId: blocked_repository_gh_id,
          issueNumber: blocked_issue_number,
        },
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.createIssueDependency?.issueDependency, null, 2),
        },
      ],
    };
  }
}

class DeleteIssueDependencyTool extends BaseTool {
  name = "zenhub_delete_issue_dependency";
  description = "Delete a dependency between two issues (blocking → blocked)";
  inputSchema = {
    type: "object",
    properties: {
      blocking_repository_gh_id: {
        type: "number",
        description: "GitHub repository numeric ID for the blocking issue",
      },
      blocking_issue_number: {
        type: "number",
        description: "Issue number of the blocking issue within the repository",
      },
      blocked_repository_gh_id: {
        type: "number",
        description: "GitHub repository numeric ID for the blocked issue",
      },
      blocked_issue_number: {
        type: "number",
        description: "Issue number of the blocked issue within the repository",
      },
    },
    required: [
      "blocking_repository_gh_id",
      "blocking_issue_number",
      "blocked_repository_gh_id",
      "blocked_issue_number",
    ],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const {
      blocking_repository_gh_id,
      blocking_issue_number,
      blocked_repository_gh_id,
      blocked_issue_number,
    } = args;

    const result = await sdk.deleteIssueDependency({
      input: {
        blockingIssue: {
          repositoryGhId: blocking_repository_gh_id,
          issueNumber: blocking_issue_number,
        },
        blockedIssue: {
          repositoryGhId: blocked_repository_gh_id,
          issueNumber: blocked_issue_number,
        },
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.deleteIssueDependency?.issueDependency, null, 2),
        },
      ],
    };
  }
}

export const dependencyTools: ZenHubTool[] = [
  new CreateIssueDependencyTool(),
  new DeleteIssueDependencyTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));