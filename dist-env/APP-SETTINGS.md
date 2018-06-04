# Application Settings

The tokens below are referred to in [README.md](README.md).

`[Bracketed pieces]` are reservations for future use.

Also check [Reference section](#reference) for related
useful resources.

```text
DEV_EMAIL   = oleksiy.rudenko@gmail.com

APP_ID      = 79318749743
APP_NAME    = Merge Google Slides
APP_NAME_SHORT =
              Merge Google Slides
APP_DOMAIN  = https://oleksiyrudenko.github.io
APP_ROOT    = https://oleksiyrudenko.github.io/merge-google-slides/
APP_OPEN    = APP_ROOT/#!/link/{ids}{exportIds}

APP_DOC_PP  = APP_ROOT/#!/privacypolicy/
APP_DOC_TOS = APP_ROOT/#!/tos/

APP_DESCR_SHORT =
            Merge Google Slides decks into a single deck.

APP_DESCR_CWS =
            A configurable tool to merge Google Slides decks

APP_DESCR_LONG =
            A configurable tool to merge Google Slides decks

ICO_URL     = APP_ROOT + [dimensions.ext]
              - any image filename with dimensions specified
              - png? - means any image format
              - 120x120max - means max size of 120px x 120px
              Required ico dimensions:
              - web-site : favicon.ico
              - Google Drive UI Integration: png 256px, 128px, 64px, 32px, 16px

APP_OAUTH_SCOPES =
            https://www.googleapis.com/auth/userinfo.email
            https://www.googleapis.com/auth/userinfo.profile
            https://www.googleapis.com/auth/drive.install
            https://www.googleapis.com/auth/drive.readonly
            // https://www.googleapis.com/auth/drive.file
            // https://www.googleapis.com/auth/drive.metadata
            // https://www.googleapis.com/auth/drive

APP_MIME_TYPES =
            application/vnd.google-apps.presentation

APP_CWS_URL = https://chrome.google.com/webstore/detail/???

APP_CWS_DEV = https://chrome.google.com/webstore/developer/dashboard?pli=1&authuser=1

```

## Reference

 * [App Open URL Tokens](https://developers.google.com/drive/v3/web/enable-sdk#open_url)
 * OAuth Scopes:
   - [Drive API v2 Auth](https://developers.google.com/drive/v2/web/about-auth)
   - [Drive API v3 Auth](https://developers.google.com/drive/v3/web/about-auth)
   - [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/googlescopes)
   - [OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/OAuth2UserAgent)
