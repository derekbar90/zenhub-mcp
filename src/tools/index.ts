import { issueTools } from "./issues/index.js";
import { queryTools } from "./queries/index.js";
import { epicTools } from "./epics/index.js";
import { workspaceTools } from "./workspaces/index.js";
import { sprintTools } from "./sprints/index.js";
import { pipelineTools } from "./pipelines/index.js";
import { milestoneTools } from "./milestones/index.js";
import { dependencyTools } from "./dependencies/index.js";
import { labelTools } from "./labels/index.js";
import { userTools } from "./users/index.js";
import { repositoryTools } from "./repositories/index.js";
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