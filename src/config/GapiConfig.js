const gapiConfig = {
  general: {
    applicationid: '79318749743', // used by e.g. Integrate with Google button generator
  },
  oauth: {
    default: {
      clientId: '79318749743-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
      // redirect_uri: undefined,
      // login_hint: user-id
      // prompt: 'select_account',
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        "https://slides.googleapis.com/$discovery/rest?version=v1",
      ],
      // next is intended to be joined with spaces: .scopeList.join(' ') into .scope
      scopeList: [
        'https://www.googleapis.com/auth/drive.install',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/presentations',
      ],
    },
    apiKey: {
      apiKey: 'AIzaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWuQ',
    },
    gDriveInstall: {
      // redirect_uri: gapiParams.gDrive.installationCallBackUrl,
      response_type: 'code',
      approval_prompt: 'force',
      access_type: 'offline',
    },
  },
};

export { gapiConfig };
