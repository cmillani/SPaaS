export const environment = {
  production: true,

  apiUrl: 'http://localhost:5000',

  uploadDataEndpoint: '/api/data/',
  getFilesEndpoint: '/api/data/',
  getFileEndpoint: '/api/data/',
  deleteDataEndpoint: '/api/data/',

  uploadToolsEndpoint: '/api/tools/',
  getToolsEndpoint: '/api/tools/',
  deleteToolsEnpoint: '/api/tools/',
  getParametersEndpoint: '/api/tools/',
  getToolEnpoint: '/api/tools/',

  submitTaskEndpoint: '/api/tasks/submit/',
  getResultsBlobEndpoints: '/api/results/',
  statusEndpoint: '/api/status/',
  getResultBlobEndpoints: '/api/results/',
  getResultEndpoints: '/api/results/',
  deleteResultEndpoints: '/api/results/',

  foldersEndpoints: '/api/folders/',
  groupsEndpoints: '/api/groups/',

  shareEndpoint: (id) => {return `/api/entities/${id}/accesslist/`},
  getPathEndpoint: (id) => {return `/api/entities/${id}/path/`},
  moveFolderEndpoint: (id) => {return `/api/entities/${id}/path/`},

  addGroupMemberEndpoint: (id) => {return `/api/groups/${id}/accesslist/`}
};
