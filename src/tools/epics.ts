import { GraphQLClient } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class CreateEpicTool extends BaseTool {
  name = "zenhub_create_epic";
  description = "Create a new epic in ZenHub";
  inputSchema = {
    type: "object",
    properties: {
      
      title: { type: "string", description: "Epic title" },
      repository_id: { type: "string", description: "Repository ID" },
      body: { type: "string", description: "Epic description" },
    },
    required: ["title", "repository_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { title, repository_id, body } = args;

    const mutation = `
      mutation createEpic($input: CreateEpicInput!) {
        createEpic(input: $input) {
          epic {
            id
            issue {
              id
              title
              number
              htmlUrl
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        issue: {
          title,
          repositoryId: repository_id,
          body: body || "",
        },
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class CreateZenhubEpicTool extends BaseTool {
  name = "zenhub_create_zenhub_epic";
  description = "Create a new ZenHub epic";
  inputSchema = {
    type: "object",
    properties: {
      
      title: { type: "string", description: "Epic title" },
      workspace_id: { type: "string", description: "Workspace ID" },
      description: { type: "string", description: "Epic description" },
    },
    required: ["title", "workspace_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { title, workspace_id, description } = args;

    const mutation = `
      mutation createZenhubEpic($input: CreateZenhubEpicInput!) {
        createZenhubEpic(input: $input) {
          epic {
            id
            title
            description
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
        workspaceId: workspace_id,
        ...(description && { description }),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class UpdateEpicTool extends BaseTool {
  name = "zenhub_update_epic";
  description = "Update an epic";
  inputSchema = {
    type: "object",
    properties: {
      
      epic_id: { type: "string", description: "Epic ID" },
      title: { type: "string", description: "Epic title" },
      description: { type: "string", description: "Epic description" },
    },
    required: ["epic_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { epic_id, title, description } = args;

    const mutation = `
      mutation updateZenhubEpic($input: UpdateZenhubEpicInput!) {
        updateZenhubEpic(input: $input) {
          epic {
            id
            title
            description
          }
        }
      }
    `;

    const variables = {
      input: {
        id: epic_id,
        ...(title && { title }),
        ...(description && { description }),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class UpdateEpicDatesTool extends BaseTool {
  name = "zenhub_update_epic_dates";
  description = "Update epic's start and end dates";
  inputSchema = {
    type: "object",
    properties: {
      
      epic_id: { type: "string", description: "Epic ID" },
      start_date: { type: "string", description: "Start date (ISO format)" },
      end_date: { type: "string", description: "End date (ISO format)" },
    },
    required: ["epic_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { epic_id, start_date, end_date } = args;

    const mutation = `
      mutation updateZenhubEpicDates($input: UpdateZenhubEpicDatesInput!) {
        updateZenhubEpicDates(input: $input) {
          epic {
            id
            startOn
            endOn
          }
        }
      }
    `;

    const variables = {
      input: {
        id: epic_id,
        ...(start_date && { startOn: start_date }),
        ...(end_date && { endOn: end_date }),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class DeleteEpicTool extends BaseTool {
  name = "zenhub_delete_epic";
  description = "Delete an epic";
  inputSchema = {
    type: "object",
    properties: {
      
      epic_id: { type: "string", description: "Epic ID" },
    },
    required: ["epic_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { epic_id } = args;

    const mutation = `
      mutation deleteZenhubEpic($input: DeleteZenhubEpicInput!) {
        deleteZenhubEpic(input: $input) {
          success
        }
      }
    `;

    const variables = {
      input: {
        id: epic_id,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

export const epicTools: ZenHubTool[] = [
  new CreateEpicTool(),
  new CreateZenhubEpicTool(),
  new UpdateEpicTool(),
  new UpdateEpicDatesTool(),
  new DeleteEpicTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));