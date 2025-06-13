import { gql } from "graphql-request";

export const CreateIssueDependencyDocument = gql`
    mutation createIssueDependency($input: CreateIssueDependencyInput!) {
  createIssueDependency(input: $input) {
    issueDependency {
      id
      blockingIssue {
        id
        title
      }
      blockedIssue {
        id
        title
      }
    }
  }
}
    `;
export const DeleteIssueDependencyDocument = gql`
    mutation deleteIssueDependency($input: DeleteIssueDependencyInput!) {
  deleteIssueDependency(input: $input) {
    issueDependency {
      id
    }
  }
}
    `;
export const CreateEpicDocument = gql`
    mutation createEpic($input: CreateEpicInput!) {
  createEpic(input: $input) {
    epic {
      id
      issue {
        id
        title
        number
        htmlUrl
      }
    }
  }
}
    `;
export const CreateIssueDocument = gql`
    mutation createIssue($input: CreateIssueInput!) {
  createIssue(input: $input) {
    issue {
      id
      title
      number
      htmlUrl
      state
    }
  }
}
    `;
export const AddIssuesToEpicsDocument = gql`
    mutation addIssuesToEpics($input: AddIssuesToEpicsInput!) {
  addIssuesToEpics(input: $input) {
    epics {
      id
    }
  }
}
    `;
export const CreateZenhubEpicDocument = gql`
    mutation createZenhubEpic($input: CreateZenhubEpicInput!) {
  createZenhubEpic(input: $input) {
    zenhubEpic {
      id
      title
    }
  }
}
    `;
export const UpdateZenhubEpicDocument = gql`
    mutation updateZenhubEpic($input: UpdateZenhubEpicInput!) {
  updateZenhubEpic(input: $input) {
    zenhubEpic {
      id
      title
    }
  }
}
    `;
export const UpdateZenhubEpicDatesDocument = gql`
    mutation updateZenhubEpicDates($input: UpdateZenhubEpicDatesInput!) {
  updateZenhubEpicDates(input: $input) {
    zenhubEpic {
      id
      startOn
      endOn
    }
  }
}
    `;
export const DeleteZenhubEpicDocument = gql`
    mutation deleteZenhubEpic($input: DeleteZenhubEpicInput!) {
  deleteZenhubEpic(input: $input) {
    zenhubEpicId
  }
}
    `;
export const CloseIssuesDocument = gql`
    mutation closeIssues($input: CloseIssuesInput!) {
  closeIssues(input: $input) {
    successCount
  }
}
    `;
export const ReopenIssuesDocument = gql`
    mutation reopenIssues($input: ReopenIssuesInput!) {
  reopenIssues(input: $input) {
    successCount
  }
}
    `;
export const MoveIssueDocument = gql`
    mutation moveIssue($input: MoveIssueInput!) {
  moveIssue(input: $input) {
    issue {
      id
    }
  }
}
    `;
export const AddAssigneesToIssuesDocument = gql`
    mutation addAssigneesToIssues($input: AddAssigneesToIssuesInput!) {
  addAssigneesToIssues(input: $input) {
    successCount
  }
}
    `;
export const AddLabelsToIssuesDocument = gql`
    mutation addLabelsToIssues($input: AddLabelsToIssuesInput!) {
  addLabelsToIssues(input: $input) {
    successCount
  }
}
    `;
export const SetEstimateDocument = gql`
    mutation setEstimate($input: SetEstimateInput!) {
  setEstimate(input: $input) {
    clientMutationId
  }
}
    `;
export const SetMultipleEstimatesDocument = gql`
    mutation setMultipleEstimates($input: SetMultipleEstimatesInput!) {
  setMultipleEstimates(input: $input) {
    issues {
      id
    }
  }
}
    `;
export const UpdateIssueDocument = gql`
    mutation updateIssue($input: UpdateIssueInput!) {
  updateIssue(input: $input) {
    issue {
      id
      title
      body
    }
  }
}
    `;
export const RemoveAssigneesFromIssuesDocument = gql`
    mutation removeAssigneesFromIssues($input: RemoveAssigneesFromIssuesInput!) {
  removeAssigneesFromIssues(input: $input) {
    successCount
  }
}
    `;
export const RemoveLabelsFromIssuesDocument = gql`
    mutation removeLabelsFromIssues($input: RemoveLabelsFromIssuesInput!) {
  removeLabelsFromIssues(input: $input) {
    successCount
  }
}
    `;
export const CreateIssueWithEpicDocument = gql`
    mutation createIssueWithEpic($createInput: CreateIssueInput!, $addToEpicInput: AddIssuesToEpicsInput!) {
  createIssue(input: $createInput) {
    issue {
      id
      title
      number
      htmlUrl
      state
    }
  }
  addIssuesToEpics(input: $addToEpicInput) {
    epics {
      id
    }
  }
}
    `;
