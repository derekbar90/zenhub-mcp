import { ZenHubTool, ToolCategory } from "../types.js";
export declare const toolCategories: ToolCategory[];
export declare const allTools: ZenHubTool[];
export declare function getToolByName(name: string): ZenHubTool | undefined;
