export const gapiParams = {
  apiKey: 'AIzaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWuQ',
  clientId: '79318749743-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
  ],
  // next is intended to be joined with spaces: scope.join(' ')
  scope: [
    'https://www.googleapis.com/auth/drive.install',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
};
