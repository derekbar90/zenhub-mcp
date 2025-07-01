# ZenHub MCP Server

An MCP (Model Context Protocol) server that provides full access to the ZenHub GraphQL API.

## Features

- **Full GraphQL Access**: Execute any GraphQL query against the ZenHub API
- **Common Operations**: Built-in tools for frequent tasks like creating issues, epics, workspaces, and sprints
- **Secure Authentication**: API key-based authentication for all requests
- **Error Handling**: Comprehensive error handling and validation

## Installation

### For Development
```bash
npm install
npm run build
```

### Setup API Key

1. Get your ZenHub API key from [ZenHub Settings](https://app.zenhub.com/settings/tokens)

2. Set the environment variable:
```bash
export ZENHUB_API_KEY=your_api_key_here
```

Or create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
# Edit .env and add your API key
```

### For Claude Desktop

1. Build the server:
```bash
npm install
npm run build
```

2. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "zenhub": {
      "command": "npx",
      "args": ["zenhub-mcp-server"],
      "env": {
        "ZENHUB_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### For Cursor

1. Build the server:
```bash
npm install
npm run build
```

2. In Cursor, go to Settings > MCP Servers and add:
```json
{
  "name": "zenhub",
  "command": "node",
  "args": ["/path/to/zenhub-mcp/dist/index.js"],
  "env": {
    "ZENHUB_API_KEY": "zh_",
    "GITHUB_PAT": "github_pat_"
  }
}
```

Or use the development server:
```json
{
  "name": "zenhub-dev",
  "command": "npm",
  "args": ["run", "dev"],
  "cwd": "/path/to/zenhub-mcp",
  "env": {
    "ZENHUB_API_KEY": "your_api_key_here"
  }
}
```

## Tools

The server provides **54 tools** across 10 categories, implementing the most commonly used ZenHub operations:

**No API key required in tool calls** - Set `ZENHUB_API_KEY` environment variable once and use all tools!

### Query Tools (7 tools)

#### `zenhub_query`
Execute any GraphQL query against the ZenHub API.
- `query` (required): GraphQL query string
- `variables` (optional): Variables for the query

#### `zenhub_search_issues`
Search for issues in a pipeline.

- `pipeline_id` (required): Pipeline ID to search in
- `query` (optional): Search query for title
- `filters` (optional): Object with filters for labels and assignees

#### `zenhub_search_issues_in_repository`
Search and filter issues inside repository.

- `repository_id` (required): Repository ID to search in
- `query` (optional): Search query
- `filters` (optional): Filter options

#### `zenhub_get_workspace_issues`
Get all issues in a workspace (paginated).

- `workspace_id` (required): Workspace ID
- `after` (optional): Cursor for pagination

#### `zenhub_get_viewer`
Get current ZenHub user information.


#### `zenhub_get_issue_by_info`
Lookup an issue by repository and issue number.

- `repository_gh_id` (required): GitHub repository ID
- `issue_number` (required): Issue number

#### `zenhub_get_repositories`
Lookup repositories by their GitHub IDs.

- `repository_gh_ids` (required): Array of GitHub repository IDs

### Issue Management (13 tools)

#### `zenhub_create_issue`
Create a new GitHub issue via ZenHub.

- `title` (required): Issue title
- `repository_id` (required): Repository ID
- `body` (optional): Issue description
- `labels` (optional): Array of label names
- `assignees` (optional): Array of GitHub usernames

#### `zenhub_close_issues`
Close one or more issues.

- `issue_ids` (required): Array of issue IDs

#### `zenhub_reopen_issues`
Reopen one or more closed issues.

- `issue_ids` (required): Array of issue IDs
- `pipeline_id` (required): Pipeline ID to move issues to
- `position` (optional): Position in pipeline (START or END)

#### `zenhub_move_issue`
Move issues to a position in a pipeline.

- `issue_ids` (required): Array of issue IDs
- `pipeline_id` (required): Pipeline ID to move issues to
- `position` (optional): Position in pipeline (0-based)

#### `zenhub_add_assignees_to_issues`
Add assignees to multiple issues.

- `issue_ids` (required): Array of issue IDs
- `assignees` (required): Array of GitHub usernames

#### `zenhub_add_labels_to_issues`
Add labels to multiple issues.

- `issue_ids` (required): Array of issue IDs
- `labels` (required): Array of label names

#### `zenhub_set_estimate`
Set an estimate for an issue.

- `issue_id` (required): Issue ID
- `value` (required): Estimate value

#### `zenhub_set_multiple_estimates`
Set estimates on multiple issues.

- `estimates` (required): Array of issue ID and estimate value pairs

#### `zenhub_add_issues_to_epics`
Add issues to epics.

- `issue_ids` (required): Array of issue IDs
- `epic_ids` (required): Array of epic IDs

### Epic Management (1 tool)

#### `zenhub_create_epic`
Create a new epic in ZenHub.

- `title` (required): Epic title
- `repository_id` (required): Repository ID
- `body` (optional): Epic description

### Workspace Management (4 tools)

#### `zenhub_get_user_workspaces`
Get all workspaces accessible to the current user.

- `query` (optional): Search query to filter workspaces
- `first` (optional): Number of workspaces to return (default: 20)

#### `zenhub_get_user_organizations`
Get all ZenHub organizations accessible to the current user.

- `query` (optional): Search query to filter organizations
- `first` (optional): Number of organizations to return (default: 10)

#### `zenhub_get_organization_workspaces`
Get all workspaces within a specific ZenHub organization.

- `organization_id` (required): ZenHub organization ID
- `query` (optional): Search query to filter workspaces
- `first` (optional): Number of workspaces to return (default: 20)

#### `zenhub_create_workspace`
Create a new workspace in ZenHub.

- `name` (required): Workspace name
- `description` (optional): Workspace description
- `organization_id` (required): ZenHub organization ID
- `repository_ids` (required): Array of GitHub repository IDs
- `default_repository_id` (optional): Default repository ID

### Sprint Management (2 tools)

#### `zenhub_create_sprint`
Create a new sprint.

- `name` (required): Sprint name
- `start_date` (required): Start date (ISO format)
- `end_date` (required): End date (ISO format)
- `workspace_id` (required): Workspace ID
- `timezone` (optional): Timezone identifier
- `settings` (optional): Sprint settings object

#### `zenhub_add_issues_to_sprints`
Add issues to sprints.

- `issue_ids` (required): Array of issue IDs
- `sprint_ids` (required): Array of sprint IDs

## Architecture

The server uses a **modular architecture** for easy expansion:

```
src/
├── index.ts           # Main MCP server
├── types.ts           # TypeScript interfaces
└── tools/
    ├── index.ts       # Tool registry
    ├── base.ts        # Base tool class
    ├── queries.ts     # Query tools
    ├── issues.ts      # Issue management tools
    ├── epics.ts       # Epic management tools
    ├── workspaces.ts  # Workspace management tools
    └── sprints.ts     # Sprint management tools
```

### Adding New Tools

1. Create a new tool class extending `BaseTool` in the appropriate category file
2. Add it to the tool export array
3. The tool will automatically be registered with the MCP server

### Available Operations Reference

All 176 available ZenHub GraphQL operations are documented in:
- `zenhub_api_operations.json` - Complete operation list with descriptions
- `mutations.json` - All 157 mutations 
- `queries.json` - All 19 queries

Current implementation covers **54 of 176 operations (30.7%)**

## Development

```bash
npm run dev
```

## Environment Variables

- `ZENHUB_API_KEY` (required): Your ZenHub API key from [ZenHub Settings](https://app.zenhub.com/settings/tokens)
- `ZENHUB_MCP_CUSTOM_INSTRUCTIONS` (optional): Provide additional instructions for the MCP server. If set, this value will be appended to the default instructions that the server sends to the model. Use regular newlines or `\n` escape sequences to format multi-line prompts.

## GraphQL Endpoint

This server connects to: `https://api.zenhub.com/public/graphql`