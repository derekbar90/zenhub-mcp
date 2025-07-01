#!/usr/bin/env node

// Polyfill for AbortController in older Node.js versions
if (typeof globalThis.AbortController === "undefined") {
  const { AbortController } = await import("node-abort-controller");
  (globalThis as any).AbortController = AbortController;
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import { allTools, getToolByName } from "./tools/index.js";
import { ToolArgs, ZenHubTool } from "./types.js";
import { getSdk } from "./generated/graphql.js";

class ZenHubMCPServer {
  private server: Server;
  private graphqlClient!: GraphQLClient;
  private sdk!: ReturnType<typeof getSdk>;

  constructor() {
    this.server = new Server(
      {
        name: "zenhub-mcp-server",
        version: "1.0.0",
      },
      {
        instructions: `
        You are a helpful assistant that can help with ZenHub tasks. 
        You are thoughtful and careful with your actions. You have an understanding of when to break up larger tasks and when not to. 
        You listen to the user and are not afraid to ask for clarification. 
        Any material to you is handled with care and respect so that details are not lost and facts are not misrepresented.
        
        //Rules/Guidelines
        If assigning issues, use zenhub_get_workspace_users to find the users by listing all users in the workspace.
        Use zenhub_get_viewer to get the current user information.
        Only the labels, pipelines, repositories, and workspaces, sprints available. You will only create NEW labels, pipelines, repositories, and workspaces, sprints if the user asks you to directly. Never plan to add new labels, pipelines, repositories, and workspaces, sprints to the system.
        You will never create an issue, epic, or anything else unless confirmed by the user.

        User Provided Instructions:
        ${process.env.ZENHUB_MCP_CUSTOM_INSTRUCTIONS}

        To start any task:
        Step 1: use zenhub_get_user_workspaces to get the workspaces you have access to.
        Step 2, use zenhub_get_workspace_overview to get an overview of the workspace. 
        Step 3+: You can now use the tools and thinking to complete the task.
        `,
        capabilities: {
          tools: {},
        },
      }
    );

    try {
      this.initializeClient();

      this.setupToolHandlers();

      this.setupErrorHandling();
    } catch (error) {
      throw error;
    }
  }

  private initializeClient(): void {
    const apiKey = process.env.ZENHUB_API_KEY;

    if (!apiKey) {
      throw new Error("ZENHUB_API_KEY environment variable is required");
    }

    this.graphqlClient = new GraphQLClient(
      "https://api.zenhub.com/public/graphql",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    this.sdk = getSdk(this.graphqlClient);
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const result = {
        tools: allTools.map((tool: ZenHubTool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };

      return result;
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const tool = getToolByName(name);
        if (!tool) {
          throw new Error(`Unknown tool: ${name}`);
        }

        const result = await tool.handler(args as ToolArgs, this.sdk);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    });
  }

  // All handler methods have been moved to modular tool files

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {};

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on("uncaughtException", (error) => {
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {});
  }

  async run(): Promise<void> {
    try {
      const transport = new StdioServerTransport();

      await this.server.connect(transport);
    } catch (error) {
      throw error;
    }
  }
}

const server = new ZenHubMCPServer();
server.run().catch(console.error);
