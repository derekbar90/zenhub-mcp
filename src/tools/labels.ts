import { GraphQLClient } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class CreateGithubLabelTool extends BaseTool {
  name = "zenhub_create_github_label";
  description = "Create a GitHub label";
  inputSchema = {
    type: "object",
    properties: {
      
      repository_id: { type: "string", description: "Repository ID" },
      name: { type: "string", description: "Label name" },
      color: { type: "string", description: "Label color (hex without #)" },
      description: { type: "string", description: "Label description" },
    },
    required: ["repository_id", "name", "color"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { repository_id, name, color, description } = args;

    const mutation = `
      mutation createGithubLabel($input: CreateGithubLabelInput!) {
        createGithubLabel(input: $input) {
          label {
            id
            name
            color
            description
          }
        }
      }
    `;

    const variables = {
      input: {
        repositoryId: repository_id,
        name,
        color,
        ...(description && { description }),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class CreateZenhubLabelTool extends BaseTool {
  name = "zenhub_create_zenhub_label";
  description = "Create a ZenHub label";
  inputSchema = {
    type: "object",
    properties: {
      
      workspace_id: { type: "string", description: "Workspace ID" },
      name: { type: "string", description: "Label name" },
      color: { type: "string", description: "Label color (hex without #)" },
      description: { type: "string", description: "Label description" },
    },
    required: ["workspace_id", "name", "color"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id, name, color, description } = args;

    const mutation = `
      mutation createZenhubLabel($input: CreateZenhubLabelInput!) {
        createZenhubLabel(input: $input) {
          label {
            id
            name
            color
            description
          }
        }
      }
    `;

    const variables = {
      input: {
        workspaceId: workspace_id,
        name,
        color,
        ...(description && { description }),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class DeleteZenhubLabelsTool extends BaseTool {
  name = "zenhub_delete_zenhub_labels";
  description = "Delete ZenHub labels";
  inputSchema = {
    type: "object",
    properties: {
      
      label_ids: { type: "array", items: { type: "string" }, description: "Array of ZenHub label IDs" },
    },
    required: ["label_ids"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { label_ids } = args;

    const mutation = `
      mutation deleteZenhubLabels($input: DeleteZenhubLabelsInput!) {
        deleteZenhubLabels(input: $input) {
          successCount
        }
      }
    `;

    const variables = {
      input: {
        labelIds: label_ids,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class GetRepositoryLabelsTool extends BaseTool {
  name = "zenhub_get_repository_labels";
  description = "Get all labels in a repository";
  inputSchema = {
    type: "object",
    properties: {
      
      repository_id: { type: "string", description: "Repository ID" },
    },
    required: ["repository_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { repository_id } = args;

    const query = `
      query repository($repositoryId: ID!) {
        repository(id: $repositoryId) {
          id
          name
          labels {
            nodes {
              id
              name
              color
              description
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

class GetWorkspaceLabelsTool extends BaseTool {
  name = "zenhub_get_workspace_labels";
  description = "Get all ZenHub labels in a workspace";
  inputSchema = {
    type: "object",
    properties: {
      
      workspace_id: { type: "string", description: "Workspace ID" },
    },
    required: ["workspace_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { workspace_id } = args;

    const query = `
      query workspace($workspaceId: ID!) {
        workspace(id: $workspaceId) {
          id
          name
          zenhubLabels {
            nodes {
              id
              name
              color
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

export const labelTools: ZenHubTool[] = [
  new CreateGithubLabelTool(),
  new CreateZenhubLabelTool(),
  new DeleteZenhubLabelsTool(),
  new GetRepositoryLabelsTool(),
  new GetWorkspaceLabelsTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));