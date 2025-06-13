import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class CreateIssueDependencyTool extends BaseTool {
  name = "zenhub_create_issue_dependency";
  description = "Create a dependency between two issues";
  inputSchema = {
    type: "object",
    properties: {
      
      blocking_issue_id: { type: "string", description: "ID of the blocking issue" },
      blocked_issue_id: { type: "string", description: "ID of the blocked issue" },
    },
    required: ["blocking_issue_id", "blocked_issue_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { blocking_issue_id, blocked_issue_id } = args;

    const mutation = gql`
      mutation createIssueDependency($input: CreateIssueDependencyInput!) {
        createIssueDependency(input: $input) {
          issueDependency {
            id
            blockingIssue {
              id
              title
            }
            blockedIssue {
              id
              title
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        blockingIssueId: blocking_issue_id,
        blockedIssueId: blocked_issue_id,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { dependency_id } = args;

    const mutation = gql`
      mutation deleteIssueDependency($input: DeleteIssueDependencyInput!) {
        deleteIssueDependency(input: $input) {
          issueDependency {
            id
          }
        }
      }
    `;

    const variables = {
      input: {
        id: dependency_id,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

export const dependencyTools: ZenHubTool[] = [
  new CreateIssueDependencyTool(),
  new DeleteIssueDependencyTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));