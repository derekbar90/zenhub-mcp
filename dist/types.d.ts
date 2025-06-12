import { GraphQLClient } from "graphql-request";
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
    handler: (args: ToolArgs, client: GraphQLClient) => Promise<ToolResponse>;
}
export interface ToolCategory {
    name: string;
    tools: ZenHubTool[];
}
