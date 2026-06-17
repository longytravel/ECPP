/* ============================================================
   CJM COACH PORTAL — COACHING WORKSPACE VIEW (the core)
   window.CJM_VIEWS.workspace = { render, mount }

   - Natural-language input -> recommended mode + rationale + override
   - Solution-bias / premature-solutioning gentle warnings
   - Visible 5-stage stepper with progress + current stage
   - Per stage: 3-5 coaching questions + stage prompts
   - Chat-style coaching log (coach vs user bubbles), appended
     IMPERATIVELY (no full re-render; input focus preserved)
   - Side panels via CJM_PANELS (customer-first, assumptions,
     evidence confidence, journey checklist, role-integrity,
     future/external, process/governance, next actions)
   - Stage 4: advisory (never hard-block) when readiness is low
   - Persists session changes via the store

   British English. Guards optional state.
   ============================================================ */
(function () {
  "use strict";

  window.CJM_VIEWS = window.CJM_VIEWS || {};

  var P = function () { return window.CJM_PANELS; };
  var E = function () { return window.CJM_ENGINE; };
  var D = function () { return window.CJM_DATA; };
  var S = function () { return window.CJM_STORE; };

  function esc(s) { return P().esc(s); }
  function session() { return S().getSession() || S().defaultSession(); }

  /* ---------- stepper ---------- */
  function stepStateClass(stageId, current, advisoryActive) {
    if (stageId < current) return "is-complete";
    if (stageId === current) return "is-active";
    /* Stage 4 gets a locked/attention visual when readiness is low */
    if (stageId === 4 && advisoryActive) return "is-locked";
    return "is-locked";
  }

  function renderStepper(sess, readiness) {
    var stages = D().stages || [];
    var current = sess.currentStage || 1;
    var advisoryActive = readiness && (!readiness.ready || readiness.solutionBiased);
    var steps = stages.map(function (st) {
      var stateCls = stepStateClass(st.id, current, advisoryActive);
      var nodeContent = (st.id < current) ? "✓" : String(st.id);
      var attentionBadge = (st.id === 4 && advisoryActive)
        ? '<span class="step__label muted" style="font-size:var(--fs-xs)">needs framing</span>'
        : '<span class="step__label">' + esc(st.title) + "</span>";
      return '<div class="step ' + stateCls + '" data-stage="' + st.id + '">'
        + '<span class="step__connector" aria-hidden="true"></span>'
        + '<button class="step__node step__node--btn" type="button" data-action="goto-stage" data-stage="' + st.id + '" '
        + 'aria-label="Go to stage ' + st.id + ': ' + esc(st.title) + '">' + nodeContent + "</button>"
        + attentionBadge
        + "</div>";
    }).join("");
    return '<nav class="stepper" id="ws-stepper" aria-label="Five-stage thinking framework">' + steps + "</nav>";
  }

  /* ---------- recommended mode + override block ---------- */
  function modeOverrideSelect(sess) {
    var modes = D().modes || [];
    var selected = sess.selectedMode || sess.recommendedMode || "";
    var opts = modes.map(function (m) {
      var sel = (m.id === selected) ? " selected" : "";
      return '<option value="' + esc(m.id) + '"' + sel + ">" + esc(m.label) + "</option>";
    }).join("");
    return '<div class="field" style="margin-top:var(--sp-3)">'
      + '<label class="field__label" for="ws-mode">Support mode (you can override)</label>'
      + '<span class="field__hint">The recommendation is a suggestion, never a constraint. Choose whichever mode best fits how you want to be coached.</span>'
      + '<select id="ws-mode" class="select">' + opts + "</select></div>";
  }

  function recoAndBias(sess) {
    if (!sess.problemText || !String(sess.problemText).trim()) {
      return '<div id="ws-reco"></div>';
    }
    var reco = E().recommendMode(sess.problemText);
    var bias = E().detectSolutionBias(sess.problemText);
    var biasHtml = "";
    if (bias.biased) {
      biasHtml = '<div class="callout-risk" style="margin-top:var(--sp-3)">'
        + '<span class="callout-risk__label">A gentle nudge before we solution</span>'
        + 'It looks like a solution may already be in mind. That instinct is useful later — for now, let us make sure we are solving the right problem first. '
        + (bias.signals && bias.signals.length ? "What I noticed: " + esc(bias.signals.slice(0, 3).join("; ")) + "." : "")
        + "</div>";
    }
    return '<div id="ws-reco">' + P().recommendedModeBlock(reco) + biasHtml + modeOverrideSelect(sess) + "</div>";
  }

  /* ---------- problem input + summary ---------- */
  function problemInput(sess) {
    var val = sess.problemText || "";
    return '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Your problem or ask</span>'
      + '<h2 class="card__title">What are you working on?</h2></div></div>'
      + '<p class="muted">Paste a problem statement, an ask from a stakeholder, or a set of requirements. I will recommend a support mode and we will think it through together.</p>'
      + '<div class="field">'
      + '<label class="field__label sr-only" for="ws-problem">Problem or request</label>'
      + '<textarea id="ws-problem" class="textarea textarea--lg" placeholder="e.g. Customers are dropping out during a service process and stakeholders want a new feature urgently.">' + esc(val) + "</textarea>"
      + "</div>"
      + '<div class="chip-row">'
      + '<button class="btn btn--primary" type="button" data-action="ws-submit">Recommend a mode &amp; begin</button>'
      + '<button class="btn btn--ghost btn--sm" type="button" data-action="ws-save">Save session</button>'
      + '<button class="btn btn--quiet btn--sm" type="button" data-action="ws-clear">Start fresh</button>'
      + "</div>"
      + recoAndBias(sess)
      + "</div>";
  }

  /* ---------- coaching chat log (rendered once; appended imperatively) ---------- */
  function coachBubble(htmlInner, meta) {
    return '<div class="bubble bubble--coach">'
      + '<span class="bubble__avatar" aria-hidden="true">C</span>'
      + '<div class="bubble__content">' + htmlInner
      + (meta ? '<div class="bubble__meta">' + esc(meta) + "</div>" : "")
      + "</div></div>";
  }
  function userBubble(text, meta) {
    return '<div class="bubble bubble--user">'
      + '<div class="bubble__content">' + esc(text)
      + (meta ? '<div class="bubble__meta">' + esc(meta) + "</div>" : "")
      + "</div>"
      + '<span class="bubble__avatar" aria-hidden="true">You</span></div>';
  }

  function stageCoachingBubbleHtml(stageId, sess) {
    var coaching = E().getStageCoaching(stageId, sess);
    var stage = (D().stages || []).filter(function (s) { return s.id === stageId; })[0] || {};
    var lensChips = (coaching.lenses || []).map(function (l) {
      return '<span class="chip chip--mode lens">' + esc(l.label) + "</span>";
    }).join(" ");
    var qs = '<ol class="coach-questions">' + (coaching.questions || []).map(function (q) {
      return "<li>" + esc(q) + "</li>";
    }).join("") + "</ol>";
    var hints = (coaching.summaryHints && coaching.summaryHints.length)
      ? '<div class="mini-panel"><div class="mini-panel__title">What good looks like at this stage</div>' + P().list(coaching.summaryHints) + "</div>"
      : "";
    var inner = '<span class="eyebrow">Stage ' + stageId + " — " + esc(coaching.title || stage.title || "") + "</span>"
      + '<p style="margin:var(--sp-2) 0">' + esc(stage.subtitle || "") + "</p>"
      + (lensChips ? '<div class="chip-row" style="margin-bottom:var(--sp-2)">' + lensChips + "</div>" : "")
      + "<p class=\"muted\" style=\"font-size:var(--fs-sm)\">A few questions to sit with — there are no wrong answers:</p>"
      + qs + hints;
    return coachBubble(inner, "Coaching prompts");
  }

  function advisoryBubbleHtml(readiness) {
    var inner = '<span class="eyebrow">A moment before solutions</span>'
      + '<p style="margin-top:var(--sp-2)">' + esc(readiness.advisory) + "</p>"
      + (readiness.gaps && readiness.gaps.length
        ? '<div class="mini-panel"><div class="mini-panel__title">Worth strengthening first</div>' + P().list(readiness.gaps) + "</div>"
        : "")
      + '<p class="muted" style="font-size:var(--fs-xs)">' + esc(readiness.note || "") + " You can continue to Stage 4 whenever you choose.</p>";
    return coachBubble(inner, "Advisory — not a block");
  }

  function chatPanel(sess) {
    /* seed the log with a welcome + the current stage's coaching */
    var hasProblem = sess.problemText && String(sess.problemText).trim();
    var seed = "";
    if (hasProblem) {
      seed += userBubble(sess.problemText, "Your starting point");
      seed += stageCoachingBubbleHtml(sess.currentStage || 1, sess);
    } else {
      seed += coachBubble(
        '<p>Welcome. Paste a problem or ask above and I will recommend a support mode, then we will work through it one stage at a time — keeping the customer first and the whole journey in view.</p>',
        "Getting started"
      );
    }
    return '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Coaching log</span>'
      + '<h2 class="card__title">Thinking it through together</h2></div></div>'
      + '<div class="chat" id="ws-chat">' + seed + "</div>"
      + '<div class="field" style="margin-top:var(--sp-3)">'
      + '<label class="field__label" for="ws-note">Reply, or capture your thinking</label>'
      + '<span class="field__hint">Your reply is added to the log and feeds the side panels. Then ask for the next prompt when you are ready.</span>'
      + '<textarea id="ws-note" class="textarea" rows="3" placeholder="Type your thinking on the questions above…"></textarea>'
      + "</div>"
      + '<div class="chip-row">'
      + '<button class="btn btn--secondary btn--sm" type="button" data-action="ws-reply">Add my reply</button>'
      + '<button class="btn btn--primary btn--sm" type="button" data-action="ws-coach">Coach this stage again</button>'
      + '<button class="btn btn--ghost btn--sm" type="button" data-action="ws-next-stage">Advance to next stage →</button>'
      + "</div></div>";
  }

  /* ---------- problem-summary synthesis ----------
     An evolving one-line synthesis of captured notes, rather than just echoing
     the original statement. Falls back to the statement when nothing captured. */
  function problemSynthesis(sess) {
    var text = sess.problemText || "";
    var notes = [];
    var sd = sess.stageData || {};
    Object.keys(sd).forEach(function (k) {
      var v = sd[k];
      if (v && typeof v === "object" && typeof v.notes === "string" && v.notes.trim()) {
        notes.push(v.notes.trim());
      }
    });
    if (!notes.length) return text;
    /* take the most recent captured note's first sentence as the evolving line */
    var latest = notes[notes.length - 1];
    var firstSentence = String(latest).split(/[.\n]/)[0].trim();
    if (!firstSentence) return text;
    return (text ? text + " " : "")
      + "Latest thinking: " + firstSentence + (firstSentence.length < latest.length ? "…" : "") + ".";
  }

  /* ---------- next-actions derivation ----------
     Derived from engine output: readiness gaps, the top role-integrity
     opportunity, and the current stage's "what good looks like" hints. */
  function deriveNextActions(sess) {
    var actions = [];
    try {
      var readiness = E().assessProblemReadiness(sess);
      if (readiness && readiness.gaps && readiness.gaps.length) {
        actions.push("Strengthen the problem framing: " + readiness.gaps[0]);
      }
      var ri = E().assessRoleIntegrity(sess);
      if (ri && ri.opportunities && ri.opportunities.length) {
        actions.push(ri.opportunities[0]);
      }
      var coaching = E().getStageCoaching(sess.currentStage || 1, sess);
      if (coaching && coaching.summaryHints && coaching.summaryHints.length) {
        actions.push("Aim for: " + coaching.summaryHints[0]);
      }
    } catch (e) { /* keep whatever we gathered */ }
    /* de-duplicate, cap at 4 */
    var seen = {}, out = [];
    actions.forEach(function (a) { if (a && !seen[a]) { seen[a] = 1; out.push(a); } });
    return out.slice(0, 4);
  }

  /* ---------- shared side-panel builder (single source of truth) ----------
     Used by both the full render and the imperative refresh, so the two can
     never drift. opts.cfEditing toggles the customer-first inline editor. */
  function sidePanelsHtml(sess, opts) {
    opts = opts || {};
    var text = sess.problemText || "";
    var conf = E().dataConfidence(sess);
    var assumptions = sess.assumptions || [];
    var assumptionsCard = '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Assumptions</span>'
      + '<h3 class="card__title">What are we treating as true?</h3></div></div>'
      + (assumptions.length
        ? P().list(assumptions)
        : '<p class="muted">None captured yet. Naming assumptions early — especially where data is missing — keeps you honest about what you actually know.</p>')
      + "</div>";

    var summary = problemSynthesis(sess);
    var problemSummaryCard = '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Problem summary</span>'
      + '<h3 class="card__title">In a nutshell</h3></div></div>'
      + (summary
        ? '<p class="muted">' + esc(summary) + "</p>"
        : '<p class="muted">Your problem statement will summarise here once you add one above.</p>')
      + "</div>";

    return '<aside class="stack" id="ws-panels">'
      + problemSummaryCard
      + P().customerFirstCard(sess.customerFirst || {}, sess.evidenceConfidence, { editing: !!opts.cfEditing })
      + assumptionsCard
      + P().dataConfidence(conf)
      + P().journeyChecklist(E().journeyChecklistFor(sess))
      + P().roleIntegrityInsight(E().assessRoleIntegrity(sess))
      + P().futureExternalPrompts(E().futureExternalPrompts(text))
      + P().processSupportPrompts(E().processSupportPrompts(text))
      + P().nextActions(sess.nextActions && sess.nextActions.length ? sess.nextActions : deriveNextActions(sess))
      + "</aside>";
  }

  /* ---------- readiness banner area (above stepper) ---------- */
  function readinessFor(sess) {
    try { return E().assessProblemReadiness(sess); }
    catch (e) { return { ready: true, solutionBiased: false, advisory: "", gaps: [], note: "" }; }
  }

  /* ============================================================
     render
     ============================================================ */
  function render(root, ctx) {
    var sess = session();
    var readiness = readinessFor(sess);

    root.innerHTML = ''
      + '<div class="stack">'
      + '  <header class="stack">'
      + '    <span class="eyebrow">Coaching workspace</span>'
      + '    <h1 class="view-title">' + esc(sess.title || "Coaching workspace") + "</h1>"
      + '    <p class="view-lead">Think it through, one stage at a time. I will recommend a mode, ask high-value questions and keep the customer, the evidence and the whole journey in view.</p>'
      + "  </header>"
      + P().disclaimer({ inline: true, dismissible: true })
      + renderStepper(sess, readiness)
      + '  <div class="grid grid--sidebar">'
      + '    <div class="stack">'
      + problemInput(sess)
      + chatPanel(sess)
      + "    </div>"
      + sidePanelsHtml(sess)
      + "  </div>"
      + "</div>";
  }

  /* ============================================================
     mount — wire listeners; update results imperatively
     ============================================================ */
  function mount(root, ctx) {
    var store = (ctx && ctx.store) || S();
    var navigate = (ctx && ctx.navigate) || (window.CJM_APP && window.CJM_APP.navigate) || function () {};

    function chat() { return root.querySelector("#ws-chat"); }
    function appendToChat(html) {
      var c = chat();
      if (!c) return;
      var tmp = document.createElement("div");
      tmp.innerHTML = html;
      while (tmp.firstChild) c.appendChild(tmp.firstChild);
      c.scrollTop = c.scrollHeight;
    }

    /* refresh ONLY the recommendation block + side panels imperatively
       (never the textarea / chat, so focus + log survive) */
    function refreshRecoBlock() {
      var sess = session();
      var holder = root.querySelector("#ws-reco");
      if (holder && sess.problemText && String(sess.problemText).trim()) {
        var reco = E().recommendMode(sess.problemText);
        var bias = E().detectSolutionBias(sess.problemText);
        var biasHtml = "";
        if (bias.biased) {
          biasHtml = '<div class="callout-risk" style="margin-top:var(--sp-3)">'
            + '<span class="callout-risk__label">A gentle nudge before we solution</span>'
            + 'It looks like a solution may already be in mind. That instinct is useful later — for now, let us make sure we are solving the right problem first. '
            + (bias.signals && bias.signals.length ? "What I noticed: " + esc(bias.signals.slice(0, 3).join("; ")) + "." : "")
            + "</div>";
        }
        /* preserve current select value into session before rebuild */
        var modes = D().modes || [];
        var selected = sess.selectedMode || sess.recommendedMode || "";
        var opts = modes.map(function (m) {
          return '<option value="' + esc(m.id) + '"' + (m.id === selected ? " selected" : "") + ">" + esc(m.label) + "</option>";
        }).join("");
        holder.innerHTML = P().recommendedModeBlock(reco) + biasHtml
          + '<div class="field" style="margin-top:var(--sp-3)">'
          + '<label class="field__label" for="ws-mode">Support mode (you can override)</label>'
          + '<span class="field__hint">The recommendation is a suggestion, never a constraint.</span>'
          + '<select id="ws-mode" class="select">' + opts + "</select></div>";
      }
    }

    /* whether the customer-first card is in inline-edit mode (preserved across
       imperative refreshes so the form does not snap shut while typing) */
    var cfEditing = false;

    function refreshSidePanels() {
      var sess = session();
      var aside = root.querySelector("#ws-panels");
      if (!aside) return;
      var rebuilt = document.createElement("div");
      /* single shared builder at module scope — render + refresh never drift */
      rebuilt.innerHTML = sidePanelsHtml(sess, { cfEditing: cfEditing });
      var fresh = rebuilt.querySelector("#ws-panels");
      if (fresh) aside.innerHTML = fresh.innerHTML;
    }

    function refreshStepper() {
      var sess = session();
      var readiness = readinessFor(sess);
      var holder = root.querySelector("#ws-stepper");
      if (!holder) return;
      var tmp = document.createElement("div");
      tmp.innerHTML = renderStepperHtml(sess, readiness);
      var fresh = tmp.querySelector("#ws-stepper");
      if (fresh) holder.innerHTML = fresh.innerHTML;
    }
    function renderStepperHtml(sess, readiness) {
      var stages = D().stages || [];
      var current = sess.currentStage || 1;
      var advisoryActive = readiness && (!readiness.ready || readiness.solutionBiased);
      var steps = stages.map(function (st) {
        var stateCls = stepStateClass(st.id, current, advisoryActive);
        var nodeContent = (st.id < current) ? "✓" : String(st.id);
        var label = (st.id === 4 && advisoryActive)
          ? '<span class="step__label muted" style="font-size:var(--fs-xs)">needs framing</span>'
          : '<span class="step__label">' + esc(st.title) + "</span>";
        return '<div class="step ' + stateCls + '" data-stage="' + st.id + '">'
          + '<span class="step__connector" aria-hidden="true"></span>'
          + '<button class="step__node step__node--btn" type="button" data-action="goto-stage" data-stage="' + st.id + '">' + nodeContent + "</button>"
          + label + "</div>";
      }).join("");
      return '<nav class="stepper" id="ws-stepper" aria-label="Five-stage thinking framework">' + steps + "</nav>";
    }

    /* ---------- submit problem ---------- */
    function submitProblem() {
      var ta = root.querySelector("#ws-problem");
      var text = ta ? String(ta.value || "").trim() : "";
      if (!text) {
        appendToChat(coachBubble("<p>Add a line or two about what you are working on and I will recommend a mode to get us going.</p>", "Just a nudge"));
        return;
      }
      var reco = E().recommendMode(text);
      store.updateSession({
        problemText: text,
        recommendedMode: reco.mode,
        selectedMode: session().selectedMode || reco.mode,
        currentStage: session().currentStage || 1
      });
      store.updateSession({ nextActions: deriveNextActions(session()) });
      refreshRecoBlock();
      refreshSidePanels();
      refreshStepper();
      appendToChat(userBubble(text, "Your problem"));
      var bias = E().detectSolutionBias(text);
      if (bias.biased) {
        appendToChat(coachBubble(
          '<span class="eyebrow">Before we go further</span>'
          + '<p style="margin-top:var(--sp-2)">It reads as though a solution may already be in mind. No problem — let us briefly make sure we are solving the right thing first.</p>'
          + (bias.signals && bias.signals.length ? '<div class="mini-panel"><div class="mini-panel__title">What prompted this</div>' + P().list(bias.signals) + "</div>" : ""),
          "Gentle challenge"
        ));
      }
      appendToChat(stageCoachingBubbleHtml(session().currentStage || 1, session()));
    }

    /* ---------- add a free-text reply ---------- */
    function addReply() {
      var ta = root.querySelector("#ws-note");
      var text = ta ? String(ta.value || "").trim() : "";
      if (!text) return;
      appendToChat(userBubble(text, "Stage " + (session().currentStage || 1)));
      /* capture reply into the current stage's notes + treat as assumption hints */
      var sess = session();
      var sd = sess.stageData || {};
      var key = String(sess.currentStage || 1);
      sd[key] = sd[key] || {};
      sd[key].notes = (sd[key].notes ? sd[key].notes + "\n" : "") + text;
      var patch = { stageData: sd };
      /* lightweight assumption capture: extract just the sentence that mentions
         'assum' (not the whole reply), and de-duplicate before storing */
      if (/\bassum/i.test(text)) {
        var sentence = text.split(/[.!?\n]+/).filter(function (s) {
          return /\bassum/i.test(s);
        })[0] || text;
        sentence = sentence.trim();
        var a = (sess.assumptions || []).slice();
        if (sentence && a.indexOf(sentence) === -1) {
          a.push(sentence);
          patch.assumptions = a;
        }
      }
      store.updateSession(patch);
      /* refresh derived next-actions from the new state */
      store.updateSession({ nextActions: deriveNextActions(session()) });
      if (ta) ta.value = "";
      refreshSidePanels();
      refreshStepper();
      /* brief acknowledgement, not a graded response */
      appendToChat(coachBubble(
        "<p>Noted — that is captured in the log and reflected in the panels. When you are ready, ask for the next prompt or move on a stage.</p>",
        "Captured"
      ));
    }

    /* ---------- re-coach current stage ---------- */
    function coachStage() {
      appendToChat(stageCoachingBubbleHtml(session().currentStage || 1, session()));
    }

    /* ---------- stage navigation (advisory, never hard-block) ---------- */
    function gotoStage(target) {
      target = Math.max(1, Math.min(5, Number(target) || 1));
      var sess = session();
      /* Stage 4 advisory check */
      if (target === 4) {
        var readiness = readinessFor(sess);
        if (!readiness.ready || readiness.solutionBiased) {
          appendToChat(advisoryBubbleHtml(readiness));
          /* still proceed — advisory only */
        }
      }
      store.updateSession({ currentStage: target });
      store.updateSession({ nextActions: deriveNextActions(session()) });
      refreshStepper();
      refreshSidePanels();
      appendToChat(stageCoachingBubbleHtml(target, session()));
    }

    function nextStage() {
      var current = session().currentStage || 1;
      gotoStage(Math.min(5, current + 1));
    }

    /* ---------- persist the customer-first inline editor into the session ----------
       Reads the live inputs and writes session.customerFirst + evidenceConfidence.
       Does NOT refresh side panels (that would drop input focus while typing). */
    function captureCustomerFirst() {
      var inputs = root.querySelectorAll("[data-cf-key]");
      if (!inputs || !inputs.length) return;
      var cf = Object.assign({}, session().customerFirst || {});
      var confText = "";
      Array.prototype.forEach.call(inputs, function (el) {
        var key = el.getAttribute("data-cf-key");
        var val = String(el.value || "").trim();
        cf[key] = val;
        if (key === "confidence") confText = val.toLowerCase();
      });
      var patch = { customerFirst: cf };
      /* derive an evidence-confidence level from the confidence field, if given */
      if (confText) {
        if (/high/.test(confText)) patch.evidenceConfidence = "high";
        else if (/med/.test(confText)) patch.evidenceConfidence = "medium";
        else if (/low/.test(confText)) patch.evidenceConfidence = "low";
      }
      store.updateSession(patch);
    }

    /* ---------- persist a single journey-checklist note ---------- */
    function captureJourneyNote(el) {
      if (!el) return;
      var key = el.getAttribute("data-journey-key");
      if (!key) return;
      var notes = Object.assign({}, session().journeyNotes || {});
      notes[key] = String(el.value || "").trim();
      store.updateSession({ journeyNotes: notes });
    }

    /* ---------- delegated click handling ---------- */
    root.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn || !root.contains(btn)) return;
      var action = btn.getAttribute("data-action");

      if (action === "ws-submit") { e.preventDefault(); submitProblem(); }
      else if (action === "ws-reply") { e.preventDefault(); addReply(); }
      else if (action === "ws-coach") { e.preventDefault(); coachStage(); }
      else if (action === "ws-next-stage") { e.preventDefault(); nextStage(); }
      else if (action === "goto-stage") { e.preventDefault(); gotoStage(btn.getAttribute("data-stage")); }
      else if (action === "ws-save") {
        e.preventDefault();
        var ta = root.querySelector("#ws-problem");
        if (ta && String(ta.value || "").trim() && (!session().problemText)) {
          store.updateSession({ problemText: String(ta.value).trim() });
        }
        var snap = store.saveSession();
        appendToChat(coachBubble(
          snap ? "<p>Session saved. You will find it on the dashboard under recent sessions.</p>"
               : "<p>Add a problem statement first, then I can save the session for you.</p>",
          "Saved"
        ));
      }
      else if (action === "ws-clear") {
        e.preventDefault();
        store.newSession({});
        navigate("workspace");
      }
      else if (action === "toggle-disclaimer") {
        e.preventDefault();
        var d = btn.closest(".disclaimer");
        if (d) {
          d.classList.toggle("is-collapsed");
          btn.textContent = d.classList.contains("is-collapsed") ? "Show" : "Hide";
        }
      }
      else if (action === "cf-edit") {
        e.preventDefault();
        cfEditing = true;
        refreshSidePanels();
        var firstCf = root.querySelector("[data-cf-key]");
        if (firstCf && firstCf.focus) firstCf.focus();
      }
      else if (action === "cf-done") {
        e.preventDefault();
        captureCustomerFirst();   /* persist any final edits before closing */
        cfEditing = false;
        store.updateSession({ nextActions: deriveNextActions(session()) });
        refreshSidePanels();
      }
      else if (action === "toggle-panel") {
        e.preventDefault();
        var panel = btn.closest(".panel");
        if (panel) {
          var open = panel.classList.toggle("is-open");
          panel.classList.toggle("is-collapsed", !open);
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        }
      }
    });

    /* ---------- mode override + problem text persist (no re-render) ---------- */
    root.addEventListener("change", function (e) {
      var t = e.target;
      if (t && t.id === "ws-mode") {
        store.updateSession({ selectedMode: t.value });
        appendToChat(coachBubble(
          "<p>Mode set to <strong>" + esc(E().modeLabel(t.value)) + "</strong>. The recommendation stays visible, but we will follow your choice.</p>",
          "Mode override"
        ));
      }
    });

    /* persist field edits on blur so panels/readiness stay current WITHOUT
       disturbing focus while typing. Customer-first + journey notes persist
       silently (no panel refresh while the editor is open). */
    root.addEventListener("blur", function (e) {
      var t = e.target;
      if (!t) return;

      if (t.id === "ws-problem") {
        var v = String(t.value || "").trim();
        if (v && v !== session().problemText) {
          var reco = E().recommendMode(v);
          store.updateSession({
            problemText: v,
            recommendedMode: reco.mode,
            selectedMode: session().selectedMode || reco.mode
          });
          store.updateSession({ nextActions: deriveNextActions(session()) });
          refreshRecoBlock();
          refreshSidePanels();
          refreshStepper();
        }
        return;
      }

      /* customer-first inline editor field lost focus -> persist the whole form */
      if (t.getAttribute && t.getAttribute("data-cf-key") != null) {
        captureCustomerFirst();
        return;
      }

      /* journey-checklist note lost focus -> persist silently. We do NOT refresh
         the panel here: the user may be tabbing to the next note, and a rebuild
         would drop their focus. The answered/tick state refreshes on the next
         natural panel refresh (reply, stage change, etc.). */
      if (t.getAttribute && t.getAttribute("data-journey-key") != null) {
        captureJourneyNote(t);
        return;
      }
    }, true);

    /* Activate the chat live region AFTER first paint, so screen readers do not
       read the whole seeded log on load — only messages appended later. */
    var liveTimer = window.setTimeout(function () {
      var c = chat();
      if (c) c.setAttribute("aria-live", "polite");
    }, 0);
    void liveTimer;
  }

  window.CJM_VIEWS.workspace = { render: render, mount: mount };
})();
