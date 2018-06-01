export const gapiParams = {
  apiKey: '<YOUR_API_KEY>',
  clientId: '<YOUR_CLIENT_ID>',
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
  ],
  // next is intended to be joined with spaces: scope.join(' ')
  scope: [
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
};
