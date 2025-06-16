import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";
import fetch from 'cross-fetch'
class CreateEpicTool extends BaseTool {
  name = "zenhub_create_epic";
  description = "Create a new epic in ZenHub. Optionally, you can also specify existing issue IDs that should be added as children of the new epic.";
  inputSchema = {
    type: "object",
    properties: {
      title: { type: "string", description: "Epic title" },
      repository_id: { type: "string", description: "Repository ID" },
      body: { type: "string", description: "Epic description" },
      epic_child_ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of issue IDs to add as children of the newly created epic",
      },
    },
    required: ["title", "repository_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { title, repository_id, body, epic_child_ids } = args;

    // Step 1: Create the issue that will become the epic
    const createEpicResult = await sdk.createEpic({
      input: {
        issue: {
          title,
          repositoryId: repository_id,
          body: body || "",
        },
      },
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const createdIssue = createEpicResult?.createEpic?.epic?.issue;

    // Ensure we have the GitHub issue URL and extract owner, repo, and issue number from it
    const issueUrl = createdIssue?.htmlUrl ?? "";
    const match = issueUrl.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);

    if (!match) {
      throw new Error(`Unable to parse issue URL returned from createEpic: ${issueUrl}`);
    }

    const [_, owner, repo, issueNumber] = match;

    if(!process.env.GITHUB_PAT) {
      throw new Error("Error: User needs to set GITHUB_PAT in their MCP config.");
    }

    const patchUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

    const response = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        type: "Epic"
      })
    });

    if(!response.ok) {
      throw new Error(`Failed to update issue: ${response.statusText}: Details: ${await response.text()}`);
    }

    if (!createdIssue) {
      throw new Error("Failed to create the underlying issue for the epic");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              createEpic: createEpicResult?.createEpic?.epic,
            },
            null,
            2
          ),
        },
      ],
    };
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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { epic_id, title, description } = args;

    const result = await sdk.updateZenhubEpic({
      input: {
        zenhubEpicId: epic_id,
        ...(title && { title }),
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

class UpdateEpicDatesTool extends BaseTool {
  name = "zenhub_update_epic_dates";
  description = "Update epic's start and end dates";
  inputSchema = {
    type: "object",
    properties: {
      epic_id: { type: "string", description: "Epic ID" },
      start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
      end_date: { type: "string", description: "End date (YYYY-MM-DD)" },
    },
    required: ["epic_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { epic_id, start_date, end_date } = args;

    const result = await sdk.updateZenhubEpicDates({
      input: {
        zenhubEpicId: epic_id,
        startOn: start_date,
        endOn: end_date,
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

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { epic_id } = args;

    const result = await sdk.deleteZenhubEpic({
      input: {
        zenhubEpicId: epic_id,
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

export const epicTools: ZenHubTool[] = [
  new CreateEpicTool(),
  // new CreateEpicWithNewIssuesTool(),
  // new CreateZenhubEpicTool(),
  new UpdateEpicTool(),
  new UpdateEpicDatesTool(),
  new DeleteEpicTool(),
].map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));