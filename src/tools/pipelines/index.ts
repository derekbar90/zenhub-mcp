import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";

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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { name, workspace_id, description = "" } = args;

    const result = await sdk.createPipeline({
      input: {
        name,
        workspaceId: workspace_id,
        description,
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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { pipeline_id, name, description } = args;

    const result = await sdk.updatePipeline({
      input: {
        pipelineId: pipeline_id,
        ...(name && { name }),
        ...(description && { description }),
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

class DeletePipelineTool extends BaseTool {
  name = "zenhub_delete_pipeline";
  description = "Delete a pipeline";
  inputSchema = {
    type: "object",
    properties: {
      pipeline_id: { type: "string", description: "Pipeline ID" },
      destination_pipeline_id: {
        type: "string",
        description: "Pipeline ID to move issues to",
      },
    },
    required: ["pipeline_id", "destination_pipeline_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { pipeline_id, destination_pipeline_id } = args;

    const result = await sdk.deletePipeline({
      input: {
        pipelineId: pipeline_id,
        destinationPipelineId: destination_pipeline_id,
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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { workspace_id } = args;

    const result = await sdk.getWorkspacePipelines({
      workspaceId: workspace_id,
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

export const pipelineTools: ZenHubTool[] = [
  new CreatePipelineTool(),
  new UpdatePipelineTool(),
  new DeletePipelineTool(),
  new GetWorkspacePipelinesTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));