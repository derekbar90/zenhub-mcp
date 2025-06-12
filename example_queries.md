# Examples

This page contains examples of some of the most common queries Zenhub users run when working with the API. Use these examples as a starting point to working with the API.

## Create a Workspace
Workspaces represent the top level container all other entities in Zenhub. The createWorkspace mutation allows a user to create a new workspace within Zenhub.

Sample query
mutation createWorkspace {
  createWorkspace(input: {
      name: "Workspace Test",
      description: ",
      zenhubOrganizationId: "ZORG_ID",
      repositoryGhIds: [43519777, 62587965],
      defaultRepositoryGhId: 43519777
  }) {
      workspace {
          id
          name
      }
  }
}

## Retrieve Workspace ID
Returns the ID of a workspace, includes the repository ID.

Sample query
query {
viewer {
  id
  searchWorkspaces(query: "WORKSPACE_NAME") {
      nodes {
          id
          name
          repositoriesConnection {
              nodes {
                  id
                  name
              }
          }
      }
  }
}
}

## Create a GitHub Issue
Create a new GitHub Issue.

Sample query

mutation createIssue {
  createIssue(input: {
      title: "My new issue",
      body: "My new issue body",
      repositoryId: "REPOSITORY_ID", # eg. Z2lkOi8vcmFwdG9yL1JlcG9zaXRvcnkvMg
      labels: ["Backend", "Frontend"],
      assignees: ["github_handle"]
  }) {
      issue {
          id
          title
      }
  }
}

## Create a Zenhub Issue
Create a new Zenhub Issue.

Sample query

mutation createIssue {
  createIssue(input: {
      title: "My new issue",
      body: "My new issue body",
      repositoryId: "REPOSITORY_ID" # eg. Z2lkOi8vcmFwdG9yL1JlcG9zaXRvcnkvMQ
  }) {
      issue {
          id
          title
      }
  }
}

Note: When creating Zenhub Issues, the createIssue mutation does not currently support the labels and assignees variables. To set labels and assignees for your Zenhub Issues please call the addZenhubLabelsToIssues and addZenhubAssigneesToIssues mutations after creating your Zenhub Issue.

## Create an Epic
Creates a new Epic.

Sample query
mutation createEpic {
  createEpic(input: {
      issue: {
          repositoryId: "REPOSITORY_ID",
          title: "My new epic"
      }
  }) {
      epic {
          id
          issue {
              id
              title
          }
      }
  }
}

## Close an Issue
Close an existing Issue.

Sample query
mutation closeIssues {
  closeIssues(input: {
      issueIds: ["ISSUE_ID"]
  }) {
      successCount
  }
}

## Reopen an Issue
Reopen a closed Issue.

Sample query
mutation reopenIssues {
  reopenIssues(input: {
      issueIds: ["ISSUE_ID"]
      pipelineId: "PIPELINE_ID",
      position: START
  }) {
      successCount
  }
}

## Create a Sprint
Create a Sprint within Zenhub to add Issues and Epics to.

Sample query
mutation createSprintConfig {
createSprintConfig(input: {
   sprintConfig: {
        name: "Sprint config",
        startOn: "2022-06-09T12:00:00",
        endOn: "2022-06-15T12:00:00",
        tzIdentifier: "America/Sao_Paulo",
        workspaceId: "WORKSPACE_ID",
        settings: {
            issuesFromPipeline: {
                pipelineId: "PIPELINE_ID",
                enabled: true,
                totalStoryPoints: 30
            },
            moveUnfinishedIssues: false
        }
   }
}) {
   sprintConfig {
       id
   }
}
}

## Add Issues to a Sprint
Add an Issue to an existing Sprint.

Sample query
mutation addIssuesToSprints {
  addIssuesToSprints(input: {
      issueIds: ["ISSUE_ID"],
      sprintIds: ["SPRINT_ID"]
  }) {
      sprintIssues {
          id
      }
  }
}

## Set Issue Estimate
Set an estimate for a given Issue.

Sample query

mutation setEstimate {
  setEstimate(input: {
      value: 2,
      issueId: "ISSUE_ID"
  }) {
      clientMutationId
  }
}

##  Get all issues in a workspace
Returns all issues in a workspace (includes info about whether or not they're Zenhub vs. GitHub issues, as well as Issues vs. PRs).

Note: This query is paginated and will only return 100 issues at a time. You'll need to use the after param on issues to paginate through the results.

Sample query

query workspaceIssues {
  workspace(id: "WORKSPACE_ID") {
    issues {
      nodes {
        id
        pullRequest
        type
        title
      }
    }
  }
}

## Search for Issues by Title
Searches for Issues in a pipeline that match a title string.

Sample query
query {
searchIssuesByPipeline(
    pipelineId: "PIPELINE_ID",
    query: "my new issue"
    filters: {}
) {
  nodes {
      id
      number
      title
  }
}
}

## Search for Issues by Label
Searches for Issues in a pipeline that match a label(s).

Sample query
query {
searchIssuesByPipeline(
    pipelineId: "PIPELINE_ID",
    filters: {
        labels: { in: ["Backend"]}
    }
) {
  nodes {
      id
      number
      title
  }
}
}

## Search for Issues by Assignee
Searches for Issues in a pipeline that have a specific assignee(s).

Sample query
query {
searchIssuesByPipeline(
    pipelineId: "PIPELINE_ID",
    filters: {
        assignees: { in: ["GITHUB_HANDLE"]}
    }
) {
  nodes {
      id
      number
      title
  }
}
}

## Create a Roadmap Project
Creates a new Project on the Roadmap.

Sample query
mutation createProject {
  createProjectOnRoadmap(input: {
      roadmapId: "ROADMAP_ID",
      project: {
          name: "My project"
      }

  }) {
      project {
          id
          name
      }
      roadmap {
          id
      }
  }
}

## Set Start and End Dates for a Project
Sets the start and end dates for a Project on the Roadmap

Sample query
mutation updateProjectDates {
  updateProjectDates(input: {
      projectId: "PROJECT_ID",
      startOn: "2022-06-09T12:00:00",
      endOn: "2022-06-15T12:00:00",
      action: SCALE
  }) {
     project {
         name
         startOn
         endOn
     }
  }
}