/* ============================================================
   CJM COACH PORTAL — REQUIREMENT VALIDATOR VIEW
   window.CJM_VIEWS.validator = { render, mount }

   - Textarea to paste epics / user stories / requirements / AC
   - On run, call engine.validateRequirements(text)
   - Render strengths, risks/gaps, improvements, clarifying questions,
     and the 6 sub-score meters via panels.scoreMeter
   - Results updated IMPERATIVELY into #val-results (no focus loss)
   - "Load demo problem B" example button

   British English. Guards optional state.
   ============================================================ */
(function () {
  "use strict";

  window.CJM_VIEWS = window.CJM_VIEWS || {};

  var P = function () { return window.CJM_PANELS; };
  var E = function () { return window.CJM_ENGINE; };
  var D = function () { return window.CJM_DATA; };

  function esc(s) { return P().esc(s); }

  var SCORE_LABELS = [
    { key: "clarity", label: "Clarity" },
    { key: "completeness", label: "Completeness" },
    { key: "ambiguity", label: "Low ambiguity" },
    { key: "traceabilityProblem", label: "Traceability to problem" },
    { key: "traceabilityCustomer", label: "Traceability to customer outcome" },
    { key: "acceptanceCriteria", label: "Acceptance criteria strength" }
  ];

  /* build the example text from problem-b's validatorExample */
  function demoExampleText() {
    var prob = (D().problems || []).filter(function (p) { return p.id === "problem-b"; })[0];
    if (!prob || !prob.validatorExample) return "";
    var ex = prob.validatorExample;
    var lines = [];
    if (ex.epic) lines.push("Epic: " + ex.epic);
    lines.push("");
    if (ex.inconsistentUserStory) lines.push("User story: " + ex.inconsistentUserStory);
    lines.push("");
    if (ex.weakAcceptanceCriteria && ex.weakAcceptanceCriteria.length) {
      lines.push("Acceptance criteria:");
      ex.weakAcceptanceCriteria.forEach(function (c) { lines.push("- " + c); });
    }
    return lines.join("\n");
  }

  /* tie the detected-type badge to how confidently the type was inferred:
     low for short samples or the "free text" fallback (no structural markers),
     medium otherwise — never overstate certainty. */
  function detectionConfidence(result) {
    if (result.note && /short sample/.test(result.note)) return "low";
    if (!result.detectedType || result.detectedType === "free text") return "low";
    return "medium";
  }

  function resultsHtml(result) {
    if (!result) {
      return P().emptyState({
        title: "No findings yet",
        sub: "Paste some requirements above and run the validator. I will surface strengths first, then gaps, improvements and clarifying questions — supportively."
      });
    }

    var meters = SCORE_LABELS.map(function (s) {
      var v = (result.scores && result.scores[s.key] != null) ? result.scores[s.key] : 0;
      return P().scoreMeter(s.label, v);
    }).join("");

    function block(eyebrow, title, items, cls) {
      if (!items || !items.length) return "";
      return '<div class="card stack">'
        + '<div class="card__header"><div><span class="eyebrow">' + esc(eyebrow) + "</span>"
        + '<h3 class="card__title">' + esc(title) + "</h3></div></div>"
        + P().list(items, cls || "") + "</div>";
    }

    return '<div class="stack" id="val-results-inner">'
      + '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Detected type</span>'
      + '<h3 class="card__title">' + esc(result.detectedType || "free text") + "</h3></div>"
      + P().confidenceBadge(detectionConfidence(result)) + "</div>"
      + '<p class="muted" style="font-size:var(--fs-xs)">' + esc(result.note || "") + "</p>"
      + '<div style="margin-top:var(--sp-3)">' + meters + "</div></div>"
      + block("What is working", "Strengths to build on", result.strengths)
      + block("Risks & gaps", "Where this could trip the team up", result.risksGaps)
      + block("Recommended improvements", "How to strengthen it", result.improvements)
      + block("Clarifying questions", "Worth asking before delivery", result.clarifyingQuestions)
      + "</div>";
  }

  /* ============================================================
     render
     ============================================================ */
  function render(root, ctx) {
    root.innerHTML = ''
      + '<div class="stack">'
      + '  <header class="stack">'
      + '    <span class="eyebrow">Requirement validator</span>'
      + '    <h1 class="view-title">Pressure-test your requirements</h1>'
      + '    <p class="view-lead">Paste an epic, user stories, requirements or acceptance criteria. I will check clarity, completeness, ambiguity, contradiction, weak acceptance criteria, and traceability back to the problem and the customer outcome — then return strengths, gaps, improvements and clarifying questions.</p>'
      + "  </header>"
      + '  <div class="grid grid--sidebar">'
      + '    <div class="stack">'
      + '      <div class="card stack">'
      + '        <div class="card__header"><div><span class="eyebrow">Your requirements</span>'
      + '        <h2 class="card__title">Paste epics, stories or acceptance criteria</h2></div></div>'
      + '        <div class="field">'
      + '          <label class="field__label sr-only" for="val-input">Requirements to validate</label>'
      + '          <textarea id="val-input" class="textarea textarea--lg" placeholder="As a user, I want to update my details so that…&#10;&#10;Acceptance criteria:&#10;- …"></textarea>'
      + "        </div>"
      + '        <div class="chip-row">'
      + '          <button class="btn btn--primary" type="button" data-action="val-run">Validate requirements</button>'
      + '          <button class="btn btn--secondary btn--sm" type="button" data-action="val-demo">Load demo problem B</button>'
      + '          <button class="btn btn--quiet btn--sm" type="button" data-action="val-clear">Clear</button>'
      + "        </div>"
      + '        <p class="muted" style="font-size:var(--fs-xs)">Findings are heuristic prompts to review, not a definitive audit. They never assert a quality you have not written.</p>'
      + "      </div>"
      + '      <div id="val-results">' + resultsHtml(null) + "</div>"
      + "    </div>"
      + '    <aside class="stack">'
      + '      <div class="card card--accent-rail stack">'
      + '        <span class="eyebrow">What I look for</span>'
      + '        <h3 class="card__title">A good requirement…</h3>'
      + P().list([
          "Has one clear actor and one clear outcome",
          "Traces back to a problem and a customer benefit",
          "Replaces 'fast' or 'works' with a measurable threshold",
          "Names error handling and failure behaviour",
          "States dependencies and hand-offs, not silent assumptions",
          "Has a shared definition of done"
        ])
      + "      </div>"
      + P().disclaimer({ inline: true })
      + "    </aside>"
      + "  </div>"
      + "</div>";
  }

  /* ============================================================
     mount — run validator imperatively (no re-render, no focus loss)
     ============================================================ */
  function mount(root, ctx) {
    function setResults(html) {
      var holder = root.querySelector("#val-results");
      if (holder) holder.innerHTML = html;
    }

    function run() {
      var ta = root.querySelector("#val-input");
      var text = ta ? String(ta.value || "") : "";
      if (!text.trim()) {
        setResults(P().emptyState({
          title: "Nothing to validate yet",
          sub: "Paste an epic, user stories or acceptance criteria, or load the demo to see it in action."
        }));
        return;
      }
      var result = E().validateRequirements(text);
      setResults(resultsHtml(result));
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn || !root.contains(btn)) return;
      var action = btn.getAttribute("data-action");

      if (action === "val-run") { e.preventDefault(); run(); }
      else if (action === "val-demo") {
        e.preventDefault();
        var ta = root.querySelector("#val-input");
        if (ta) { ta.value = demoExampleText(); ta.focus(); }
        run();
      } else if (action === "val-clear") {
        e.preventDefault();
        var ta2 = root.querySelector("#val-input");
        if (ta2) { ta2.value = ""; ta2.focus(); }
        setResults(resultsHtml(null));
      } else if (action === "toggle-disclaimer") {
        e.preventDefault();
        var d = btn.closest(".disclaimer");
        if (d) {
          d.classList.toggle("is-collapsed");
          btn.textContent = d.classList.contains("is-collapsed") ? "Show" : "Hide";
        }
      }
    });
  }

  window.CJM_VIEWS.validator = { render: render, mount: mount };
})();
