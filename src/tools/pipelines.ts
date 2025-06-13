import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

class CreatePipelineTool extends BaseTool {
  name = "zenhub_create_pipeline";
  description = "Create a new pipeline in a workspace";
  inputSchema = {
    type: "object",
    properties: {
      
      name: { type: "string", description: "Pipeline name" },
      workspace_id: { type: "string", description: "Workspace ID" },
      description: { type: "string", description: "Pipeline description" },
    },
    required: ["name", "workspace_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { name, workspace_id, description = "" } = args;

    const mutation = gql`
      mutation createPipeline($input: CreatePipelineInput!) {
        createPipeline(input: $input) {
          pipeline {
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
        workspaceId: workspace_id,
        description,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class UpdatePipelineTool extends BaseTool {
  name = "zenhub_update_pipeline";
  description = "Update a pipeline";
  inputSchema = {
    type: "object",
    properties: {
      
      pipeline_id: { type: "string", description: "Pipeline ID" },
      name: { type: "string", description: "Pipeline name" },
      description: { type: "string", description: "Pipeline description" },
    },
    required: ["pipeline_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { pipeline_id, name, description } = args;

    const mutation = gql`
      mutation updatePipeline($input: UpdatePipelineInput!) {
        updatePipeline(input: $input) {
          pipeline {
            id
            name
            description
          }
        }
      }
    `;

    const variables = {
      input: {
        id: pipeline_id,
        ...(name && { name }),
        ...(description && { description }),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class DeletePipelineTool extends BaseTool {
  name = "zenhub_delete_pipeline";
  description = "Delete a pipeline";
  inputSchema = {
    type: "object",
    properties: {
      
      pipeline_id: { type: "string", description: "Pipeline ID" },
    },
    required: ["pipeline_id"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { pipeline_id } = args;

    const mutation = gql`
      mutation deletePipeline($input: DeletePipelineInput!) {
        deletePipeline(input: $input) {
          clientMutationId
        }
      }
    `;

    const variables = {
      input: {
        id: pipeline_id,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

class GetWorkspacePipelinesTool extends BaseTool {
  name = "zenhub_get_workspace_pipelines";
  description = "Get all pipelines in a workspace";
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
      query getWorkspacePipelines($workspaceId: ID!) {
        workspace(id: $workspaceId) {
          id
          name
          pipelinesConnection {
            nodes {
              id
              name
              description
              issues {
                totalCount
              }
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

export const pipelineTools: ZenHubTool[] = [
  new CreatePipelineTool(),
  new UpdatePipelineTool(),
  new DeletePipelineTool(),
  new GetWorkspacePipelinesTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));