export const RemoveIssuesFromEpicsDocument = gql`
    mutation removeIssuesFromEpics($input: RemoveIssuesFromEpicsInput!) {
  removeIssuesFromEpics(input: $input) {
    epics {
      id
    }
  }
}
    `;
export const CreateGithubLabelDocument = gql`
    mutation createGithubLabel($input: CreateGithubLabelInput!) {
  createGithubLabel(input: $input) {
    label {
      id
      name
      color
      description
    }
  }
}
    `;
export const CreateZenhubLabelDocument = gql`
    mutation createZenhubLabel($input: CreateZenhubLabelInput!) {
  createZenhubLabel(input: $input) {
    zenhubLabel {
      id
      name
      color
      description
    }
  }
}
    `;
export const DeleteZenhubLabelsDocument = gql`
    mutation deleteZenhubLabels($input: DeleteZenhubLabelsInput!) {
  deleteZenhubLabels(input: $input) {
    zenhubLabels {
      id
    }
  }
}
    `;
export const GetRepositoryLabelsDocument = gql`
    query getRepositoryLabels($repositoryGhId: Int!) {
  repositoriesByGhId(ghIds: [$repositoryGhId]) {
    id
    name
    labels {
      nodes {
        id
        name
        color
        description
      }
    }
  }
}
    `;
export const GetWorkspaceLabelsDocument = gql`
    query getWorkspaceLabels($workspaceId: ID!) {
  workspace(id: $workspaceId) {
    id
    name
    zenhubLabels {
      nodes {
        id
        name
        color
        description
      }
    }
  }
}
    `;
export const CreateMilestoneDocument = gql`
    mutation createMilestone($input: CreateMilestoneInput!) {
  createMilestone(input: $input) {
    milestone {
      id
      title
      description
      dueOn
    }
  }
}
    `;
export const UpdateMilestoneDocument = gql`
    mutation updateMilestone($input: UpdateMilestoneInput!) {
  updateMilestone(input: $input) {
    milestone {
      id
      title
      description
      dueOn
    }
  }
}
    `;
export const AddMilestoneToIssuesDocument = gql`
    mutation addMilestoneToIssues($input: AddMilestoneForIssuesInput!) {
  addMilestoneToIssues(input: $input) {
    successCount
  }
}
    `;
export const RemoveMilestoneToIssuesDocument = gql`
    mutation removeMilestoneToIssues($input: RemoveMilestoneForIssuesInput!) {
  removeMilestoneToIssues(input: $input) {
    successCount
  }
}
    `;
export const DeleteMilestoneDocument = gql`
    mutation deleteMilestone($input: DeleteMilestoneInput!) {
  deleteMilestone(input: $input) {
    milestone {
      id
    }
  }
}
    `;
export const CreatePipelineDocument = gql`
    mutation createPipeline($input: CreatePipelineInput!) {
  createPipeline(input: $input) {
    pipeline {
      id
      name
      description
    }
  }
}
    `;
export const UpdatePipelineDocument = gql`
    mutation updatePipeline($input: UpdatePipelineInput!) {
  updatePipeline(input: $input) {
    pipeline {
      id
      name
      description
    }
  }
}
    `;
export const DeletePipelineDocument = gql`
    mutation deletePipeline($input: DeletePipelineInput!) {
  deletePipeline(input: $input) {
    clientMutationId
  }
}
    `;
export const GetWorkspacePipelinesDocument = gql`
    query getWorkspacePipelines($workspaceId: ID!) {
  workspace(id: $workspaceId) {
    id
    name
    pipelinesConnection {
      nodes {
        id
        name
        description
        issues {
          totalCount
        }
      }
    }
  }
}
    `;
export const SearchIssuesByPipelineDocument = gql`
    query searchIssuesByPipeline($pipelineId: ID!, $query: String, $filters: IssueSearchFiltersInput!) {
  searchIssuesByPipeline(
    pipelineId: $pipelineId
    query: $query
    filters: $filters
  ) {
    nodes {
      id
      title
      number
    }
  }
}
    `;
export const SearchIssuesDocument = gql`
    query searchIssues($workspaceId: ID!, $user: String!, $repoIds: [ID!]!, $pipelineIds: [ID!]!) {
  searchIssues(
    workspaceId: $workspaceId
    query: $user
    filters: {pipelineIds: $pipelineIds, repositoryIds: $repoIds}
  ) {
    nodes {
      id
      state
      body
      state
      labels {
        nodes {
          id
          name
        }
      }
      closedAt
      creator {
        id
        githubUser {
          login
        }
        name
      }
      estimate {
        value
      }
      htmlUrl
      assignees {
        nodes {
          id
          login
        }
      }
    }
  }
}
    `;
