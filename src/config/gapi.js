const gapiParams = {
  apiKey: 'AIzaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWuQ',
  clientId: '79318749743-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://slides.googleapis.com/$discovery/rest?version=v1",
  ],
  prompt: 'select_account',
  // next is intended to be joined with spaces: scope.join(' ')
  scope: [
    'https://www.googleapis.com/auth/drive.install',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/presentations',
  ],
  gDrive: {
    installationCallBackPath: '/install',
    installationCallBackUrl: null,
    installationCodeParamName: 'installation_code',
  },
};

const wloc = window.location;
gapiParams.gDrive.installationCallBackUrl = wloc.protocol + '//' + wloc.host + gapiParams.gDrive.installationCallBackPath;

export { gapiParams };
