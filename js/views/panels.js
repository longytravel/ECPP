/* ============================================================
   CJM COACH PORTAL — SHARED PANEL HELPERS
   window.CJM_PANELS : pure functions returning HTML STRINGS.
   No DOM mutation, no listeners. Views inject these strings.
   British English throughout.
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.CJM_DATA || {};

  /* ---------- escaping ---------- */
  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function list(items, cls) {
    if (!items || !items.length) return "";
    return '<ul class="' + (cls || "") + '">' + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }
  function confClass(level) {
    if (level === "high") return "high";
    if (level === "medium") return "med";
    return "low";
  }
  function meterClass(value) {
    if (value >= 70) return "high";
    if (value >= 45) return "med";
    return "low";
  }

  /* ============================================================
     confidenceBadge(level) -> chip HTML
     ============================================================ */
  function confidenceBadge(level) {
    var cls = confClass(level);
    var label = level === "high" ? "High confidence" : (level === "medium" ? "Medium confidence" : "Low confidence");
    return '<span class="chip chip--' + cls + '"><span class="chip__dot"></span>' + esc(label) + "</span>";
  }

  /* ============================================================
     modeChip(modeId, { recommended })
     ============================================================ */
  function modeChip(modeId, opts) {
    opts = opts || {};
    var label = (window.CJM_ENGINE && window.CJM_ENGINE.modeLabel) ? window.CJM_ENGINE.modeLabel(modeId) : modeId;
    var cls = opts.recommended ? "chip chip--recommended" : "chip chip--mode";
    var star = opts.recommended ? "★ " : "";
    return '<span class="' + cls + '">' + star + esc(label) + "</span>";
  }

  /* ============================================================
     customerFirstCard(customerFirst, confidenceLevel)
     ============================================================ */
  function customerFirstCard(customerFirst, confidenceLevel, opts) {
    customerFirst = customerFirst || {};
    opts = opts || {};
    var editing = !!opts.editing;
    var fields = DATA.customerFirstFields || [];

    if (editing) {
      /* editable form — the workspace persists each field via store.updateSession
         and re-renders this card imperatively */
      var inputs = fields.map(function (f) {
        var raw = customerFirst[f.key];
        var val = raw != null ? esc(raw) : "";
        var tall = (f.key === "customerPain" || f.key === "targetOutcome" || f.key === "whyItMatters");
        var control = tall
          ? '<textarea class="textarea" rows="2" data-cf-key="' + esc(f.key) + '" placeholder="' + esc(f.placeholder || "") + '">' + val + "</textarea>"
          : '<input class="input" type="text" data-cf-key="' + esc(f.key) + '" placeholder="' + esc(f.placeholder || "") + '" value="' + val + '" />';
        return '<div class="field" style="margin-bottom:var(--sp-3)">'
          + '<label class="field__label" style="font-size:var(--fs-xs)">' + esc(f.label) + "</label>"
          + control + "</div>";
      }).join("");
      return '<div class="card card--accent-rail cf-card">'
        + '<div class="card__header"><div><span class="eyebrow">North star</span>'
        + '<h3 class="card__title">Customer-first framing</h3></div>'
        + '<button class="btn btn--ghost btn--sm" type="button" data-action="cf-done">Done</button></div>'
        + inputs + "</div>";
    }

    var rows = fields.map(function (f) {
      var raw = customerFirst[f.key];
      var has = raw != null && String(raw).trim().length > 0;
      var valueCls = has ? "cf-field__value" : "cf-field__value cf-field__value--empty";
      var value = has ? esc(raw) : esc(f.placeholder || "Not yet captured");
      return '<div class="cf-field"><span class="cf-field__label">' + esc(f.label) + '</span>'
        + '<span class="' + valueCls + '">' + value + "</span></div>";
    }).join("");
    var badge = confidenceLevel ? '<div style="margin-top:var(--sp-3)">' + confidenceBadge(confidenceLevel) + "</div>" : "";
    return '<div class="card card--accent-rail cf-card">'
      + '<div class="card__header"><div><span class="eyebrow">North star</span>'
      + '<h3 class="card__title">Customer-first framing</h3></div>'
      + '<button class="btn btn--ghost btn--sm" type="button" data-action="cf-edit">Edit</button></div>'
      + rows + badge + "</div>";
  }

  /* ============================================================
     journeyChecklist(items)
     items = engine.journeyChecklistFor(session)
     ============================================================ */
  function journeyChecklist(items) {
    items = items || [];
    var rows = items.map(function (it) {
      var tag = it.answered ? "" : '<span class="checklist__tag" title="Worth a note">unanswered</span>';
      var mark = it.answered ? "✓" : "○";
      var noteVal = it.note ? esc(it.note) : "";
      var noteInput = '<textarea class="input checklist__input" rows="1" '
        + 'data-journey-key="' + esc(it.key) + '" '
        + 'placeholder="Add a note — what did you find?" '
        + 'style="margin-top:var(--sp-2);min-height:0;font-size:var(--fs-xs)">' + noteVal + "</textarea>";
      return '<li class="checklist__item" data-journey-key="' + esc(it.key) + '">'
        + '<span class="checklist__toggle" aria-hidden="true">' + mark + "</span>"
        + '<span class="checklist__prompt">' + esc(it.prompt) + tag + noteInput + "</span></li>";
    }).join("");
    return panelShell("⇄", "End-to-end journey check", '<ul class="checklist">' + rows + "</ul>");
  }

  /* ---------- collapsible panel shell (header is a real toggle button) ---------- */
  function panelShell(icon, title, bodyHtml) {
    return '<div class="panel is-open">'
      + '<button class="panel__header" type="button" data-action="toggle-panel" aria-expanded="true">'
      + '<span class="panel__icon" aria-hidden="true">' + icon + "</span>"
      + '<span class="panel__title">' + esc(title) + "</span>"
      + '<span class="panel__chevron" aria-hidden="true">'
      + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>'
      + "</span></button>"
      + '<div class="panel__body">' + bodyHtml + "</div></div>";
  }

  /* ============================================================
     roleIntegrityInsight(roleIntegrity)
     roleIntegrity = engine.assessRoleIntegrity(session)
     ============================================================ */
  function roleIntegrityInsight(roleIntegrity) {
    if (!roleIntegrity) return "";
    var modeLabelMap = { "journey-owner": "Journey owner", "balanced": "Balanced", "documentation": "Documentation mode" };
    var seg = ["documentation", "balanced", "journey-owner"].map(function (m) {
      var on = roleIntegrity.mode === m ? " is-on" : "";
      return '<span class="gauge__seg' + on + '">' + esc(modeLabelMap[m]) + "</span>";
    }).join("");

    var dims = DATA.roleIntegrityDimensions || [];
    var meters = dims.map(function (d) {
      var v = (roleIntegrity.scores && roleIntegrity.scores[d.key] != null) ? roleIntegrity.scores[d.key] : 0;
      return scoreMeter(d.label, v);
    }).join("");

    var insights = (roleIntegrity.insights || []).map(function (ins) {
      var oppCls = ins.kind === "opportunity" ? " insight--opportunity" : "";
      var icon = ins.kind === "opportunity" ? "↗" : (ins.kind === "note" ? "ℹ" : "✓");
      return '<div class="insight' + oppCls + '"><span class="insight__icon" aria-hidden="true">' + icon + "</span>"
        + '<span class="insight__text">' + esc(ins.text) + "</span></div>";
    }).join("");

    return '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Role integrity</span>'
      + '<h3 class="card__title">Are you holding the journey-owner role?</h3></div></div>'
      + '<div class="gauge">' + seg + "</div>"
      + '<div style="margin-top:var(--sp-4)">' + meters + "</div>"
      + '<div>' + insights + "</div>"
      + '<p class="muted" style="font-size:var(--fs-xs)">' + esc(roleIntegrity.note || "") + "</p>"
      + "</div>";
  }

  /* ============================================================
     scoreMeter(label, value) — single labelled meter
     ============================================================ */
  function scoreMeter(label, value) {
    value = Math.max(0, Math.min(100, Math.round(value || 0)));
    var mc = meterClass(value);
    return '<div class="meter">'
      + '<div class="meter__label"><span>' + esc(label) + '</span><span class="meter__value">' + value + "/100</span></div>"
      + '<div class="meter__track"><div class="meter__fill meter__fill--' + mc + '" style="width:' + value + '%"></div></div>'
      + "</div>";
  }

  /* ============================================================
     dataConfidence(conf) — meter for engine.dataConfidence(...)
     ============================================================ */
  function dataConfidence(conf) {
    if (!conf) return "";
    var level = conf.level || "low";
    var onCount = level === "high" ? 3 : (level === "medium" ? 2 : 1);
    var dots = [0, 1, 2].map(function (i) {
      var on = i < onCount ? " is-on--" + confClass(level) : "";
      return '<span class="confidence-meter__dot' + on + '"></span>';
    }).join("");
    var flags = (conf.assumptionsToFlag && conf.assumptionsToFlag.length)
      ? '<div class="mini-panel"><div class="mini-panel__title">Assumptions to flag</div>' + list(conf.assumptionsToFlag) + "</div>"
      : "";
    return '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Evidence confidence</span>'
      + '<h3 class="card__title">How strong is the evidence?</h3></div>' + confidenceBadge(level === "medium" ? "medium" : level) + "</div>"
      + '<div class="confidence-meter"><div class="confidence-meter__dots">' + dots + "</div>"
      + '<span class="confidence-meter__note">' + esc(conf.note || "") + "</span></div>"
      + flags + "</div>";
  }

  /* ============================================================
     futureExternalPrompts(prompts)  — array of strings
     ============================================================ */
  function futureExternalPrompts(prompts) {
    prompts = prompts || [];
    return panelShell("⌖", "Future & external thinking", list(prompts));
  }

  /* ============================================================
     processSupportPrompts(ps) — engine.processSupportPrompts(...)
     ============================================================ */
  function processSupportPrompts(ps) {
    if (!ps) return "";
    function block(title, items) {
      if (!items || !items.length) return "";
      return '<div class="mini-panel"><div class="mini-panel__title">' + esc(title) + "</div>" + list(items) + "</div>";
    }
    return '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Process &amp; governance</span>'
      + '<h3 class="card__title">Light-touch process support</h3></div></div>'
      + block("Risk considerations", ps.riskConsiderations)
      + block("Risk as opportunity", ps.riskOpportunityThinking)
      + block("Governance pathways", ps.governancePathways)
      + block("Policy ownership", ps.policyOwnership)
      + block("Stakeholders & controls", ps.stakeholdersControls)
      + disclaimer({ inline: true, text: ps.disclaimer })
      + "</div>";
  }

  /* ============================================================
     nextActions(actions) — array of strings
     ============================================================ */
  function nextActions(actions) {
    actions = actions || [];
    if (!actions.length) {
      return '<div class="card"><span class="eyebrow">Next actions</span>'
        + '<p class="muted" style="margin-top:var(--sp-2)">No next actions yet — work through a stage and they will appear here.</p></div>';
    }
    var rows = actions.map(function (a, i) {
      return '<li class="next-actions__item"><span class="next-actions__marker">' + (i + 1) + "</span>"
        + '<span class="next-actions__text">' + esc(a) + "</span></li>";
    }).join("");
    return '<div class="card stack">'
      + '<div class="card__header"><div><span class="eyebrow">Next actions</span>'
      + '<h3 class="card__title">Where to go next</h3></div></div>'
      + '<ol class="next-actions">' + rows + "</ol></div>";
  }

  /* ============================================================
     disclaimer({ inline, dismissible, text })
     ============================================================ */
  function disclaimer(opts) {
    opts = opts || {};
    var text = opts.text || "This portal is a coaching partner, not a decision-maker. It does not make governance, risk or compliance decisions and provides no formal sign-off. Always confirm with the relevant risk, policy and governance owners before proceeding.";
    var cls = "disclaimer" + (opts.inline ? " disclaimer--inline" : "");
    var dismiss = opts.dismissible
      ? '<button class="disclaimer__dismiss" type="button" data-action="toggle-disclaimer">Hide</button>'
      : "";
    var summary = '<span class="disclaimer__summary">Coaching partner — no formal sign-off.</span>';
    var icon = '<span class="disclaimer__icon" aria-hidden="true">'
      + '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"></path></svg></span>';
    return '<div class="' + cls + '" role="note">' + icon
      + '<div class="disclaimer__body"><span class="disclaimer__title">A coaching partner, not a decision-maker.</span>'
      + '<span class="disclaimer__text">' + esc(text) + "</span>" + summary + "</div>" + dismiss + "</div>";
  }

  /* ============================================================
     Extra reusable bits views may want
     ============================================================ */
  function recommendedModeBlock(reco) {
    if (!reco) return "";
    var alts = (reco.alternatives || []).map(function (a) { return modeChip(a.mode); }).join(" ");
    return '<div class="reco">'
      + '<span class="eyebrow">Recommended mode</span>'
      + modeChip(reco.mode, { recommended: true })
      + (alts ? '<span class="muted" style="font-size:var(--fs-xs)">or</span>' + alts : "")
      + '<p class="reco__rationale">' + esc(reco.rationale || "") + "</p></div>";
  }

  function emptyState(opts) {
    opts = opts || {};
    var cta = opts.ctaHtml || "";
    return '<div class="empty">'
      + '<div class="empty__glyph" aria-hidden="true"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg></div>'
      + '<div class="empty__title">' + esc(opts.title || "Nothing here yet") + "</div>"
      + '<div class="empty__sub">' + esc(opts.sub || "") + "</div>"
      + cta + "</div>";
  }

  /* ---------- export ---------- */
  window.CJM_PANELS = {
    esc: esc,
    list: list,
    confidenceBadge: confidenceBadge,
    modeChip: modeChip,
    scoreMeter: scoreMeter,
    customerFirstCard: customerFirstCard,
    journeyChecklist: journeyChecklist,
    roleIntegrityInsight: roleIntegrityInsight,
    dataConfidence: dataConfidence,
    futureExternalPrompts: futureExternalPrompts,
    processSupportPrompts: processSupportPrompts,
    nextActions: nextActions,
    disclaimer: disclaimer,
    recommendedModeBlock: recommendedModeBlock,
    emptyState: emptyState
  };
})();
