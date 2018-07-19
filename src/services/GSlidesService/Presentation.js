import * as xobject from "../../utils/xobject/xobject";
import {bindHandlers} from "../../utils/bind";

/**
 * A class representing Google Slides Presentation.
 * To have only core parts (i.e. masters, notes master, layout, and atomic properties):
 * const {slides, ...partial} = source;
 * new Presentation(partial)
 */
export default class Presentation {
  p = null;
  constructor(presentation = null, clone = false) {
    if (clone && typeof presentation !== 'string') {
      this.presentationClone = presentation;
    } else {
      this.presentation = presentation;
    }
    bindHandlers(this, '_createObjectIdMap', '_testObjectIdBeholder', '_updateObjectIdFromMap');
  }

  get presentation() { return this.p; }
  get presentationClone() { return xobject.deepClone(this.p); }
  set presentation(presentation) {
    if (typeof presentation === 'string') {
      this.load(presentation)
        .then(result => {
          console.log(`Presentation set presentation(${presentation})`, result);
          this.p = result;
        })
        .catch(err => {
          console.error(`Presentation set presentation(${presentation})`, err);
        });
    } else {
      this.p = presentation;
    }
  }
  set presentationClone(presentation) { this.p = xobject.deepClone(presentation); }

  get title() { return this.p.title; }
  set title(title) { this.p.title = title; }
  get presentationId() { return this.p.presentationId; }
  set presentationId(presentationId) { this.p.presentationId = presentationId; }
  get locale() { return this.p.locale; }
  set locale(locale) { this.p.locale = locale; }
  get revisionId() { return this.p.revisionId; }
  set revisionId(revisionId) { this.p.revisionId = revisionId; }

  get pageSize() { return this.p.pageSize; }
  get pageSizeClone() { return xobject.deepClone(this.p.pageSize); }
  set pageSize(pageSize) { this.p.revisionId = pageSize; }
  set pageSizeClone(pageSize) { this.p.revisionId = xobject.deepClone(pageSize); }

  get masters() { return this.p.masters; }
  get mastersClone() { return xobject.deepClone(this.p.masters); }
  getMaster(idx = 0) {
    const m = this.p.masters;
    if (!m.length) { return {}; }
    return m[this._normalizeIdx(m, idx)];
  }
  getMasterClone(idx = 0) { return xobject.deepClone(this.getMaster(idx)); }
  addMaster(master) { this.p.masters.push(master); }
  addMasterClone(master) { this.p.masters.push(xobject.deepClone(master)); }
  addMasters(masters) { this.p.masters.concat(masters); }
  addMastersClone(masters) { this.p.masters.concat(xobject.deepClone(masters)); }
  setMaster(master, idx = 0) {
    const m = this.p.masters;
    if (m.length && idx >= 0 && idx < m.length) {
      m[idx] = master;
    }
  }
  setMasterClone(master, idx = 0) { this.setMaster(xobject.deepClone(master), idx); }
  deleteMaster(idx = 0) {
    const m = this.p.masters;
    if (m.length && idx >= 0 && idx < m.length) {
      delete m[idx];
    }
  }

  get notesMaster() { return this.p.notesMaster; }
  get notesMasterClone() { return xobject.deepClone(this.p.notesMaster); }
  set notesMaster(notesMaster) { this.p.notesMaster = notesMaster; }
  set notesMasterClone(notesMaster) { this.p.notesMaster = xobject.deepClone(notesMaster); }

  get layouts() { return this.p.layouts; }
  get layoutsClone() { return xobject.deepClone(this.p.layouts); }
  getLayout(idx = 0) {
    const l = this.p.layouts;
    if (!l.length) { return {}; }
    return l[this._normalizeIdx(l, idx)];
  }
  getLayoutClone(idx = 0) { return xobject.deepClone(this.getLayout(idx)); }
  addLayout(layout) { this.p.layouts.push(layout); }
  addLayoutClone(layout) { this.p.layouts.push(xobject.deepClone(layout)); }
  addLayouts(layouts) { this.p.layouts.concat(layouts); }
  addLayoutsClone(layouts) { this.p.layouts.concat(xobject.deepClone(layouts)); }
  setLayout(layout, idx = 0) {
    const l = this.p.layouts;
    if (l.length && idx >= 0 && idx < l.length) {
      l[idx] = layout;
    }
  }
  setLayoutClone(layout, idx = 0) { this.setLayout(xobject.deepClone(layout), idx); }
  deleteLayout(idx = 0) {
    const l = this.p.layouts;
    if (l.length && idx >= 0 && idx < l.length) {
      delete l[idx];
    }
  }

