import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated/graphql.js";

export interface ToolArgs {
  [key: string]: any;
}

export interface ToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

export interface ZenHubTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: ToolArgs, sdk: ReturnType<typeof getSdk>) => Promise<ToolResponse>;
}

export interface ToolCategory {
  name: string;
  tools: ZenHubTool[];
}