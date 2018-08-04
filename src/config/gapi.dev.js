const gapiDevParams = {
  // apiKey: 'AIzaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWuQ',
  clientId: '79318749743-9kcpponqk3af8rv4dfdffv3crjmpmo23.apps.googleusercontent.com',
  redirect_uri: undefined,
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://slides.googleapis.com/$discovery/rest?version=v1",
  ],
  // login_hint: user-id
  prompt: 'select_account',
  // next is intended to be joined with spaces: scope.join(' ')
  scope: [
    'https://www.googleapis.com/auth/drive.install',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/presentations',
  ],
  gDrive: {
    installationCallBackPath: '',
    installationCallBackUrl: undefined,
    installationCodeParamName: 'code',
  },
};

const wloc = window.location;
gapiDevParams.gDrive.installationCallBackUrl = wloc.protocol + '//' + wloc.host + wloc.pathname + gapiDevParams.gDrive.installationCallBackPath;

export { gapiDevParams };