  get slides() { return this.p.slides; }
  get slidesClone() { return xobject.deepClone(this.p.slides); }
  getSlide(idx = 0) {
    const s = this.p.slides;
    if (!s.length) { return {}; }
    return s[this._normalizeIdx(s, idx)];
  }
  getSlideClone(idx = 0) { return xobject.deepClone(this.getSlide(idx)); }
  addSlide(slide) { this.p.slides.push(slide); }
  addSlideClone(slide) { this.p.slides.push(xobject.deepClone(slide)); }
  addSlides(slides) { this.p.slides.concat(slides); }
  addSlidesClone(slides) { this.p.slides.concat(xobject.deepClone(slides)); }
  setSlide(slide, idx = 0) {
    const s = this.p.slides;
    if (s.length && idx >= 0 && idx < s.length) {
      s[idx] = slide;
    }
  }
  setSlideClone(slide, idx = 0) { this.setSlide(xobject.deepClone(slide), idx); }
  deleteSlide(idx = 0) {
    const s = this.p.slides;
    if (s.length && idx >= 0 && idx < s.length) {
      delete s[idx];
    }
  }

  /**
   * Delete property at the end of path
   * @param path
   * @param {Object} from
   */
  deleteProperty(path, from = this.p) {
    path = path.split('.');
    if (path.length === 1) {
      // console.log('Deleting ', from[path[0]]);
      delete from[path[0]];
    } else {
      const currentProperty = path.shift();
      // console.log('Going deeper ', path, from[currentProperty]);
      this.deleteProperty(path.join('.'), from[currentProperty]);
    }
  }

  /**
   * Counts pages in presentation. By default notesMaster is not counted
   * @param {Array<string>} entities
   * @returns {number}
   */
  getPageCount(entities = ['masters', 'layouts', 'slides']) {
    if (typeof entities === 'string') {
      entities = [entities];
    }
    return entities.reduce((acc, entity) => acc + (Array.isArray(this.p[entity]) ? this.p[entity].length : 1), 0);
  }

  /**
   * Get all objectIds nesting structure is preserved and properties names for objectIds are preserved
   * @returns {Object}
   */
  getObjectIdsStructure() {
    return xobject.oFilterProps(this.p,
      ['objectId', 'parentObjectId', 'speakerNotesObjectId', 'layoutObjectId', 'masterObjectId', ]); // 'elementGroup'
  }

  /**
   * Get all references
   * @param {Boolean} shallow - when shallow then { objectId: [...referredIds] },
   *  otherwise nesting structure is preserved and properties names referring to objectIds are preserved
   * @returns {Object}
   */
  getReferences(shallow = false) {}

  /**
   * Changes all objectIds and references to those using prefix
   * @param {string} prefix
   */
  changeObjectIds(prefix = '_') {
    this.objectCounter = 0;
    this.objectIdMap = {};
    this.objectIdPrefix = prefix;
    this.objectIdBeholders = ['objectId', 'parentObjectId', 'speakerNotesObjectId', 'layoutObjectId', 'masterObjectId'];
    // collect
    xobject.oTraverse(this.p, '', this._createObjectIdMap);
    // change
    xobject.oTraverse(this.p, '', this._testObjectIdBeholder, this._updateObjectIdFromMap);
  }

  /**
   * Called from .changeObjectIds to update this.objectIdMap
   * @param {string} path
   * @param {string} propertyName
   * @param {*} propertyValue
   * @private
   */
  _createObjectIdMap(path, propertyName, propertyValue) {
    if (propertyName === 'objectId') {
      this.objectIdMap[propertyValue] = this.objectIdPrefix + this.objectIdCounter++;
    }
    return false; // we do not do any mutations
  }

  /**
   * Called from .changeObjectIds to test if a property value should be mutated
   * @param {string} path
   * @param {string} propertyName
   * @param {*} propertyValue
   * @private
   */
  _testObjectIdBeholder(path, propertyName, propertyValue) {
    return this.objectIdBeholders.includes(propertyName);
  }

  /**
   * Called from .changeObjectIds to update property value from the map
   * @param {string} path
   * @param {string} propertyName
   * @param {string} propertyValue
   * @private
   */
  _updateObjectIdFromMap(path, propertyName, propertyValue) {
    return this.objectIdMap[propertyValue];
  }

  /**
   * Creates a map for named entities allowing to backreference those through unique standard names (like 'TITLE').
   * Useful when some presentation slides need to be rebound to target presentation masters, layout, notes master
   * @param {Array} entities
   */
  getMaps(entities = ['notesMaster', 'masters', 'layouts']) {

  }

  /**
   * Loads presentation using google api
   * @param {string} fileId
   * @returns {Promise}
   * @private
   */
  load(fileId) {
    return window.gapi.client.slides.presentations.get({
      "presentationId": fileId,
    }).then(res => res.result, rej => Promise.reject(rej));
  }

  /**
   * Normalizes idx to fall into real range within the given list. Negative idx is also OK
   * @param {Array} list of elements to normalize idx against
   * @param {number} idx negatives are treated as "from the end of list backwards"
   * @returns {number|Boolean} normalized idx, fitting real range or false for empty list
   * @private
   */
  _normalizeIdx(list, idx) {
    if (!list || !list.length) {
      return false;
    }
    while (idx < 0) { idx = list.length + idx; }
    if (idx > list.length) { idx = list.length - 1; }
    return idx;
  }

}
