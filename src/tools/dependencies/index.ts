import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";

class CreateIssueDependencyTool extends BaseTool {
  name = "zenhub_create_issue_dependency";
  description = "Create a dependency between two issues";
  inputSchema = {
    type: "object",
    properties: {
      blocking_issue_id: {
        type: "string",
        description: "ID of the blocking issue",
      },
      blocked_issue_id: {
        type: "string",
        description: "ID of the blocked issue",
      },
    },
    required: ["blocking_issue_id", "blocked_issue_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { blocking_issue_id, blocked_issue_id } = args;

    const result = await sdk.createIssueDependency({
      input: {
        blockingIssue: blocking_issue_id,
        blockedIssue: blocked_issue_id,
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

class DeleteIssueDependencyTool extends BaseTool {
  name = "zenhub_delete_issue_dependency";
  description = "Delete a dependency between two issues";
  inputSchema = {
    type: "object",
    properties: {
      dependency_id: { type: "string", description: "Issue dependency ID" },
    },
    required: ["dependency_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { dependency_id } = args;

    const result = await sdk.deleteIssueDependency({
      input: {
        blockingIssue: {
          issueNumber: dependency_id,
        },
        blockedIssue: {
          issueNumber: dependency_id,
        },
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

export const dependencyTools: ZenHubTool[] = [
  new CreateIssueDependencyTool(),
  new DeleteIssueDependencyTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));