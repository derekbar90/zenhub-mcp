import { GraphQLClient } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

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

  async handle(args: ToolArgs, client: GraphQLClient) {
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

export const workspaceTools: ZenHubTool[] = [
  new CreateWorkspaceTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));