export const WorkspaceIssuesDocument = gql`
    query workspaceIssues($workspaceId: ID!, $after: String) {
  workspace(id: $workspaceId) {
    issues(after: $after) {
      nodes {
        id
        pullRequest
        type
        title
        number
        state
        assignees {
          nodes {
            name
            id
            ghId
            login
          }
        }
        parentZenhubEpics {
          totalCount
        }
        repository {
          name
          ownerName
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
    `;
export const ViewerDocument = gql`
    query viewer {
  viewer {
    id
    name
    email
    imageUrl
    githubUser {
      login
      avatarUrl
    }
  }
}
    `;
export const IssueByInfoDocument = gql`
    query issueByInfo($repositoryGhId: Int!, $issueNumber: Int!) {
  issueByInfo(repositoryGhId: $repositoryGhId, issueNumber: $issueNumber) {
    id
    title
    number
    state
    htmlUrl
    labels {
      nodes {
        name
      }
    }
    assignees {
      nodes {
        login
      }
    }
    milestone {
      title
    }
  }
}
    `;
export const RepositoriesByGhIdDocument = gql`
    query repositoriesByGhId($ghIds: [Int!]!) {
  repositoriesByGhId(ghIds: $ghIds) {
    id
    name
    ownerName
    ghId
    owner {
      login
    }
  }
}
    `;
export const GetWorkspaceRepositoriesDocument = gql`
    query getWorkspaceRepositories($workspaceId: ID!) {
  workspace(id: $workspaceId) {
    id
    name
    description
    repositoriesConnection {
      nodes {
        id
        ghId
        createdAt
        name
        description
      }
    }
  }
}
    `;
export const GetRepositoriesByGhIdsDocument = gql`
    query getRepositoriesByGhIds($ghIds: [Int!]!) {
  repositoriesByGhId(ghIds: $ghIds) {
    id
    ghId
    name
    description
    ownerName
    createdAt
    updatedAt
    workspacesConnection {
      nodes {
        id
        name
      }
    }
  }
}
    `;
export const AddRepositoryToWorkspaceDocument = gql`
    mutation addRepositoryToWorkspace($input: AddRepositoryToWorkspaceInput!) {
  addRepositoryToWorkspace(input: $input) {
    workspaceRepository {
      id
      repository {
        id
        ghId
        name
        description
      }
      workspace {
        id
        name
      }
    }
  }
}
    `;
export const DisconnectWorkspaceRepositoryDocument = gql`
    mutation disconnectWorkspaceRepository($input: DisconnectWorkspaceRepositoryInput!) {
  disconnectWorkspaceRepository(input: $input) {
    workspace {
      id
      name
    }
  }
}
    `;
export const GetRepositoryDetailsDocument = gql`
    query getRepositoryDetails($repositoryId: ID!) {
  node(id: $repositoryId) {
    ... on Repository {
      id
      ghId
      name
      description
      ownerName
      createdAt
      updatedAt
      workspacesConnection {
        nodes {
          id
          name
          description
        }
      }
      issues(first: 5) {
        totalCount
        nodes {
          id
          number
          title
          state
        }
      }
      milestones(first: 5) {
        totalCount
        nodes {
          id
          title
          state
        }
      }
      labels(first: 10) {
        totalCount
        nodes {
          id
          name
          color
        }
      }
    }
  }
}
    `;
export const GetRepositoryAssignableUsersDocument = gql`
    query getRepositoryAssignableUsers($repositoryId: ID!, $first: Int) {
  node(id: $repositoryId) {
    ... on Repository {
      id
      name
      assignableUsers(first: $first) {
        totalCount
        nodes {
          id
          login
          name
          zenhubUser {
            imageUrl
            githubUser {
              login
              avatarUrl
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
    `;
export const CreateSprintConfigDocument = gql`
    mutation createSprintConfig($input: CreateSprintConfigInput!) {
  createSprintConfig(input: $input) {
    sprintConfig {
      id
      name
    }
  }
}
    `;
export const UpdateSprintDocument = gql`
    mutation updateSprint($input: UpdateSprintInput!) {
  updateSprint(input: $input) {
    sprint {
      id
      name
      startAt
      endAt
      state
    }
  }
}
    `;
export const AddIssuesToSprintsDocument = gql`
    mutation addIssuesToSprints($input: AddIssuesToSprintsInput!) {
  addIssuesToSprints(input: $input) {
    sprintIssues {
      id
    }
  }
}
    `;
