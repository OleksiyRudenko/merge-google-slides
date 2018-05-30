# Merge Google Slides

A configurable tool to merge Google Slides decks

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
#### Table of Contents

- [Features](#features)
  - [Definitions](#definitions)
  - [Features detailed](#features-detailed)
- [Config file](#config-file)
  - [Settings](#settings)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

### Definitions

 * Drive - Google Drive™
 * Slides - Google Slides
 * Sheets - Google Sheets
 * GND - Google Native Documents
 * deck - Slides deck (file)
 * config file - Sheets file with project settings

[_^ back to TOC ^_](#table-of-contents)

### Features detailed

 * Import data
   - [ ] call from Drive context
   - [ ] call with a list of Slides
   - [ ] call with a config file
   - [ ] when called with config file and Slides decks
         referred to in config file come first and in order
         as per config files, other decks follow
   - [ ] add Slides from app context
   - [ ] remove decks
 * Process
   - [ ] reorder Slides decks
   - [ ] choose Slides deck to be a source of layouts and
         styles
   - [ ] preserve layouts and/or styles per selected Slides decks
   - [ ] trim initial N slides for every deck
   - [ ] trim trailing N slides for every deck
   - [ ] preserve initial slides for deck #1
   - [ ] preserve trailing slides for last deck
   - [ ] select slides to trim
   - [ ] preview decks (5 initial + 3 trailing slides | all)
   - [ ] preview output
   - [ ] silent mode switch (no previews)
 * Result output
   - [ ] output result filename is...
     - [ ] == config file setting
     - [ ] == config file name if employed
     - [ ] == deck #1 file name + `(YYYY-MM-DD)`
     - [ ] if target file exists then optional `(YYYY-MM-DD)` +
           optional version modifier added,
           overwrite action confirmation requested
     - [ ] editable
     - [ ] for `.png` set `000` modifier is added
   - [ ] output result is...
     - [ ] Slides
     - [ ] `.pdf`
     - [ ] set of `.png`
   - [ ] output location is...
     - [ ] as per config file
     - [ ] == config file location
     - [ ] == Slides deck #1 location
     - [ ] editable
   - [ ] if destination files already exist then those
         are replaced (updated) to preserve Drive ids
 * Misc
   - [ ] create/update config file as per current setup
   - [ ] manage output file access
   - [ ] forward output file to GD LinkMan

[_^ back to TOC ^_](#table-of-contents)

## Config file

### Settings

 * Sheet #1
   - Output filename
   - Output location
   - Silent mode
   - layout and styles source deck Drive id
 * Sheet #2, each row contains
   - deck file Drive id | path | sharing URL
   - deck filename
   - keep deck's own layouts flag
   - keep deck's own styles flag
   - number of initial slides to trim
   - number of trailing slides to trim
   - CSV of slides ids to keep (remove?) - overrides the trimming settings

[_^ back to TOC ^_](#table-of-contents)
