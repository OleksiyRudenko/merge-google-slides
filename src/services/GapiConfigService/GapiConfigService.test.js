import GapiConfigService from "./GapiConfigService";
import "url-search-params-polyfill";

const gapiConfig = {
  general: {
    applicationid: '11318749711', // used by e.g. Integrate with Google button generator
  },
  oauth: {
    default: {
      clientId: '11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
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
      apiKey: 'aazaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWaa',
    },
    gDriveInstall: {
      // redirect_uri: gapiParams.gDrive.installationCallBackUrl,
      response_type: 'code',
      approval_prompt: 'force',
      access_type: 'offline',
    },
  },
};

it('initializes', () => {
  GapiConfigService.init(gapiConfig);
});

it('produces default oAuthObject as expected', () => {
  expect(GapiConfigService.getOAuthObject()).toEqual({
    clientId: '11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://slides.googleapis.com/$discovery/rest?version=v1",
    ],
    scope: 'https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations',
  });
});

it('produces apiKey oAuthObject as expected', () => {
  expect(GapiConfigService.getOAuthObject('apiKey')).toEqual({
    apiKey: 'aazaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWaa',
    clientId: '11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://slides.googleapis.com/$discovery/rest?version=v1",
    ],
    scope: 'https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations',
  });
});

it('produces apiKey+gDriveInstall oAuthObject as expected', () => {
  expect(GapiConfigService.getOAuthObject(['apiKey', 'gDriveInstall'])).toEqual({
    clientId: '11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
    apiKey: 'aazaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWaa',
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://slides.googleapis.com/$discovery/rest?version=v1",
    ],
    scope: 'https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations',
    response_type: 'code',
    approval_prompt: 'force',
    access_type: 'offline',
  });
});

it('produces apiKey+gDriveInstall+custom oAuthObject as expected', () => {
  expect(GapiConfigService.getOAuthObject(['apiKey', 'gDriveInstall', {redirect_uri: '/install', response_type: 'anotherCode' }])).toEqual({
    clientId: '11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
    apiKey: 'aazaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWaa',
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://slides.googleapis.com/$discovery/rest?version=v1",
    ],
    redirect_uri: '/install',
    scope: 'https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations',
    response_type: 'anotherCode',
    approval_prompt: 'force',
    access_type: 'offline',
  });
});

it('adds oauth property and produces default oAuthObject as expected', () => {
  GapiConfigService.setRedirectUri('/redirect-to-url');
  expect(GapiConfigService.getOAuthObject()).toEqual({
    clientId: '11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com',
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://slides.googleapis.com/$discovery/rest?version=v1",
    ],
    redirect_uri: '/redirect-to-url',
    scope: 'https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations',
  });
});

it('renders default oauth url properly', () => {
  expect(GapiConfigService.getOAuthUri({},{},'https://google/'))
    .toBe('https://google/?clientId=11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com&discoveryDocs=https%3A%2F%2Fwww.googleapis.com%2Fdiscovery%2Fv1%2Fapis%2Fdrive%2Fv3%2Frest%2Chttps%3A%2F%2Fslides.googleapis.com%2F%24discovery%2Frest%3Fversion%3Dv1&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.install+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fpresentations&redirect_uri=%2Fredirect-to-url');
});

it('renders filtered oauth search uri properly', () => {
  expect(GapiConfigService.getOAuthUri({
    redirect_uri: 'redirect_uri',
    client_id: 'clientId',
    response_type: 'response_type',
    approval_prompt: 'approval_prompt',
    access_type: 'access_type',
    scope: null,
  },'gDriveInstall'))
    .toBe('redirect_uri=%2Fredirect-to-url&client_id=11318749711-6phfjh4h3jn1iro2t5uaf7t4ajai92s8.apps.googleusercontent.com&response_type=code&approval_prompt=force&access_type=offline&scope=');
});

