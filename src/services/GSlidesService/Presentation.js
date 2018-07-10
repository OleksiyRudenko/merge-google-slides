import * as xobject from "../../utils/xobject/xobject";

/**
 * A class representing Google Slides Presentation.
 * To have only core parts (i.e. masters, notes master, layout, and atomic properties):
 * const {slides, ...partial} = source;
 * new Presentation(partial)
 */
export default class Presentation {
  p;
  constructor(presentation, clone = false) {
    if (clone) {
      this.presentationClone = presentation;
    } else {
      this.presentation = presentation;
    }
  }

  get presentation() { return this.p; }
  get presentationClone() { return this._clone(this.p); }
  set presentation(presentation) { this.p = presentation; }
  set presentationClone(presentation) { this.p = this._clone(presentation); }

  get title() { return this.p.title; }
  set title(title) { this.p.title = title; }
  get presentationId() { return this.p.presentationId; }
  set presentationId(presentationId) { this.p.presentationId = presentationId; }
  get locale() { return this.p.locale; }
  set locale(locale) { this.p.locale = locale; }
  get revisionId() { return this.p.revisionId; }
  set revisionId(revisionId) { this.p.revisionId = revisionId; }

  get pageSize() { return this.p.pageSize; }
  get pageSizeClone() { return this._clone(this.p.pageSize); }
  set pageSize(pageSize) { this.p.revisionId = pageSize; }
  set pageSizeClone(pageSize) { this.p.revisionId = this._clone(pageSize); }

  get masters() { return this.p.masters; }
  get mastersClone() { return this._clone(this.p.masters); }
  getMaster(idx = 0) {
    const m = this.p.masters;
    if (!m.length) { return {}; }
    return m[this._normalizeIdx(m, idx)];
  }
  getMasterClone(idx = 0) { return this._clone(this.getMaster(idx)); }
  addMaster(master) { this.p.masters.push(master); }
  addMasterClone(master) { this.p.masters.push(this._clone(master)); }
  addMasters(masters) { this.p.masters.concat(masters); }
  addMastersClone(masters) { this.p.masters.concat(this._clone(masters)); }
  setMaster(master, idx = 0) {
    const m = this.p.masters;
    if (m.length && idx >= 0 && idx < m.length) {
      m[idx] = master;
    }
  }
  setMasterClone(master, idx = 0) { this.setMaster(this._clone(master), idx); }
  deleteMaster(idx = 0) {
    const m = this.p.masters;
    if (m.length && idx >= 0 && idx < m.length) {
      delete m[idx];
    }
  }

  get notesMaster() { return this.p.notesMaster; }
  get notesMasterClone() { return this._clone(this.p.notesMaster); }
  set notesMaster(notesMaster) { this.p.notesMaster = notesMaster; }
  set notesMasterClone(notesMaster) { this.p.notesMaster = this._clone(notesMaster); }

  get layouts() { return this.p.layouts; }
  get layoutsClone() { return this._clone(this.p.layouts); }
  getLayout(idx = 0) {
    const l = this.p.layouts;
    if (!l.length) { return {}; }
    return l[this._normalizeIdx(l, idx)];
  }
  getLayoutClone(idx = 0) { return this._clone(this.getLayout(idx)); }
  addLayout(layout) { this.p.layouts.push(layout); }
  addLayoutClone(layout) { this.p.layouts.push(this._clone(layout)); }
  addLayouts(layouts) { this.p.layouts.concat(layouts); }
  addLayoutsClone(layouts) { this.p.layouts.concat(this._clone(layouts)); }
  setLayout(layout, idx = 0) {
    const l = this.p.layouts;
    if (l.length && idx >= 0 && idx < l.length) {
      l[idx] = layout;
    }
  }
  setLayoutClone(layout, idx = 0) { this.setLayout(this._clone(layout), idx); }
  deleteLayout(idx = 0) {
    const l = this.p.layouts;
    if (l.length && idx >= 0 && idx < l.length) {
      delete l[idx];
    }
  }

  get slides() { return this.p.slides; }
  get slidesClone() { return this._clone(this.p.slides); }
  getSlide(idx = 0) {
    const s = this.p.slides;
    if (!s.length) { return {}; }
    return s[this._normalizeIdx(s, idx)];
  }
  getSlideClone(idx = 0) { return this._clone(this.getSlide(idx)); }
  addSlide(slide) { this.p.slides.push(slide); }
  addSlideClone(slide) { this.p.slides.push(this._clone(slide)); }
  addSlides(slides) { this.p.slides.concat(slides); }
  addSlidesClone(slides) { this.p.slides.concat(this._clone(slides)); }
  setSlide(slide, idx = 0) {
    const s = this.p.slides;
    if (s.length && idx >= 0 && idx < s.length) {
      s[idx] = slide;
    }
  }
  setSlideClone(slide, idx = 0) { this.setSlide(this._clone(slide), idx); }
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
   * Get all objectIds nesting structure is preserved and properties names for objectIds are preserved
   * @returns {Object}
   */
  getObjectIdsStructure() {
    return xobject.oFilterProps(this.p, ['objectId']);
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
  }

  /**
   * Creates a map for named entities allowing to backreference those through unique standard names (like 'TITLE').
   * Useful when some presentation slides need to be rebound to target presentation masters, layout, notes master
   * @param {Array} entities
   */
  getMaps(entities = ['notesMaster', 'masters', 'layouts']) {

  }

  _clone(subject) {
    return JSON.parse(JSON.stringify(subject));
  }

  _normalizeIdx(pages, idx) {
    while (idx < 0) { idx = pages.length + idx; }
    if (idx > pages.length) { idx = pages.length - 1; }
    return idx;
  }

}
