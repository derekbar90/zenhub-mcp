import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";
import fetch from 'cross-fetch';

class CreateIssueTool extends BaseTool {
  name = "zenhub_create_issue";
  description = "Create a new GitHub issue via ZenHub";
  inputSchema = {
    type: "object",
    properties: {
      title: { type: "string", description: "Issue title" },
      repository_id: { type: "string", description: "Repository ID" },
      body: { type: "string", description: "Issue body/description" },
      labels: { type: "array", items: { type: "string" }, description: "Issue labels" },
      assignees: { type: "array", items: { type: "string" }, description: "GitHub usernames to assign" },
    },
    required: ["title", "repository_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { title, repository_id, body, labels = [], assignees = [] } = args;

    const result = await sdk.createIssue({
      input: {
        title,
        repositoryId: repository_id,
        body: body || "",
        labels,
        assignees,
      },
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Determine the GitHub issue URL from the mutation response so we can patch the new issue's `type` field
    const createdIssue = result?.createIssue?.issue;
    const issueUrl = createdIssue?.htmlUrl ?? "";
    const match = issueUrl.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);

    if (!match) {
      throw new Error(`Unable to parse issue URL returned from createIssue: ${issueUrl}`);
    }

    const [_, owner, repo, issueNumber] = match;

    if (!process.env.GITHUB_PAT) {
      throw new Error("Error: User needs to set GITHUB_PAT in their MCP config.");
    }

    // Heuristic: if the provided labels include "bug" we mark the issue as a Bug, otherwise default to Task
    const desiredType = (labels || []).some((l: string) => l.toLowerCase() === "bug") ? "Bug" : "Task";

    const patchUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

    const response = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        type: desiredType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update issue: ${response.statusText}: Details: ${await response.text()}`);
    }

    const patchedIssue = await response.json();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            createdIssue: createdIssue,
            updatedIssue: patchedIssue,
          }, null, 2),
        },
      ],
    };
  }
}

class CloseIssuesTool extends BaseTool {
  name = "zenhub_close_issues";
  description = "Close one or more issues";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
    },
    required: ["issue_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids } = args;

    const result = await sdk.closeIssues({
      input: {
        issueIds: issue_ids,
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

class ReopenIssuesTool extends BaseTool {
  name = "zenhub_reopen_issues";
  description = "Reopen one or more closed issues";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      pipeline_id: { type: "string", description: "Pipeline ID to move issues to" },
      position: { type: "string", enum: ["START", "END"], description: "Position in pipeline" },
    },
    required: ["issue_ids", "pipeline_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, pipeline_id, position = "START" } = args;

    const result = await sdk.reopenIssues({
      input: {
        issueIds: issue_ids,
        pipelineId: pipeline_id,
        position,
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

class MoveIssueTool extends BaseTool {
  name = "zenhub_move_issue";
  description = "Move issues to a position in a pipeline";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      pipeline_id: { type: "string", description: "Pipeline ID to move issues to" },
      position: { type: "number", description: "Position in pipeline (0-based)" },
    },
    required: ["issue_ids", "pipeline_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, pipeline_id, position } = args;

    const result = await sdk.moveIssue({
      input: {
        issueId: issue_ids,
        pipelineId: pipeline_id,
        position,
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

class AddAssigneesToIssuesTool extends BaseTool {
  name = "zenhub_add_assignees_to_issues";
  description = "Add assignees to multiple issues";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      assignees: { type: "array", items: { type: "string" }, description: "Array of GitHub usernames" },
    },
    required: ["issue_ids", "assignees"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, assignees } = args;

    const result = await sdk.addAssigneesToIssues({
      input: {
        issueIds: issue_ids,
        assigneeIds: assignees,
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

class AddLabelsToIssuesTool extends BaseTool {
  name = "zenhub_add_labels_to_issues";
  description = "Add labels to multiple issues";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      labels: { type: "array", items: { type: "string" }, description: "Array of label names" },
    },
    required: ["issue_ids", "labels"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, labels } = args;

    const result = await sdk.addLabelsToIssues({
      input: {
        issueIds: issue_ids,
        labelIds: labels,
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

class SetEstimateTool extends BaseTool {
  name = "zenhub_set_estimate";
  description = "Set an estimate for an issue";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_id: { type: "string", description: "Issue ID" },
      value: { type: "number", description: "Estimate value" },
    },
    required: ["issue_id", "value"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_id, value } = args;

    const result = await sdk.setEstimate({
      input: {
        issueId: issue_id,
        value,
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

class SetMultipleEstimatesTool extends BaseTool {
  name = "zenhub_set_multiple_estimates";
  description = "Set estimates on multiple issues";
  inputSchema = {
    type: "object",
    properties: {
      estimates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            issue_id: { type: "string", description: "Issue ID" },
            value: { type: "number", description: "Estimate value" },
          },
          required: ["issue_id", "value"],
        },
        description: "Array of estimates to set",
      },
    },
    required: ["estimates"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { estimates } = args;

    const results = await Promise.all(
      estimates.map((est: any) =>
        sdk.setEstimate({
          input: {
            issueId: est.issue_id,
            value: est.value,
          },
        })
      )
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
}

class UpdateIssueTool extends BaseTool {
  name = "zenhub_update_issue";
  description = "Update an existing issue";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_id: { type: "string", description: "Issue ID" },
      title: { type: "string", description: "Issue title" },
      body: { type: "string", description: "Issue body/description" },
    },
    required: ["issue_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_id, title, body } = args;

    const result = await sdk.updateIssue({
      input: {
        issueId: issue_id,
        title,
        body,
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

class RemoveAssigneesFromIssuesTool extends BaseTool {
  name = "zenhub_remove_assignees_from_issues";
  description = "Remove assignees from multiple issues";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      assignees: { type: "array", items: { type: "string" }, description: "Array of GitHub usernames" },
    },
    required: ["issue_ids", "assignees"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, assignees } = args;

    const result = await sdk.removeAssigneesFromIssues({
      input: {
        issueIds: issue_ids,
        assigneeIds: assignees,
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

class RemoveLabelsFromIssuesTool extends BaseTool {
  name = "zenhub_remove_labels_from_issues";
  description = "Remove labels from multiple issues";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      labels: { type: "array", items: { type: "string" }, description: "Array of label names" },
    },
    required: ["issue_ids", "labels"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, labels } = args;

    const result = await sdk.removeLabelsFromIssues({
      input: {
        issueIds: issue_ids,
        labelIds: labels,
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

class CreateIssueWithEpicTool extends BaseTool {
  name = "zenhub_create_issue_with_epic";
  description = "Create a new issue and add it to an existing epic";
  inputSchema = {
    type: "object",
    properties: {
      title: { type: "string", description: "Issue title" },
      repository_id: { type: "string", description: "Repository ID" },
      body: { type: "string", description: "Issue body/description" },
      labels: { type: "array", items: { type: "string" }, description: "Issue labels" },
      assignees: { type: "array", items: { type: "string" }, description: "GitHub usernames to assign" },
      epic_id: { type: "string", description: "Epic ID to add the issue to" },
    },
    required: ["title", "repository_id", "epic_id"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { title, repository_id, body, labels = [], assignees = [], epic_id } = args;

    try {
      const createResult = await sdk.createIssue({
        input: {
          title,
          repositoryId: repository_id,
          body: body || "",
          labels,
          assignees,
        },
      });

      const issueId = createResult?.createIssue?.issue?.id;

      if (!issueId) {
        throw new Error("Failed to create issue");
      }

      const addToEpicResult = await sdk.addIssuesToEpics({
        input: {
          issueIds: [issueId],
          epicIds: [epic_id],
        },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              createdIssue: createResult.createIssue?.issue,
              addedToEpic: addToEpicResult.addIssuesToEpics?.epics,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error creating issue with epic: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

class AddIssuesToEpicsTool extends BaseTool {
  name = "zenhub_add_issues_to_epics";
  description = "Add issues to epics";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      epic_ids: { type: "array", items: { type: "string" }, description: "Array of epic IDs" },
    },
    required: ["issue_ids", "epic_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, epic_ids } = args;

    const result = await sdk.addIssuesToEpics({
      input: {
        issueIds: issue_ids,
        epicIds: epic_ids,
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

class RemoveIssuesFromEpicsTool extends BaseTool {
  name = "zenhub_remove_issues_from_epics";
  description = "Remove issues from epics";
  inputSchema = {
    type: "object",
    properties: {
      
      issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
      epic_ids: { type: "array", items: { type: "string" }, description: "Array of epic IDs" },
    },
    required: ["issue_ids", "epic_ids"],
  };

  async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
    const { issue_ids, epic_ids } = args;

    const result = await sdk.removeIssuesFromEpics({
      input: {
        issueIds: issue_ids,
        epicIds: epic_ids,
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

export const issueTools: ZenHubTool[] = [
  new CreateIssueTool(),
  // new CreateIssueWithEpicTool(),
  new UpdateIssueTool(),
  new CloseIssuesTool(),
  new ReopenIssuesTool(),
  new MoveIssueTool(),
  new AddAssigneesToIssuesTool(),
  new RemoveAssigneesFromIssuesTool(),
  new AddLabelsToIssuesTool(),
  new RemoveLabelsFromIssuesTool(),
  new SetEstimateTool(),
  new SetMultipleEstimatesTool(),
  new AddIssuesToEpicsTool(),
  new RemoveIssuesFromEpicsTool(),
].map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  handler: tool.handle.bind(tool),
}));