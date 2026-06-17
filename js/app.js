/* ============================================================
   CJM COACH PORTAL — APP / ROUTER
   Loaded LAST. Wires nav, hash routing, and renders the active
   view into #view-root. Re-renders the WHOLE view only on
   navigation (so in-view inputs keep focus).
   ============================================================ */
(function () {
  "use strict";

  var VALID_VIEWS = ["dashboard", "workspace", "validator", "reflection"];
  var root, nav;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- brand from data ---------- */
  function applyBrand() {
    var b = (window.CJM_DATA && window.CJM_DATA.brand) || {};
    var name = document.getElementById("brand-name");
    var tag = document.getElementById("brand-tagline");
    if (name && b.name) name.textContent = b.name;
    if (tag && b.tagline) tag.textContent = b.tagline;
  }

  /* ---------- resolve view name from hash ---------- */
  function viewFromHash() {
    var h = (window.location.hash || "").replace(/^#/, "").trim();
    if (VALID_VIEWS.indexOf(h) !== -1) return h;
    return null;
  }

  /* ---------- highlight active nav link ---------- */
  function setActiveNav(name) {
    $all(".topnav__link", nav).forEach(function (a) {
      var isActive = a.getAttribute("data-view") === name;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- the context object passed to views ---------- */
  function buildCtx() {
    return {
      store: window.CJM_STORE,
      engine: window.CJM_ENGINE,
      data: window.CJM_DATA,
      panels: window.CJM_PANELS,
      navigate: navigate,        // views can request navigation
      state: window.CJM_STORE.getState()
    };
  }

  /* ---------- render the active view (FULL render) ---------- */
  function renderView(name) {
    if (VALID_VIEWS.indexOf(name) === -1) name = "dashboard";
    window.CJM_STORE.setActiveView(name);
    setActiveNav(name);

    var ctx = buildCtx();
    var view = window.CJM_VIEWS && window.CJM_VIEWS[name];

    if (!view) {
      /* graceful default: view file not yet registered */
      root.innerHTML = pendingViewHtml(name);
      root.focus();
      return;
    }

    try {
      if (typeof view.render === "function") {
        view.render(root, ctx);
        if (typeof view.mount === "function") view.mount(root, ctx);
      } else if (typeof view === "function") {
        view(root, ctx);
      } else {
        root.innerHTML = pendingViewHtml(name);
      }
    } catch (err) {
      root.innerHTML = errorViewHtml(name, err);
      if (window.console && console.error) console.error("[CJM] view render failed:", name, err);
    }
    /* move keyboard focus to the freshly rendered view for accessibility */
    try { root.focus(); } catch (e) { /* ignore */ }
    /* scroll to top on navigation */
    try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
  }

  function pendingViewHtml(name) {
    var nice = { dashboard: "Dashboard", workspace: "Coaching Workspace", validator: "Requirement Validator", reflection: "Weekly Reflection" }[name] || name;
    return '<section class="stack">'
      + '<h1 class="view-title">' + nice + "</h1>"
      + '<div class="empty"><div class="empty__title">This view is loading.</div>'
      + '<div class="empty__sub">The ' + nice + ' view has not been registered yet. If you are seeing this in the finished build, check that js/views/' + name + '.js loaded without errors.</div></div>'
      + "</section>";
  }

  function errorViewHtml(name, err) {
    return '<section class="stack">'
      + '<h1 class="view-title">Something needs attention</h1>'
      + '<div class="card"><p>The <strong>' + name + '</strong> view ran into a problem while rendering. The rest of the portal still works — try another tab.</p>'
      + '<p class="muted" style="font-size:var(--fs-xs)">' + (err && err.message ? String(err.message) : "Unknown error") + "</p></div></section>";
  }

  /* ---------- navigation ---------- */
  function navigate(name) {
    if (VALID_VIEWS.indexOf(name) === -1) name = "dashboard";
    if (("#" + name) !== window.location.hash) {
      window.location.hash = name;   // triggers hashchange -> renderView
    } else {
      renderView(name);              // already on this hash: render explicitly
    }
  }

  /* ---------- event wiring ---------- */
  function onHashChange() {
    var name = viewFromHash() || window.CJM_STORE.getState().activeView || "dashboard";
    renderView(name);
  }

  function wireNav() {
    nav.addEventListener("click", function (e) {
      var link = e.target.closest ? e.target.closest(".topnav__link") : null;
      if (!link) return;
      var name = link.getAttribute("data-view");
      if (name) {
        e.preventDefault();
        navigate(name);
      }
    });
    var brand = document.getElementById("brand-link");
    if (brand) {
      brand.addEventListener("click", function (e) {
        e.preventDefault();
        navigate("dashboard");
      });
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    root = document.getElementById("view-root");
    nav = document.getElementById("topnav");
    if (!root || !nav) {
      if (window.console && console.error) console.error("[CJM] missing #view-root or #topnav");
      return;
    }
    applyBrand();
    wireNav();
    window.addEventListener("hashchange", onHashChange);

    /* initial view: hash wins, else last active view, else dashboard */
    var initial = viewFromHash() || window.CJM_STORE.getState().activeView || "dashboard";
    if (!window.location.hash) {
      /* keep the URL tidy without forcing a second render */
      try { window.history.replaceState(null, "", "#" + initial); } catch (e) { /* ignore */ }
    }
    renderView(initial);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* expose a tiny app handle for debugging / views that want to force nav */
  window.CJM_APP = { navigate: navigate, render: renderView };
})();
