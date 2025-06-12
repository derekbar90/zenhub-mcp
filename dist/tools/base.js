export class BaseTool {
    async executeGraphQL(client, query, variables = {}) {
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
        }
        catch (error) {
            throw new Error(`GraphQL Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
