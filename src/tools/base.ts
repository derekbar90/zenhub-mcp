import { GraphQLClient } from "graphql-request";
import { ToolArgs, ToolResponse } from "../types.js";

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: any;

  protected async executeGraphQL(
    client: GraphQLClient,
    query: string,
    variables: any = {}
  ): Promise<ToolResponse> {
    try {
      const result = await client.request(query, variables);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`GraphQL Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  abstract handle(args: ToolArgs, client: GraphQLClient): Promise<ToolResponse>;
}