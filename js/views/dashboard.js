/* ============================================================
   CJM COACH PORTAL — DASHBOARD VIEW
   window.CJM_VIEWS.dashboard = { render, mount }
   Home: welcome, current session, quick-start, recent sessions,
   weekly-reflection shortcut, 4 personas, 4 problems, progress snapshot.
   Classic script. British English. Guards optional state.
   ============================================================ */
(function () {
  "use strict";

  window.CJM_VIEWS = window.CJM_VIEWS || {};

  var P = function () { return window.CJM_PANELS; };
  var E = function () { return window.CJM_ENGINE; };
  var D = function () { return window.CJM_DATA; };

  function esc(s) { return P().esc(s); }

  /* ---------- snapshot computation ---------- */
  function computeSnapshot(state) {
    var sessions = (state && state.sessions) || [];
    var reflections = (state && state.reflections) || [];
    var session = (state && state.session) || {};

    /* highest stage reached across live + saved sessions */
    var stageReached = session.currentStage || 1;
    sessions.forEach(function (s) { if (s && s.currentStage > stageReached) stageReached = s.currentStage; });

    /* role-integrity tendency from the most recent session that has text */
    var tendency = "Not yet read";
    var tendencyDot = "med";
    var live = (session && session.problemText) ? session : (sessions[0] || null);
    if (live && E() && E().assessRoleIntegrity) {
      try {
        var ri = E().assessRoleIntegrity(live);
        var map = { "journey-owner": "Journey owner", "balanced": "Balanced", "documentation": "Documentation mode" };
        tendency = map[ri.mode] || "Balanced";
        tendencyDot = ri.mode === "journey-owner" ? "high" : (ri.mode === "documentation" ? "low" : "med");
      } catch (e) { /* keep default */ }
    }

    return {
      sessionsCount: sessions.length,
      stageReached: stageReached,
      reflectionsDone: reflections.length,
      tendency: tendency,
      tendencyDot: tendencyDot
    };
  }

  function tile(label, figure, deltaHtml, dotCls) {
    return '<div class="tile">'
      + '<span class="tile__label">' + esc(label) + "</span>"
      + '<span class="tile__figure">' + figure + "</span>"
      + (deltaHtml ? '<span class="tile__delta">' + deltaHtml + "</span>" : "")
      + (dotCls ? '<span class="tile__dot tile__dot--' + dotCls + '"></span>' : "")
      + "</div>";
  }

  /* ---------- current / most-recent session card ---------- */
  function currentSessionCard(state) {
    var session = (state && state.session) || {};
    var has = session && session.problemText && String(session.problemText).trim().length > 0;
    var isFallback = false;     // true when showing a saved session, not the live slot
    if (!has) {
      /* fall back to the most-recent saved session if the live slot is empty */
      var recent = (state.sessions || [])[0];
      if (recent && recent.problemText) {
        session = recent;
        has = true;
        isFallback = true;
      }
    }

    if (!has) {
      return '<div class="card card--accent-rail stack">'
        + '<span class="eyebrow">Current session</span>'
        + '<h2 class="card__title">No live coaching session yet</h2>'
        + '<p class="muted">When you paste a problem or pick a demo below, your session will live here so you can pick up where you left off.</p>'
        + '<div><button class="btn btn--primary" type="button" data-action="open-workspace">Start a coaching session</button></div>'
        + "</div>";
    }

    var modeId = session.selectedMode || session.recommendedMode;
    var modeChip = modeId ? P().modeChip(modeId, { recommended: !session.selectedMode || session.selectedMode === session.recommendedMode }) : "";
    var stage = session.currentStage || 1;
    var stageTitle = "";
    (D().stages || []).forEach(function (st) { if (st.id === stage) stageTitle = st.title; });
    var title = session.title || "Your coaching session";
    /* In the fallback case we are showing a SAVED session, so Resume must load
       it into the live slot first (load-session), not just navigate. */
    var resumeBtn = isFallback
      ? '<button class="btn btn--primary btn--sm" type="button" data-action="load-session" data-session-id="' + esc(session.id) + '">Resume in workspace</button>'
      : '<button class="btn btn--primary btn--sm" type="button" data-action="resume-session">Resume in workspace</button>';

    return '<div class="card card--focus stack">'
      + '<div class="card__header"><div><span class="eyebrow">Current session</span>'
      + '<h2 class="card__title">' + esc(title) + "</h2></div>" + modeChip + "</div>"
      + '<p class="muted">' + esc(session.problemText) + "</p>"
      + '<div class="chip-row">'
      + '<span class="chip chip--active"><span class="chip__dot"></span>Stage ' + stage + " of 5" + (stageTitle ? " — " + esc(stageTitle) : "") + "</span>"
      + "</div>"
      + '<div class="chip-row">'
      + resumeBtn
      + '<button class="btn btn--ghost btn--sm" type="button" data-action="open-workspace">New session</button>'
      + "</div></div>";
  }

  /* ---------- quick start ---------- */
  function quickStart() {
    return '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Quick start</span>'
      + '<h2 class="card__title">Paste a problem, or ask for guidance</h2></div></div>'
      + '<p class="muted">Describe what has landed on your desk in your own words. I will recommend a support mode and walk you through the thinking — pausing before we jump to a solution.</p>'
      + '<div class="field">'
      + '<label class="field__label" for="qs-input">What are you working on?</label>'
      + '<span class="field__hint">e.g. "Stakeholders want a new feature because customers are dropping out, and they want it fast."</span>'
      + '<textarea id="qs-input" class="textarea" rows="3" placeholder="Type or paste a problem, request, or set of requirements…"></textarea>'
      + "</div>"
      + '<div class="chip-row">'
      + '<button class="btn btn--primary" type="button" data-action="quickstart-go">Start coaching</button>'
      + '<button class="btn btn--secondary" type="button" data-action="open-validator">Validate requirements instead</button>'
      + "</div></div>";
  }

  /* ---------- recent sessions ---------- */
  function recentSessions(state) {
    var sessions = (state && state.sessions) || [];
    if (!sessions.length) {
      return '<div class="card stack">'
        + '<span class="eyebrow">Recent sessions</span>'
        + '<p class="muted">No saved sessions yet. As you work through the framework, save a session and it will appear here for quick return.</p>'
        + "</div>";
    }
    var rows = sessions.map(function (s) {
      var modeId = s.selectedMode || s.recommendedMode;
      var chip = modeId ? P().modeChip(modeId) : "";
      var stage = s.currentStage || 1;
      return '<button class="card card--interactive stack" type="button" data-action="load-session" data-session-id="' + esc(s.id) + '" style="text-align:left;width:100%">'
        + '<div class="card__header"><div><span class="card__title">' + esc(s.title || "Coaching session") + "</span>"
        + '<span class="card__sub">Stage ' + stage + " of 5</span></div>" + chip + "</div>"
        + '<p class="muted" style="font-size:var(--fs-sm)">' + esc(String(s.problemText || "").slice(0, 120)) + (String(s.problemText || "").length > 120 ? "…" : "") + "</p>"
        + "</button>";
    }).join("");
    return '<section class="stack">'
      + '<h2 class="section-title">Recent sessions</h2>'
      + '<div class="grid grid--2">' + rows + "</div></section>";
  }

  /* ---------- weekly reflection shortcut ---------- */
  function reflectionShortcut(state) {
    var count = ((state && state.reflections) || []).length;
    var sub = count
      ? "You have " + count + " reflection" + (count === 1 ? "" : "s") + " saved. Step back and capture this week."
      : "Step back, reflect on the week and set a clear focus for the week ahead.";
    return '<div class="card card--accent-rail stack">'
      + '<div class="card__header"><div><span class="eyebrow">Weekly reflection</span>'
      + '<h2 class="card__title">How did this week really go?</h2></div></div>'
      + '<p class="muted">' + esc(sub) + "</p>"
      + '<div><button class="btn btn--secondary" type="button" data-action="open-reflection">Open weekly reflection</button></div>'
      + "</div>";
  }

  /* ---------- persona cards ---------- */
  function personaCards() {
    var personas = D().personas || [];
    var cards = personas.map(function (p) {
      var styleNeed = (p.coachingStyleNeeds || [])[0] || "";
      return '<button class="persona-card card card--interactive" type="button" data-action="start-persona" data-persona-id="' + esc(p.id) + '" style="text-align:left">'
        + '<div class="persona-card__head">'
        + '<span class="persona-card__avatar" aria-hidden="true">' + esc(p.avatarInitials) + "</span>"
        + '<div><span class="persona-card__name">' + esc(p.name) + "</span>"
        + '<span class="persona-card__role">' + esc(p.role) + "</span></div></div>"
        + '<span class="persona-card__group-label">Coaching focus</span>'
        + '<span class="persona-card__style">' + esc(styleNeed) + "</span>"
        + '<span class="persona-card__cta">Start a preloaded session →</span>'
        + "</button>";
    }).join("");
    return '<section class="stack">'
      + '<h2 class="section-title">Try a demo CJM</h2>'
      + '<p class="view-lead muted">Each demo CJM starts a workspace session seeded with their typical situation, so you can see how the coaching adapts.</p>'
      + '<div class="grid grid--4">' + cards + "</div></section>";
  }

  /* ---------- problem cards ---------- */
  function problemCards() {
    var problems = D().problems || [];
    var cards = problems.map(function (pr) {
      var modeChip = pr.recommendedMode ? P().modeChip(pr.recommendedMode, { recommended: true }) : "";
      return '<button class="problem-card card card--interactive" type="button" data-action="start-problem" data-problem-id="' + esc(pr.id) + '" style="text-align:left">'
        + '<div class="problem-card__head">'
        + '<span class="problem-card__code">' + esc(pr.code) + "</span>"
        + '<span class="problem-card__title">' + esc(pr.title) + "</span></div>"
        + '<p class="problem-card__statement">' + esc(pr.statement) + "</p>"
        + '<div class="problem-card__footer">' + modeChip
        + '<span class="persona-card__cta" style="opacity:1">Preload into a session →</span>'
        + "</div></button>";
    }).join("");
    return '<section class="stack">'
      + '<h2 class="section-title">Try a demo problem</h2>'
      + '<p class="view-lead muted">Pick a scenario to preload its statement, assumptions and recommended mode into a new coaching session.</p>'
      + '<div class="grid grid--2">' + cards + "</div></section>";
  }

  /* ---------- progress snapshot ---------- */
  function progressSnapshot(state) {
    var snap = computeSnapshot(state);
    var tiles = ""
      + tile("Sessions started", String(snap.sessionsCount), "saved coaching sessions", null)
      + tile("Furthest stage reached", "S" + snap.stageReached, "of the 5-stage framework", null)
      + tile("Reflections completed", String(snap.reflectionsDone), "weekly reflections", null)
      + tile("Role-integrity tendency", '<span style="font-size:var(--fs-lg)">' + esc(snap.tendency) + "</span>", "from your latest session", snap.tendencyDot);
    return '<section class="stack">'
      + '<h2 class="section-title">Your progress snapshot</h2>'
      + '<div class="grid grid--4">' + tiles + "</div>"
      + '<p class="muted" style="font-size:var(--fs-xs)">A gentle reflection of your activity, not a score. Role-integrity tendency is an estimate from your wording, never a verdict.</p>'
      + "</section>";
  }

  /* ============================================================
     render
     ============================================================ */
  function render(root, ctx) {
    var state = (ctx && ctx.state) || (window.CJM_STORE && window.CJM_STORE.getState()) || {};
    var brand = (D().brand) || {};
    root.innerHTML = ''
      + '<div class="stack">'
      + '  <header class="stack">'
      + '    <span class="eyebrow">Welcome back</span>'
      + '    <h1 class="view-title">' + esc(brand.name || "CJM Coach Portal") + "</h1>"
      + '    <p class="view-lead">A thinking partner for Customer Journey Managers. I will challenge gently, keep the customer first, and help you own the journey end to end — but the decisions, and the sign-off, always stay with you.</p>'
      + "  </header>"
      + '  <div class="grid grid--sidebar">'
      + '    <div class="stack">' + currentSessionCard(state) + quickStart() + "</div>"
      + '    <div class="stack">' + reflectionShortcut(state) + "</div>"
      + "  </div>"
      + recentSessions(state)
      + personaCards()
      + problemCards()
      + progressSnapshot(state)
      + "</div>";
  }

  /* ============================================================
     mount — wire all clicks via delegation (root survives until nav)
     ============================================================ */
  function mount(root, ctx) {
    var store = (ctx && ctx.store) || window.CJM_STORE;
    var navigate = (ctx && ctx.navigate) || (window.CJM_APP && window.CJM_APP.navigate) || function () {};

    root.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn || !root.contains(btn)) return;
      var action = btn.getAttribute("data-action");

      if (action === "open-workspace") {
        store.newSession({});
        navigate("workspace");
      } else if (action === "resume-session") {
        navigate("workspace");
      } else if (action === "open-validator") {
        navigate("validator");
      } else if (action === "open-reflection") {
        navigate("reflection");
      } else if (action === "quickstart-go") {
        var ta = root.querySelector("#qs-input");
        var text = ta ? String(ta.value || "").trim() : "";
        if (text) {
          store.newSession({ problemText: text, title: "Quick-start session" });
        } else {
          store.newSession({});
        }
        navigate("workspace");
      } else if (action === "start-persona") {
        var pid = btn.getAttribute("data-persona-id");
        var sp = (pid && store.startFromPersona) ? store.startFromPersona(pid) : null;
        if (sp) navigate("workspace");
      } else if (action === "start-problem") {
        var prid = btn.getAttribute("data-problem-id");
        var spr = (prid && store.startFromProblem) ? store.startFromProblem(prid) : null;
        if (spr) navigate("workspace");
      } else if (action === "load-session") {
        var sid = btn.getAttribute("data-session-id");
        var sl = (sid && store.loadSession) ? store.loadSession(sid) : null;
        if (sl) navigate("workspace");
      }
    });
  }

  window.CJM_VIEWS.dashboard = { render: render, mount: mount };
})();
