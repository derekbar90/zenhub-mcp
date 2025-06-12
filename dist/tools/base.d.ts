import { GraphQLClient } from "graphql-request";
import { ToolArgs, ToolResponse } from "../types.js";
export declare abstract class BaseTool {
    abstract name: string;
    abstract description: string;
    abstract inputSchema: any;
    protected executeGraphQL(client: GraphQLClient, query: string, variables?: any): Promise<ToolResponse>;
    abstract handle(args: ToolArgs, client: GraphQLClient): Promise<ToolResponse>;
}
