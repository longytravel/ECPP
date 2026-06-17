/* ============================================================
   CJM COACH PORTAL — STORE
   window.CJM_STORE : app state + localStorage persistence + helpers.
   window.CJM_VIEWS : view registry (each view file populates one key).
   Guards all localStorage access (file:// can restrict it).
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "cjm-coach-portal:v1";

  /* view registry — views attach themselves here */
  window.CJM_VIEWS = window.CJM_VIEWS || {};

  /* ---------- default state ---------- */
  function defaultSession() {
    return {
      id: null,
      problemText: "",
      recommendedMode: null,      // mode id from engine.recommendMode
      selectedMode: null,         // user override (mode id) or same as recommended
      currentStage: 1,            // 1..5
      stageData: {},              // { "1": {...}, "2": {...}, ... } per-stage notes
      assumptions: [],            // string[]
      evidenceConfidence: null,   // "low" | "medium" | "high"
      journeyNotes: {},           // { upstream, downstream, affected, handoffs, friction, wholeVsLocal }
      customerFirst: {},          // keyed by customerFirstFields[].key
      nextActions: [],            // string[]
      seedPersonaId: null,
      seedProblemId: null,
      title: "",
      createdAt: null,
      updatedAt: null
    };
  }

  function defaultState() {
    return {
      version: 1,
      activeView: "dashboard",        // dashboard | workspace | validator | reflection
      session: defaultSession(),      // the live coaching session
      sessions: [],                   // recent saved sessions (most-recent-first)
      reflections: []                 // saved weekly reflections (most-recent-first)
    };
  }

  /* ---------- persistence (guarded) ---------- */
  var memoryFallback = null;   // used if localStorage unavailable
  var storageOk = (function () {
    try {
      var t = "__cjm_test__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  })();

  function loadFromDisk() {
    if (!storageOk) return memoryFallback ? clone(memoryFallback) : null;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveToDisk(state) {
    if (!storageOk) { memoryFallback = clone(state); return false; }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      memoryFallback = clone(state);
      return false;
    }
  }

  function clone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); }
    catch (e) { return obj; }
  }

  function mergeDefaults(loaded) {
    var base = defaultState();
    if (!loaded) return base;
    base.activeView = loaded.activeView || base.activeView;
    base.sessions = Array.isArray(loaded.sessions) ? loaded.sessions : [];
    base.reflections = Array.isArray(loaded.reflections) ? loaded.reflections : [];
    if (loaded.session && typeof loaded.session === "object") {
      base.session = Object.assign(defaultSession(), loaded.session);
    }
    return base;
  }

  /* ---------- live state ---------- */
  var state = mergeDefaults(loadFromDisk());
  var listeners = [];

  function notify() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](state); } catch (e) { /* swallow listener errors */ }
    }
  }

  /* ---------- public helpers ---------- */
  function getState() { return state; }

  function setState(patch) {
    if (patch && typeof patch === "object") {
      Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    }
    saveToDisk(state);
    notify();
    return state;
  }

  /* patch the live session shallowly (no full re-render forced here) */
  function updateSession(patch) {
    if (!state.session) state.session = defaultSession();
    if (patch && typeof patch === "object") {
      Object.keys(patch).forEach(function (k) { state.session[k] = patch[k]; });
    }
    state.session.updatedAt = Date.now();
    saveToDisk(state);
    notify();
    return state.session;
  }

  /* start a fresh session, optionally seeded from a persona/problem */
  function newSession(seed) {
    seed = seed || {};
    var s = defaultSession();
    s.id = "s-" + Date.now();
    s.createdAt = Date.now();
    s.updatedAt = Date.now();
    if (seed.problemText) s.problemText = seed.problemText;
    if (seed.title) s.title = seed.title;
    if (seed.seedPersonaId) s.seedPersonaId = seed.seedPersonaId;
    if (seed.seedProblemId) s.seedProblemId = seed.seedProblemId;
    if (seed.assumptions) s.assumptions = seed.assumptions.slice();

    /* recommend a mode from the seed text (or honour an explicit one) */
    if (seed.recommendedMode) {
      s.recommendedMode = seed.recommendedMode;
      s.selectedMode = seed.selectedMode || seed.recommendedMode;
    } else if (s.problemText && window.CJM_ENGINE) {
      var reco = window.CJM_ENGINE.recommendMode(s.problemText);
      s.recommendedMode = reco.mode;
      s.selectedMode = seed.selectedMode || reco.mode;
    }
    if (seed.selectedMode) s.selectedMode = seed.selectedMode;
    if (seed.currentStage) s.currentStage = seed.currentStage;

    state.session = s;
    saveToDisk(state);
    notify();
    return s;
  }

  /* persist a snapshot of the current session into sessions[] (most-recent-first) */
  function saveSession() {
    if (!state.session || !state.session.problemText) return null;
    if (!state.session.id) state.session.id = "s-" + Date.now();
    var snap = clone(state.session);
    snap.savedAt = Date.now();
    /* replace any existing snapshot with the same id */
    state.sessions = (state.sessions || []).filter(function (x) { return x.id !== snap.id; });
    state.sessions.unshift(snap);
    if (state.sessions.length > 8) state.sessions = state.sessions.slice(0, 8);
    saveToDisk(state);
    notify();
    return snap;
  }

  /* load a previously saved session back into the live slot */
  function loadSession(id) {
    var found = (state.sessions || []).filter(function (x) { return x.id === id; })[0];
    if (!found) return null;
    state.session = Object.assign(defaultSession(), clone(found));
    saveToDisk(state);
    notify();
    return state.session;
  }

  function addReflection(r) {
    if (!r || typeof r !== "object") return null;
    var entry = clone(r);
    entry.id = "r-" + Date.now();
    entry.savedAt = Date.now();
    state.reflections = state.reflections || [];
    state.reflections.unshift(entry);
    if (state.reflections.length > 12) state.reflections = state.reflections.slice(0, 12);
    saveToDisk(state);
    notify();
    return entry;
  }

  function setActiveView(name) {
    state.activeView = name;
    saveToDisk(state);
    /* note: navigation re-render is driven by app.js, not notify(), to keep focus */
    return name;
  }

  function subscribe(fn) {
    if (typeof fn === "function") listeners.push(fn);
    return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
  }

  function resetAll() {
    state = defaultState();
    saveToDisk(state);
    notify();
    return state;
  }

  /* ---------- convenience selectors ---------- */
  function getSession() { return state.session; }
  function getRecentSessions() { return state.sessions || []; }
  function getReflections() { return state.reflections || []; }

  /* lookup helpers for seeds */
  function findPersona(id) { return (window.CJM_DATA.personas || []).filter(function (p) { return p.id === id; })[0] || null; }
  function findProblem(id) { return (window.CJM_DATA.problems || []).filter(function (p) { return p.id === id; })[0] || null; }

  /* start a session from a demo persona (uses its seed problem) */
  function startFromPersona(personaId) {
    var persona = findPersona(personaId);
    if (!persona) return null;
    var problem = findProblem(persona.seedProblemId);
    return newSession({
      problemText: problem ? problem.statement : "",
      title: persona.name + " — " + (problem ? problem.title : "Coaching session"),
      seedPersonaId: persona.id,
      seedProblemId: problem ? problem.id : null,
      assumptions: problem ? (problem.assumptions || []).slice() : [],
      recommendedMode: problem ? problem.recommendedMode : null
    });
  }

  /* start a session from a demo problem */
  function startFromProblem(problemId) {
    var problem = findProblem(problemId);
    if (!problem) return null;
    return newSession({
      problemText: problem.statement,
      title: problem.title,
      seedProblemId: problem.id,
      assumptions: (problem.assumptions || []).slice(),
      recommendedMode: problem.recommendedMode
    });
  }

  window.CJM_STORE = {
    STORAGE_KEY: STORAGE_KEY,
    storageOk: storageOk,
    getState: getState,
    setState: setState,
    updateSession: updateSession,
    newSession: newSession,
    saveSession: saveSession,
    loadSession: loadSession,
    addReflection: addReflection,
    setActiveView: setActiveView,
    subscribe: subscribe,
    resetAll: resetAll,
    getSession: getSession,
    getRecentSessions: getRecentSessions,
    getReflections: getReflections,
    findPersona: findPersona,
    findProblem: findProblem,
    startFromPersona: startFromPersona,
    startFromProblem: startFromProblem,
    defaultSession: defaultSession
  };
})();