export const RemoveIssuesFromSprintsDocument = gql`
    mutation removeIssuesFromSprints($input: RemoveIssuesFromSprintsInput!) {
  removeIssuesFromSprints(input: $input) {
    sprints {
      id
    }
  }
}
    `;
export const DeleteSprintConfigAndOpenSprintsDocument = gql`
    mutation deleteSprintConfigAndOpenSprints($input: DeleteSprintConfigAndOpenSprintsInput!) {
  deleteSprintConfigAndOpenSprints(input: $input) {
    workspace {
      id
    }
  }
}
    `;
export const GetWorkspaceSprintsDocument = gql`
    query getWorkspaceSprints($workspaceId: ID!) {
  workspace(id: $workspaceId) {
    id
    name
    sprints {
      nodes {
        id
        name
        startAt
        endAt
        state
        issues {
          totalCount
        }
      }
    }
  }
}
    `;
export const GetWorkspaceUsersDocument = gql`
    query getWorkspaceUsers($workspaceId: ID!) {
  workspace(id: $workspaceId) {
    id
    name
    description
    assignees {
      totalCount
      nodes {
        id
        ghId
        login
        name
        zenhubUser {
          email
        }
      }
    }
  }
}
    `;
export const OwnerByLoginDocument = gql`
    query ownerByLogin($login: String!) {
  ownerByLogin(login: $login) {
    id
    login
    avatarUrl
    ... on User {
      name
    }
    ... on Organization {
      login
    }
  }
}
    `;
export const OwnerByGhIdDocument = gql`
    query ownerByGhId($ghId: Int!) {
  ownerByGhId(ghId: $ghId) {
    id
    login
    avatarUrl
    ... on User {
      name
    }
    ... on Organization {
      login
    }
  }
}
    `;
export const SearchWorkspaceUsersDocument = gql`
    query searchWorkspaceUsers($workspaceId: ID!) {
  workspace(id: $workspaceId) {
    zenhubUsers {
      nodes {
        id
        name
        email
      }
    }
  }
}
    `;
export const SearchOwnerByLoginDocument = gql`
    query searchOwnerByLogin($login: String!) {
  ownerByLogin(login: $login) {
    id
    login
    avatarUrl
    ... on User {
      name
    }
  }
}
    `;
export const CreateWorkspaceDocument = gql`
    mutation createWorkspace($input: CreateWorkspaceInput!) {
  createWorkspace(input: $input) {
    workspace {
      id
      name
      description
    }
  }
}
    `;
export const GetUserWorkspacesFromOrgsDocument = gql`
    query getUserWorkspacesFromOrgs($first: Int) {
  viewer {
    zenhubOrganizations(first: 10) {
      nodes {
        id
        name
        workspaces(first: $first) {
          nodes {
            id
            name
            description
            pipelinesConnection {
              totalCount
            }
            repositoriesConnection {
              totalCount
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
}
    `;
export const SearchUserWorkspacesDocument = gql`
    query searchUserWorkspaces($query: String!, $first: Int) {
  viewer {
    searchWorkspaces(query: $query, first: $first) {
      nodes {
        id
        name
        description
        pipelinesConnection {
          totalCount
        }
        repositoriesConnection {
          totalCount
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
    `;
export const GetUserOrganizationsDocument = gql`
    query getUserOrganizations($query: String, $first: Int) {
  viewer {
    zenhubOrganizations(query: $query, first: $first) {
      nodes {
        id
        name
        workspaces {
          totalCount
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
    `;
export const GetWorkspaceOverviewDocument = gql`
    query getWorkspaceOverview($workspaceId: ID!) {
  workspace(id: $workspaceId) {
    id
    name
    description
    pipelinesConnection {
      totalCount
      nodes {
        id
        name
        description
        issues {
          totalCount
        }
      }
    }
    repositoriesConnection {
      totalCount
      nodes {
        id
        name
        ownerName
        issues {
          totalCount
        }
      }
    }
    zenhubEpics(first: 20) {
      totalCount
      nodes {
        id
        title
        childIssues(workspaceId: $workspaceId) {
          totalCount
        }
        startOn
        endOn
      }
    }
    zenhubUsers {
      totalCount
      nodes {
        githubUser {
          login
          avatarUrl
          name
        }
        name
        email
      }
    }
  }
}
    `;
export const GetOrganizationWorkspacesDocument = gql`
    query getOrganizationWorkspaces($query: String, $first: Int) {
  viewer {
    zenhubOrganizations(query: $query, first: $first) {
      nodes {
        id
        name
        workspaces(first: $first) {
          nodes {
            id
            name
            description
            pipelinesConnection {
              totalCount
            }
            repositoriesConnection {
              totalCount
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
}
    `;