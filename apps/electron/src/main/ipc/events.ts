export enum FlowserIpcEvent {
  WORKSPACES_CLOSE = 'WORKSPACES_CLOSE',
  WORKSPACES_OPEN = 'WORKSPACES_OPEN',
  WORKSPACES_CREATE = 'WORKSPACES_CREATE',
  WORKSPACES_UPDATE = 'WORKSPACES_UPDATE',
  WORKSPACES_LIST = 'WORKSPACES_LIST',
  WORKSPACES_FIND_BY_ID = 'WORKSPACES_FIND_BY_ID',
  WORKSPACES_REMOVE = 'WORKSPACES_REMOVE',
  WORKSPACES_DEFAULT_SETTINGS = 'WORKSPACES_DEFAULT_SETTINGS',

  INDEX_GET_ALL = 'INDEX_GET_ALL',

  INTERACTIONS_PARSE = 'INTERACTIONS_PARSE',
  INTERACTIONS_LIST_TEMPLATES = 'INTERACTIONS_LIST_TEMPLATES',

  FLOW_GET_INDEX_OF_ADDRESS = "FLOW_GET_INDEX_OF_ADDRESS",
  FLOW_GET_CLI_INFO = "FLOW_GET_CLI_INFO",

}