import { issueTools } from "./issues.js";
import { queryTools } from "./queries.js";
import { epicTools } from "./epics.js";
import { workspaceTools } from "./workspaces.js";
import { sprintTools } from "./sprints.js";
import { pipelineTools } from "./pipelines.js";
import { milestoneTools } from "./milestones.js";
import { dependencyTools } from "./dependencies.js";
import { labelTools } from "./labels.js";
import { userTools } from "./users.js";
import { repositoryTools } from "./repositories.js";
import { ZenHubTool, ToolCategory } from "../types.js";

export const toolCategories: ToolCategory[] = [
  { name: "Issue Management", tools: issueTools },
  { name: "Epic Management", tools: epicTools },
  { name: "Workspace Management", tools: workspaceTools },
  { name: "Repository Management", tools: repositoryTools },
  { name: "Sprint Management", tools: sprintTools },
  { name: "Pipeline Management", tools: pipelineTools },
  { name: "Milestone Management", tools: milestoneTools },
  { name: "Dependency Management", tools: dependencyTools },
  { name: "Label Management", tools: labelTools },
  { name: "User Management", tools: userTools },
  { name: "Query Tools", tools: queryTools },
];

export const allTools: ZenHubTool[] = toolCategories.flatMap(category => category.tools);

export function getToolByName(name: string): ZenHubTool | undefined {
  return allTools.find(tool => tool.name === name);
}