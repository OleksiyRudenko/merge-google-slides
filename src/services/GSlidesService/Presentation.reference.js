// Slides structure

const presentationTopStructure = {
  presentationId: "from API",
  title: "arbitrary",
  pageSize: {},
  locale: "per standard: en-GB",
  revisionId: "from API",
  masters: [{}],
  notesMaster: {},
  layouts: [{}],
  slides: [{}],
};

const presentationReferences = {
  masters: [
    {
      objectId: "unique",
      pageType: "MASTER",
      masterProperties: {
        displayName: "arbitrary",
      },
      pageProperties: {},
      pageElements: [{}],
    },
    {},
  ],
  notesMaster: {
    objectId: "unique",
    pageType: "NOTES_MASTER",
    pageProperties: {},
    pageElements: [
      {objectId: 'n:slide'},
      {objectId: 'n:text'},
    ],
  },
  layouts: [
    {
      objectId: "unique",
      pageType: "LAYOUT",
      layoutProperties: {
        masterObjectId: "REF# masters[].objectId",
        name: "{ENUM}",                 // TITLE, SECTION_HEADER, TITLE_AND_BODY, TITLE_AND_TWO_COLUMNS, TITLE_ONLY,
                                        // ONE_COLUMN_TEXT, MAIN_POINT, SECTION_TITLE_AND_DESCRIPTION, CAPTION_ONLY
                                        // BIG_NUMBER, BLANK
        displayName: "{ENUM defaults}", // Title slide, Section header,...
      },
      pageProperties: {},
      pageElements: [{},],
    },
    {},
  ],
  slides: [
    {
      objectId: "unique",
      slideProperties: {
        layoutObjectId: "REF# layouts[].objectId",
        masterObjectId: "REF# masters[].objectId",
        notesPage: {
          objectId: "unique", // p:notes
          pageType: "NOTES",
          pageProperties: {},
          pageElements: [
            {
              objectId: "unique",
              // ...
              shape: { // possibly other pageElement types
                // ...
                placeholder: {
                  type: "{ENUM}", // SLIDE_IMAGE
                  parentObjectId: "REF# notesMaster.pageElements[].objectId" // n:slide
                },
              }
            },
            {
              objectId: "unique", // i3
              // ...
              shape: { // possibly other pageElement types
                // ...
                placeholder: {
                  type: "{ENUM}", // BODY
                  parentObjectId: "REF# notesMaster.pageElements[].objectId" // n:text
                },
              }
            },
          ],
          notesProperties: {
            speakerNotesObjectId: "REF# ..pageElements[where shape.placeholder.type==BODY].objectId", // i3
          },
        },
      },
      pageProperties: {},
      pageElements: [
        {},
      ],
    },
  ],
};

const regularPageElement = {
  objectId: "unique",
  size: {},
  transform: {},
  ELEMENT_TYPE: {
    TYPE: '',
    TYPE_Properties: {},
    text: {},
    placeholder: {
      type: "{ENUM}", // CENTERED_TITLE
      parentObjectId: "REF# layouts[..slide.layoutObjectId].objectId ?",
    },
  },
  elementGroup: { children: []},
};

