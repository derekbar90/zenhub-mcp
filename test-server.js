#!/usr/bin/env node

/**
 * Simple test script for the ZenHub MCP server
 * This helps debug connection issues by testing the server directly
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function testMCPServer() {
  console.log("🧪 Testing ZenHub MCP Server");
  console.log("==============================");
  
  // Test 1: Check if server starts
  console.log("\n1. Starting MCP server...");
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      // Make sure to set your API key here for testing
      ZENHUB_API_KEY: process.env.ZENHUB_API_KEY || 'zh_1f92400d02d2f0b42dce3e15bc27c1b0feab9eca353a33c0b2c13e727b986980'
    }
  });

  let serverOutput = '';
  let serverErrors = '';

  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
    console.log('📤 Server stdout:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    serverErrors += data.toString();
    console.log('📥 Server stderr:', data.toString().trim());
  });

  serverProcess.on('close', (code) => {
    console.log(`\n🔚 Server process exited with code: ${code}`);
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Server process error:', error);
  });

  // Test 2: Send a ListTools request
  console.log("\n2. Sending ListTools request...");
  
  await setTimeout(2000); // Give server time to start
  
  const listToolsRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  };

  try {
    serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    console.log("✅ ListTools request sent");
  } catch (error) {
    console.error("❌ Failed to send ListTools request:", error);
  }

  // Test 3: Send a simple tool call
  console.log("\n3. Sending simple tool call (zenhub_get_viewer)...");
  
  await setTimeout(1000);
  
  const toolCallRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "zenhub_get_viewer",
      arguments: {}
    }
  };

  try {
    serverProcess.stdin.write(JSON.stringify(toolCallRequest) + '\n');
    console.log("✅ Tool call request sent");
  } catch (error) {
    console.error("❌ Failed to send tool call:", error);
  }

  // Test 4: Test user workspaces with proper query
  console.log("\n4. Testing user workspaces with query...");
  
  await setTimeout(2000);
  
  const workspacesRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "zenhub_get_user_workspaces",
      arguments: { query: "*" }
    }
  };

  try {
    serverProcess.stdin.write(JSON.stringify(workspacesRequest) + '\n');
    console.log("✅ Workspaces request sent");
  } catch (error) {
    console.error("❌ Failed to send workspaces request:", error);
  }

  // Test 5: Test workspace issues query
  console.log("\n5. Testing workspace issues query...");
  
  await setTimeout(2000);
  
  const workspaceIssuesRequest = {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "zenhub_get_workspace_issues",
      arguments: { workspace_id: "62ea93681b31996f304eb8ab" }
    }
  };

  try {
    serverProcess.stdin.write(JSON.stringify(workspaceIssuesRequest) + '\n');
    console.log("✅ Workspace issues request sent (testing fixed repository fields)");
  } catch (error) {
    console.error("❌ Failed to send workspace issues request:", error);
  }

  // Test 6: Test repositories query (with fixed schema)
  console.log("\n6. Testing repositories query with corrected fields...");
  
  await setTimeout(2000);
  
  const repositoriesRequest = {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "zenhub_get_repositories",
      arguments: { repository_gh_ids: [43519777] }
    }
  };

  try {
    serverProcess.stdin.write(JSON.stringify(repositoriesRequest) + '\n');
    console.log("✅ Repositories request sent (testing ownerName instead of nameWithOwner)");
  } catch (error) {
    console.error("❌ Failed to send repositories request:", error);
  }

  // Wait for responses
  await setTimeout(10000);

  console.log("\n📊 Test Summary:");
  console.log("================");
  console.log("- Check the server stderr output above for detailed logging");
  console.log("- Look for '[ZenHub MCP]' prefixed messages");
  console.log("- Tests include workspace issues and repositories with FIXED schema fields");
  console.log("- Fixed: removed 'isEpic' field, replaced 'nameWithOwner' with 'name'+'ownerName'");
  console.log("- If you see successful responses without GraphQL errors, the fixes worked!");
  console.log("- If you see 'Server ready to receive requests', the server is working");
  
  // Cleanup
  console.log("\n🧹 Cleaning up...");
  serverProcess.kill('SIGTERM');
  
  await setTimeout(1000);
  process.exit(0);
}

// Handle script errors
process.on('uncaughtException', (error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

// Run the test
testMCPServer().catch(console.error);