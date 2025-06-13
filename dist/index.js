#!/usr/bin/env node
// Polyfill for AbortController in older Node.js versions
if (typeof globalThis.AbortController === 'undefined') {
    console.error("[ZenHub MCP] Adding AbortController polyfill for older Node.js");
    const { AbortController } = await import('node-abort-controller');
    globalThis.AbortController = AbortController;
}
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import { allTools, getToolByName } from "./tools/index.js";
class ZenHubMCPServer {
    server;
    graphqlClient;
    constructor() {
        console.error("[ZenHub MCP] Starting server initialization...");
        this.server = new Server({
            name: "zenhub-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        console.error("[ZenHub MCP] Server instance created");
        try {
            this.initializeClient();
            console.error("[ZenHub MCP] GraphQL client initialized");
            this.setupToolHandlers();
            console.error(`[ZenHub MCP] Tool handlers setup complete (${allTools.length} tools registered)`);
            this.setupErrorHandling();
            console.error("[ZenHub MCP] Error handling setup complete");
        }
        catch (error) {
            console.error("[ZenHub MCP] Error during initialization:", error);
            throw error;
        }
    }
    initializeClient() {
        const apiKey = process.env.ZENHUB_API_KEY;
        if (!apiKey) {
            console.error("[ZenHub MCP] ERROR: ZENHUB_API_KEY environment variable not set!");
            throw new Error("ZENHUB_API_KEY environment variable is required");
        }
        console.error(`[ZenHub MCP] API key found (length: ${apiKey.length})`);
        this.graphqlClient = new GraphQLClient("https://api.zenhub.com/public/graphql", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
        console.error("[ZenHub MCP] GraphQL client configured for https://api.zenhub.com/public/graphql");
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            console.error("[ZenHub MCP] Received ListTools request");
            const result = {
                tools: allTools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                })),
            };
            console.error(`[ZenHub MCP] Returning ${result.tools.length} tools`);
            return result;
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            console.error(`[ZenHub MCP] Received CallTool request: ${name}`);
            console.error(`[ZenHub MCP] Tool arguments:`, JSON.stringify(args, null, 2));
            try {
                const tool = getToolByName(name);
                if (!tool) {
                    console.error(`[ZenHub MCP] ERROR: Tool not found: ${name}`);
                    throw new Error(`Unknown tool: ${name}`);
                }
                console.error(`[ZenHub MCP] Executing tool: ${name}`);
                const result = await tool.handler(args, this.graphqlClient);
                console.error(`[ZenHub MCP] Tool ${name} completed successfully`);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result),
                        },
                    ],
                };
            }
            catch (error) {
                console.error(`[ZenHub MCP] ERROR in tool ${name}:`, error);
                console.error(`[ZenHub MCP] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }
    // All handler methods have been moved to modular tool files
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error("[ZenHub MCP] Server error:", error);
            console.error("[ZenHub MCP] Error stack:", error.stack);
        };
        process.on("SIGINT", async () => {
            console.error("[ZenHub MCP] Received SIGINT, shutting down...");
            await this.server.close();
            process.exit(0);
        });
        process.on("uncaughtException", (error) => {
            console.error("[ZenHub MCP] Uncaught exception:", error);
            console.error("[ZenHub MCP] Error stack:", error.stack);
            process.exit(1);
        });
        process.on("unhandledRejection", (reason, promise) => {
            console.error("[ZenHub MCP] Unhandled rejection at:", promise);
            console.error("[ZenHub MCP] Reason:", reason);
        });
    }
    async run() {
        try {
            console.error("[ZenHub MCP] Starting transport connection...");
            const transport = new StdioServerTransport();
            console.error("[ZenHub MCP] Connecting to transport...");
            await this.server.connect(transport);
            console.error("[ZenHub MCP] ✅ ZenHub MCP server successfully running on stdio");
            console.error("[ZenHub MCP] Server ready to receive requests from Claude");
        }
        catch (error) {
            console.error("[ZenHub MCP] Failed to start server:", error);
            console.error("[ZenHub MCP] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        }
    }
}
const server = new ZenHubMCPServer();
server.run().catch(console.error);
