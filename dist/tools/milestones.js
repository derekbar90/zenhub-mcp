import { BaseTool } from "./base.js";
class CreateMilestoneTool extends BaseTool {
    name = "zenhub_create_milestone";
    description = "Create a milestone";
    inputSchema = {
        type: "object",
        properties: {
            title: { type: "string", description: "Milestone title" },
            repository_id: { type: "string", description: "Repository ID" },
            description: { type: "string", description: "Milestone description" },
            due_date: { type: "string", description: "Due date (ISO format)" },
            start_date: { type: "string", description: "Start date (ISO format)" },
        },
        required: ["title", "repository_id"],
    };
    async handle(args, client) {
        const { title, repository_id, description, due_date, start_date } = args;
        const mutation = `
      mutation createMilestone($input: CreateMilestoneInput!) {
        createMilestone(input: $input) {
          milestone {
            id
            title
            description
            dueOn
          }
        }
      }
    `;
        const variables = {
            input: {
                title,
                repositoryId: repository_id,
                ...(description && { description }),
                ...(due_date && { dueOn: due_date }),
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class UpdateMilestoneTool extends BaseTool {
    name = "zenhub_update_milestone";
    description = "Update a milestone";
    inputSchema = {
        type: "object",
        properties: {
            milestone_id: { type: "string", description: "Milestone ID" },
            title: { type: "string", description: "Milestone title" },
            description: { type: "string", description: "Milestone description" },
            due_date: { type: "string", description: "Due date (ISO format)" },
            start_date: { type: "string", description: "Start date (ISO format)" },
        },
        required: ["milestone_id"],
    };
    async handle(args, client) {
        const { milestone_id, title, description, due_date, start_date } = args;
        const mutation = `
      mutation updateMilestone($input: UpdateMilestoneInput!) {
        updateMilestone(input: $input) {
          milestone {
            id
            title
            description
            dueOn
          }
        }
      }
    `;
        const variables = {
            input: {
                id: milestone_id,
                ...(title && { title }),
                ...(description && { description }),
                ...(due_date && { dueOn: due_date }),
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class AddMilestoneToIssuesTool extends BaseTool {
    name = "zenhub_add_milestone_to_issues";
    description = "Add milestone to multiple issues";
    inputSchema = {
        type: "object",
        properties: {
            issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
            milestone_id: { type: "string", description: "Milestone ID" },
        },
        required: ["issue_ids", "milestone_id"],
    };
    async handle(args, client) {
        const { issue_ids, milestone_id } = args;
        const mutation = `
      mutation addMilestoneToIssues($input: AddMilestoneToIssuesInput!) {
        addMilestoneToIssues(input: $input) {
          successCount
        }
      }
    `;
        const variables = {
            input: {
                issueIds: issue_ids,
                milestoneId: milestone_id,
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
class RemoveMilestoneFromIssuesTool extends BaseTool {
    name = "zenhub_remove_milestone_from_issues";
    description = "Remove milestone from multiple issues";
    inputSchema = {
        type: "object",
        properties: {
            issue_ids: { type: "array", items: { type: "string" }, description: "Array of issue IDs" },
        },
        required: ["issue_ids"],
    };
    async handle(args, client) {
        const { issue_ids } = args;
        const mutation = `
      mutation removeMilestoneToIssues($input: RemoveMilestoneToIssuesInput!) {
        removeMilestoneToIssues(input: $input) {
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
class DeleteMilestoneTool extends BaseTool {
    name = "zenhub_delete_milestone";
    description = "Delete a milestone";
    inputSchema = {
        type: "object",
        properties: {
            milestone_id: { type: "string", description: "Milestone ID" },
        },
        required: ["milestone_id"],
    };
    async handle(args, client) {
        const { milestone_id } = args;
        const mutation = `
      mutation deleteMilestone($input: DeleteMilestoneInput!) {
        deleteMilestone(input: $input) {
          success
        }
      }
    `;
        const variables = {
            input: {
                id: milestone_id,
            },
        };
        return this.executeGraphQL(client, mutation, variables);
    }
}
export const milestoneTools = [
    new CreateMilestoneTool(),
    new UpdateMilestoneTool(),
    new AddMilestoneToIssuesTool(),
    new RemoveMilestoneFromIssuesTool(),
    new DeleteMilestoneTool(),
].map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    handler: tool.handle.bind(tool),
}));
