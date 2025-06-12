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
export const toolCategories = [
    { name: "Query Tools", tools: queryTools },
    { name: "Issue Management", tools: issueTools },
    { name: "Epic Management", tools: epicTools },
    { name: "Workspace Management", tools: workspaceTools },
    { name: "Sprint Management", tools: sprintTools },
    { name: "Pipeline Management", tools: pipelineTools },
    { name: "Milestone Management", tools: milestoneTools },
    { name: "Dependency Management", tools: dependencyTools },
    { name: "Label Management", tools: labelTools },
    { name: "User Management", tools: userTools },
];
export const allTools = toolCategories.flatMap(category => category.tools);
export function getToolByName(name) {
    return allTools.find(tool => tool.name === name);
}
