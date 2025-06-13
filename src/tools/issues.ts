import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { BaseTool } from "./base.js";
import { ToolArgs, ZenHubTool } from "../types.js";

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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { title, repository_id, body, labels = [], assignees = [] } = args;

    const mutation = gql`
      mutation createIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          issue {
            id
            title
            number
            htmlUrl
            state
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
        repositoryId: repository_id,
        body: body || "",
        labels,
        assignees,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids } = args;

    const mutation = gql`
      mutation closeIssues($input: CloseIssuesInput!) {
        closeIssues(input: $input) {
          successCount
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, pipeline_id, position = "START" } = args;

    const mutation = gql`
      mutation reopenIssues($input: ReopenIssuesInput!) {
        reopenIssues(input: $input) {
          successCount
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        pipelineId: pipeline_id,
        position,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, pipeline_id, position } = args;

    const mutation = gql`
      mutation moveIssue($input: MoveIssueInput!) {
        moveIssue(input: $input) {
          issue { id }
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        pipelineId: pipeline_id,
        position,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, assignees } = args;

    const mutation = gql`
      mutation addAssigneesToIssues($input: AddAssigneesToIssuesInput!) {
        addAssigneesToIssues(input: $input) {
          successCount
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        assignees,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, labels } = args;

    const mutation = gql`
      mutation addLabelsToIssues($input: AddLabelsToIssuesInput!) {
        addLabelsToIssues(input: $input) {
          successCount
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        labels,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_id, value } = args;

    const mutation = gql`
      mutation setEstimate($input: SetEstimateInput!) {
        setEstimate(input: $input) {
          clientMutationId
        }
      }
    `;

    const variables = {
      input: {
        issueId: issue_id,
        value,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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
            issue_id: { type: "string" },
            value: { type: "number" }
          },
          required: ["issue_id", "value"]
        },
        description: "Array of issue ID and estimate value pairs" 
      },
    },
    required: ["estimates"],
  };

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { estimates } = args;

    const mutation = gql`
      mutation setMultipleEstimates($input: SetMultipleEstimatesInput!) {
        setMultipleEstimates(input: $input) {
          issues { id }
        }
      }
    `;

    const variables = {
      input: {
        estimates: estimates.map((est: any) => ({
          issueId: est.issue_id,
          value: est.value,
        })),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_id, title, body } = args;

    const mutation = gql`
      mutation updateIssue($input: UpdateIssueInput!) {
        updateIssue(input: $input) {
          issue {
            id
            title
            body
          }
        }
      }
    `;

    const variables = {
      input: {
        id: issue_id,
        ...(title && { title }),
        ...(body && { body }),
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, assignees } = args;

    const mutation = gql`
      mutation removeAssigneesFromIssues($input: RemoveAssigneesFromIssuesInput!) {
        removeAssigneesFromIssues(input: $input) {
          successCount
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        assignees,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, labels } = args;

    const mutation = gql`
      mutation removeLabelsFromIssues($input: RemoveLabelsFromIssuesInput!) {
        removeLabelsFromIssues(input: $input) {
          successCount
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        labels,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, epic_ids } = args;

    const mutation = gql`
      mutation addIssuesToEpics($input: AddIssuesToEpicsInput!) {
        addIssuesToEpics(input: $input) {
          epics { id }
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        epicIds: epic_ids,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
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

  async handle(args: ToolArgs, client: GraphQLClient) {
    const { issue_ids, epic_ids } = args;

    const mutation = gql`
      mutation removeIssuesFromEpics($input: RemoveIssuesFromEpicsInput!) {
        removeIssuesFromEpics(input: $input) {
          epics { id }
        }
      }
    `;

    const variables = {
      input: {
        issueIds: issue_ids,
        epicIds: epic_ids,
      },
    };

    return this.executeGraphQL(client, mutation, variables);
  }
}

export const issueTools: ZenHubTool[] = [
  new CreateIssueTool(),
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