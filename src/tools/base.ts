import { getSdk } from "../generated/graphql.js";
import { ToolArgs, ToolResponse } from "../types.js";

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: object;

  abstract handle(args: ToolArgs, sdk: ReturnType<typeof getSdk>): Promise<ToolResponse>;
}