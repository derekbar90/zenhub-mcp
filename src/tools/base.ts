import { GraphQLClient } from "graphql-request";
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { ToolArgs, ToolResponse } from "../types.js";

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: object;

  protected async executeGraphQL<TResult = any, TVariables extends Record<string, any> = Record<string, any>>(
    client: GraphQLClient,
    query: string | TypedDocumentNode<TResult, TVariables>,
    variables: TVariables = {} as TVariables
  ): Promise<ToolResponse> {
    try {
      const result = await client.request<TResult>(query, variables);
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