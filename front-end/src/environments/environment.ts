// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  frontend: 'http://localhost:4200',

  authApiPath: 'http://localhost:3000',

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
