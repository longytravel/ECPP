/* ============================================================
   CJM COACH PORTAL — WEEKLY REFLECTION VIEW
   window.CJM_VIEWS.reflection = { render, mount }

   - Render the 10 weekly reflection inputs (data.reflectionFields)
   - On submit, collect answers keyed by field.key, call
     engine.scoreReflection(answers)
   - Render summary, observations, growth actions, next-week focus,
     strengths spotted (imperatively, no focus loss)
   - Save via store.addReflection({...answers, ...result})
     -> reflected in the dashboard snapshot

   British English. Guards optional state.
   ============================================================ */
(function () {
  "use strict";

  window.CJM_VIEWS = window.CJM_VIEWS || {};

  var P = function () { return window.CJM_PANELS; };
  var E = function () { return window.CJM_ENGINE; };
  var D = function () { return window.CJM_DATA; };

  function esc(s) { return P().esc(s); }
  function fieldId(key) { return "ref-" + key; }

  function inputsHtml() {
    var fields = D().reflectionFields || [];
    return fields.map(function (f) {
      return '<div class="field">'
        + '<label class="field__label" for="' + fieldId(f.key) + '">' + esc(f.label) + "</label>"
        + (f.placeholder ? '<span class="field__hint">' + esc(f.placeholder) + "</span>" : "")
        + '<textarea id="' + fieldId(f.key) + '" class="textarea" rows="3" data-ref-key="' + esc(f.key) + '" placeholder="' + esc(f.placeholder || "") + '"></textarea>'
        + "</div>";
    }).join("");
  }

  function resultHtml(result) {
    if (!result) {
      return P().emptyState({
        title: "Your coaching summary will appear here",
        sub: "Fill in as much as you can above — even a few lines per area — then save your reflection for tailored, supportive feedback."
      });
    }

    function block(eyebrow, title, items) {
      if (!items || !items.length) return "";
      return '<div class="card stack">'
        + '<div class="card__header"><div><span class="eyebrow">' + esc(eyebrow) + "</span>"
        + '<h3 class="card__title">' + esc(title) + "</h3></div></div>"
        + P().list(items) + "</div>";
    }

    var coveragePct = Math.round((result.coverageRatio || 0) * 100);
    var strengthsChips = (result.strengthsSpotted && result.strengthsSpotted.length)
      ? '<div class="card stack"><div class="card__header"><div><span class="eyebrow">Strengths spotted</span>'
        + '<h3 class="card__title">What you did well</h3></div></div>'
        + (result.strengthsSpotted.map(function (s) { return '<span class="chip chip--strength" style="margin:2px 4px 2px 0"><span class="chip__dot"></span>' + esc(s) + "</span>"; }).join(""))
        + "</div>"
      : "";

    return '<div class="stack" id="ref-results-inner">'
      + '<div class="card card--focus stack">'
      + '<div class="card__header"><div><span class="eyebrow">Reflection summary</span>'
      + '<h3 class="card__title">This week, in coaching terms</h3></div>'
      + P().confidenceBadge(coveragePct >= 60 ? "high" : (coveragePct >= 35 ? "medium" : "low")) + "</div>"
      + '<p>' + esc(result.summary) + "</p>"
      + P().scoreMeter("Reflection coverage", coveragePct)
      + '<p class="muted" style="font-size:var(--fs-xs)">' + esc(result.note || "") + "</p></div>"
      + strengthsChips
      + block("Coaching observations", "What I noticed", result.observations)
      + block("Recommended growth actions", "Small, deliberate stretches", result.growthActions)
      + block("Next-week focus", "Where to point your energy", result.nextWeekFocus)
      + "</div>";
  }

  function pastReflections(state) {
    var refs = (state && state.reflections) || [];
    if (!refs.length) return "";
    var rows = refs.slice(0, 4).map(function (r) {
      var when = "";
      try { when = new Date(r.savedAt).toLocaleDateString("en-GB"); } catch (e) { when = ""; }
      return '<div class="card stack">'
        + '<div class="card__header"><div><span class="card__title" style="font-size:var(--fs-base)">' + esc(when || "Saved reflection") + "</span></div></div>"
        + '<p class="muted" style="font-size:var(--fs-sm)">' + esc(String(r.summary || "").slice(0, 160)) + (String(r.summary || "").length > 160 ? "…" : "") + "</p>"
        + "</div>";
    }).join("");
    return '<aside class="stack">'
      + '<div class="card card--accent-rail stack"><span class="eyebrow">Your reflections</span>'
      + '<h3 class="card__title">Recent weeks</h3>'
      + '<p class="muted" style="font-size:var(--fs-xs)">' + refs.length + " saved. These also feed your dashboard snapshot.</p></div>"
      + rows
      + "</aside>";
  }

  /* ============================================================
     render
     ============================================================ */
  function render(root, ctx) {
    var state = (ctx && ctx.state) || (window.CJM_STORE && window.CJM_STORE.getState()) || {};
    var aside = pastReflections(state);

    root.innerHTML = ''
      + '<div class="stack">'
      + '  <header class="stack">'
      + '    <span class="eyebrow">Weekly reflection</span>'
      + '    <h1 class="view-title">Step back and reflect</h1>'
      + '    <p class="view-lead">Reflection is where growth compounds. Capture the week honestly and I will offer supportive observations, a couple of growth actions, and a clear focus for the week ahead. Everything I say is drawn from your own words.</p>'
      + "  </header>"
      + '  <div class="' + (aside ? "grid grid--sidebar" : "stack") + '">'
      + '    <div class="stack">'
      + '      <div class="card stack">'
      + '        <div class="card__header"><div><span class="eyebrow">This week</span>'
      + '        <h2 class="card__title">How did the week really go?</h2></div></div>'
      + inputsHtml()
      + '        <div class="chip-row">'
      + '          <button class="btn btn--primary" type="button" data-action="ref-submit">Save reflection &amp; get coaching</button>'
      + '          <button class="btn btn--quiet btn--sm" type="button" data-action="ref-clear">Clear</button>'
      + "        </div>"
      + "      </div>"
      + '      <div id="ref-results">' + resultHtml(null) + "</div>"
      + "    </div>"
      + (aside || "")
      + "  </div>"
      + "</div>";
  }

  /* ============================================================
     mount — score + save imperatively (no re-render, no focus loss)
     ============================================================ */
  function mount(root, ctx) {
    var store = (ctx && ctx.store) || window.CJM_STORE;

    function collectAnswers() {
      var answers = {};
      var fields = D().reflectionFields || [];
      fields.forEach(function (f) {
        var el = root.querySelector("#" + fieldId(f.key));
        answers[f.key] = el ? String(el.value || "") : "";
      });
      return answers;
    }

    function setResults(html) {
      var holder = root.querySelector("#ref-results");
      if (holder) holder.innerHTML = html;
    }

    function submit() {
      var answers = collectAnswers();
      var result = E().scoreReflection(answers);
      setResults(resultHtml(result));
      /* persist raw answers + scored result so the dashboard snapshot updates */
      var entry = {};
      Object.keys(answers).forEach(function (k) { entry[k] = answers[k]; });
      Object.keys(result).forEach(function (k) { entry[k] = result[k]; });
      if (store && store.addReflection) store.addReflection(entry);
      /* gently scroll the results into view */
      var holder = root.querySelector("#ref-results");
      if (holder && holder.scrollIntoView) {
        try { holder.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { /* ignore */ }
      }
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn || !root.contains(btn)) return;
      var action = btn.getAttribute("data-action");

      if (action === "ref-submit") { e.preventDefault(); submit(); }
      else if (action === "ref-clear") {
        e.preventDefault();
        var fields = D().reflectionFields || [];
        fields.forEach(function (f) {
          var el = root.querySelector("#" + fieldId(f.key));
          if (el) el.value = "";
        });
        setResults(resultHtml(null));
        var first = root.querySelector("textarea[data-ref-key]");
        if (first) first.focus();
      }
    });
  }

  window.CJM_VIEWS.reflection = { render: render, mount: mount };
})();
