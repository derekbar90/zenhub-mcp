import { getSdk } from "../../generated/graphql.js";
import { BaseTool } from "../base.js";
import { ToolArgs, ZenHubTool } from "../../types.js";

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

    const createdIssueId = createEpicResult?.createEpic?.epic?.issue?.id;

    if (!createdIssueId) {
      throw new Error("Failed to create the underlying issue for the epic");
    }

    // Step 2: Convert the issue into an epic and optionally attach children
    const convertResult = await sdk.createEpicFromIssue({
      input: {
        issueId: createdIssueId,
        epicChildIds: epic_child_ids ?? [],
      },
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              createEpic: createEpicResult?.createEpic?.epic,
              convertToEpic: convertResult?.createEpicFromIssue?.epic,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

// class CreateEpicWithNewIssuesTool extends BaseTool {
//   name = "zenhub_create_epic_with_new_issues";
//   description =
//     "Create a new epic and multiple new issues, then add them to the epic";
//   inputSchema = {
//     type: "object",
//     properties: {
//       epic_title: { type: "string", description: "Epic title" },
//       epic_repository_id: {
//         type: "string",
//         description: "Repository ID for the epic",
//       },
//       epic_body: { type: "string", description: "Epic description" },
//       issues: {
//         type: "array",
//         items: {
//           type: "object",
//           properties: {
//             title: { type: "string", description: "Issue title" },
//             repository_id: {
//               type: "string",
//               description: "Repository ID for the issue",
//             },
//             body: { type: "string", description: "Issue body/description" },
//             labels: {
//               type: "array",
//               items: { type: "string" },
//               description: "Issue labels",
//             },
//             assignees: {
//               type: "array",
//               items: { type: "string" },
//               description: "GitHub usernames to assign",
//             },
//           },
//           required: ["title", "repository_id"],
//         },
//         description: "Array of issues to create and add to the epic",
//       },
//     },
//     required: ["epic_title", "epic_repository_id", "issues"],
//   };

//   async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
//     const { epic_title, epic_repository_id, epic_body, issues } = args;

//     try {
//       const createEpicResult = await sdk.createEpic({
//         input: {
//           issue: {
//             title: epic_title,
//             repositoryId: epic_repository_id,
//             body: epic_body || "",
//           },
//         },
//       });

//       const epicId = createEpicResult?.createEpic?.epic?.id;
//       if (!epicId) {
//         throw new Error("Failed to create epic");
//       }
//       const createdIssues = [];

//       for (const issue of issues) {
//         const {
//           title,
//           repository_id,
//           body,
//           labels = [],
//           assignees = [],
//         } = issue;

//         const createIssueResult = await sdk.createIssue({
//           input: {
//             title,
//             repositoryId: repository_id,
//             body: body || "",
//             labels,
//             assignees,
//           },
//         });

//         createdIssues.push(createIssueResult?.createIssue?.issue);
//       }

//       const issueIds = createdIssues.map((issue) => issue?.id).filter(Boolean) as string[];

//       const addToEpicResult = await sdk.addIssuesToEpics({
//         input: {
//           issueIds,
//           epicIds: [epicId],
//         },
//       });

//       return {
//         content: [
//           {
//             type: "text" as const,
//             text: JSON.stringify(
//               {
//                 createdEpic: createEpicResult?.createEpic?.epic,
//                 createdIssues,
//                 addedToEpic: addToEpicResult?.addIssuesToEpics?.epics,
//               },
//               null,
//               2
//             ),
//           },
//         ],
//       };
//     } catch (error) {
//       throw new Error(
//         `Error creating epic with new issues: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//     }
//   }
// }

// class CreateZenhubEpicTool extends BaseTool {
//   name = "zenhub_create_zenhub_epic";
//   description = "Create a new ZenHub epic";
//   inputSchema = {
//     type: "object",
//     properties: {
//       title: { type: "string", description: "Epic title" },
//       workspace_id: { type: "string", description: "Workspace ID" },
//       description: { type: "string", description: "Epic description" },
//     },
//     required: ["title", "workspace_id"],
//   };

//   async handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>) {
//     const { title, workspace_id, description } = args;

//     const result = await sdk.createZenhubEpic({
//       input: {
//         title,
//         workspaceId: workspace_id,
//         ...(description && { description }),
//       },
//     });

//     return {
//       content: [
//         {
//           type: "text" as const,
//           text: JSON.stringify(result, null, 2),
//         },
//       ],
//     };
//   }
// }

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