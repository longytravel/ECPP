/* ============================================================
   CJM COACH PORTAL — ENGINE
   window.CJM_ENGINE : deterministic, keyword/regex heuristics.
   NO DOM, NO randomness, NO network. Pure functions over strings.
   British English throughout.
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.CJM_DATA || {};

  /* ---------- helpers ---------- */
  function lc(t) { return (t == null ? "" : String(t)).toLowerCase(); }
  function len(t) { return (t == null ? "" : String(t)).trim().length; }
  function countMatches(text, list) {
    var n = 0, low = lc(text), i;
    for (i = 0; i < list.length; i++) { if (low.indexOf(list[i]) !== -1) n++; }
    return n;
  }
  function firstIndexOfAny(low, list) {
    var best = -1, i, idx;
    for (i = 0; i < list.length; i++) {
      idx = low.indexOf(list[i]);
      if (idx !== -1 && (best === -1 || idx < best)) best = idx;
    }
    return best;
  }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function uniq(arr) { var seen = {}, out = [], i, k; for (i = 0; i < arr.length; i++) { k = arr[i]; if (!seen[k]) { seen[k] = 1; out.push(k); } } return out; }
  function modeLabel(id) {
    var m = (DATA.modes || []).filter(function (x) { return x.id === id; });
    return m.length ? m[0].label : id;
  }

  /* ============================================================
     1) recommendMode(text)
     -> { mode, label, rationale, alternatives:[{mode,label}] }
     ============================================================ */
  var MODE_RULES = [
    {
      mode: "weekly-reflection",
      regex: /\b(this|last|past)\s+week\b|\breflect(ion)?\b|\bretrospect|\blessons?\s+learn|\bblockers?\b/i,
      keywords: ["this week", "last week", "reflect", "reflection", "achieved", "blockers", "lessons learned", "retrospective", "looking back", "my week", "intended outcomes", "progress this"],
      minSignals: 1,
      note: "Time-framed reflection language detected, but if you are actually describing a live problem, Five-Stage Coaching may suit better."
    },
    {
      mode: "requirement-validator",
      regex: /\bas an?\b[\s\S]*\bi want\b|\bso that\b|\bacceptance criteria\b|\bgiven\b[\s\S]*\bwhen\b[\s\S]*\bthen\b|\bepic(s)?\b|\buser stor(y|ies)\b|\brequirements?\b|\bchange request/i,
      keywords: ["user story", "user stories", "acceptance criteria", "epic", "epics", "requirement", "requirements", "story", "stories", "as a", "i want", "so that", "given when then", "gherkin", "change request", "backlog", "definition of done", "spec", "specification", "ticket"],
      minSignals: 1,
      note: "A single requirement-style word with little structure is weak evidence; Five-Stage Coaching is the top alternative."
    },
    {
      mode: "end-to-end-journey",
      regex: /\b(up|down)stream\b|\bhand[\s-]?offs?\b|\bend[\s-]?to[\s-]?end\b|\blocal\s+(fix|improvement|change|optimisation)\b|\bknock[\s-]?on\b|\bripple\b/i,
      keywords: ["upstream", "downstream", "hand-off", "handoff", "hand off", "end-to-end", "end to end", "whole journey", "local fix", "local improvement", "one step", "downstream friction", "ripple", "knock-on", "other teams", "affected elsewhere", "cross-team", "stage of the journey"],
      minSignals: 1,
      note: "If journey words appear but the core ask is still 'what is the problem', Five-Stage Coaching is a sound alternative."
    },
    {
      mode: "future-external-thinking",
      regex: /\b(2|3|two|three)[\s-]+(to[\s-]+(2|3|two|three)[\s-]+)?years?\b|\bemerging\b|\bbest[\s-]?in[\s-]?class\b|\bindustry\s+best\s+practice\b|\bbenchmark|\bfuture[\s-]?state\b|\bforward[\s-]?looking\b/i,
      keywords: ["future", "2-3 years", "two to three years", "next few years", "emerging", "emerging technology", "trend", "trends", "best-in-class", "best in class", "industry best practice", "benchmark", "competitor", "competitors", "customer expectations shift", "forward-looking", "innovation", "2026", "2027", "2028", "2029"],
      minSignals: 1,
      note: "A lone word like 'future' is weak; Five-Stage Coaching remains a visible alternative."
    },
    {
      mode: "process-governance-support",
      regex: /\bgovernance\b|\bcompliance\b|\bpolic(y|ies)\b|\bsign[\s-]?off\b|\bregulat/i,
      keywords: ["governance", "risk process", "compliance", "policy", "policies", "sign-off", "sign off", "approval", "control", "controls", "audit", "regulatory", "regulation", "data protection", "gdpr", "privacy", "stakeholder approval", "escalation", "risk appetite", "mandate"],
      minSignals: 1,
      note: "This is light-touch orientation only. The portal does not make governance, risk or compliance decisions and provides no formal sign-off."
    },
    {
      mode: "customer-first-framing",
      regex: /\bcustomers?\b|\bpain[\s-]?points?\b|\bfriction\b|\bdrop[\s-]?(out|off)|\bcomplaints?\b|\bnps\b|\bcsat\b|\bcustomer\s+outcome/i,
      keywords: ["customer", "customers", "user pain", "pain point", "friction", "drop-out", "drop out", "dropping out", "complaints", "feedback", "satisfaction", "nps", "csat", "outcome", "customer outcome", "customer need", "customer experience", "cx"],
      minSignals: 2,
      note: "Customer words are ubiquitous; with weak evidence treat this as a lens, not a definitive mode. Five-Stage Coaching is offered."
    },
    {
      mode: "five-stage-coaching",
      regex: /.*/,
      keywords: ["problem", "issue", "challenge", "help me think", "not sure", "stuck", "stakeholders want", "need a", "we should", "how do i", "figure out", "don't know", "situation", "ask is"],
      minSignals: 0,
      isDefault: true,
      note: "Default route chosen on weak or ambiguous evidence; this recommendation is low-confidence and you can override it freely."
    }
  ];

  function scoreMode(rule, text, low) {
    var hits = countMatches(text, rule.keywords);
    var rx = rule.regex && rule.regex.source !== ".*" ? (rule.regex.test(text) ? 1 : 0) : 0;
    return hits + rx;
  }

  function recommendMode(text) {
    var low = lc(text), i, rule, score, winner = null, scored = [];
    /* A solution-first / premature-solutioning ask should route to the
       structured five-stage framework rather than to customer-first-framing,
       even though customer words appear. Customer-first remains available as a
       lens/alternative. This keeps poorly-framed "build a feature" requests on
       the framing path (the headline spec scenario / Problem A). */
    var biasedAsk = false;
    try { biasedAsk = detectSolutionBias(text).biased; } catch (e) { biasedAsk = false; }
    for (i = 0; i < MODE_RULES.length; i++) {
      rule = MODE_RULES[i];
      score = scoreMode(rule, text, low);
      var fires = rule.isDefault || score >= rule.minSignals || (rule.regex.source !== ".*" && rule.regex.test(text));
      /* down-rank customer-first-framing when the ask is solution-biased:
         it should not win outright, but stays a visible alternative */
      if (rule.mode === "customer-first-framing" && biasedAsk) fires = false;
      scored.push({ rule: rule, score: score, fires: fires });
      if (!winner && fires && !rule.isDefault) winner = { rule: rule, score: score };
    }
    if (!winner) winner = { rule: MODE_RULES[MODE_RULES.length - 1], score: 0 };

    /* alternatives: highest-scoring OTHER modes (excluding winner), then default */
    var alts = scored
      .filter(function (s) { return s.rule.mode !== winner.rule.mode; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 2)
      .map(function (s) { return { mode: s.rule.mode, label: modeLabel(s.rule.mode) }; });
    /* ensure five-stage-coaching is always an available fallback alternative */
    if (winner.rule.mode !== "five-stage-coaching" && !alts.some(function (a) { return a.mode === "five-stage-coaching"; })) {
      if (alts.length >= 2) alts[1] = { mode: "five-stage-coaching", label: modeLabel("five-stage-coaching") };
      else alts.push({ mode: "five-stage-coaching", label: modeLabel("five-stage-coaching") });
    }

    var lowConfidence = winner.rule.isDefault || winner.score <= 1;
    var rationale = lowConfidence
      ? "Recommended on light evidence — " + winner.rule.note
      : "Your wording points to " + modeLabel(winner.rule.mode) + ". " + winner.rule.note;

    return {
      mode: winner.rule.mode,
      label: modeLabel(winner.rule.mode),
      rationale: rationale,
      alternatives: alts,
      lowConfidence: lowConfidence
    };
  }

  /* ============================================================
     2) detectSolutionBias(text) -> { biased, signals[] }
     ============================================================ */
  var SOLUTION_NOUNS = ["feature", "button", "app", "system", "tool", "page", "dashboard", "integration", "field", "screen", "portal", "platform", "module"];
  var PROBLEM_NOUNS = ["problem", "issue", "pain", "friction", "cause", "outcome", "root cause"];
  var BIAS_VERBS = ["build", "add", "implement", "launch", "ship", "roll out", "rollout", "deploy", "create a new", "make a new"];
  var PROBLEM_CONNECTORS = ["because", "so that", "in order to", "the problem is", "customers are", "evidence shows", "to solve", "to address", "the issue is"];

  function detectSolutionBias(text) {
    var low = lc(text), signals = [];

    if (/\b(build|build me|let'?s build)\b/i.test(text)) signals.push("Names construction ('build') before a problem is defined");
    if (/\badd (a|an|the)? ?(button|feature|field|screen|page)\b/i.test(text)) signals.push("Asks to add a specific artefact rather than name a problem");
    if (/\bnew feature\b|\bnew tool\b|\bnew system\b|\bnew app\b|\bnew portal\b/i.test(text)) signals.push("Calls for a named 'new' artefact with no problem clause");
    if (/\b(the solution is|the fix is|what we need is|the answer is)\b/i.test(text)) signals.push("States the solution directly ('the solution/fix/answer is')");
    if (/\b(just|simply|quickly)\s+(do|add|build|ship|make)\b/i.test(text)) signals.push("Minimising language ('just/simply/quickly') that skips framing");
    if (/\b(roll ?out|launch|ship)\b/i.test(text)) signals.push("Reaches for roll-out/launch/ship of a named thing");
    if (/\bredesign the\b|\brebuild the\b/i.test(text)) signals.push("Proposes redesign/rebuild without a stated problem");
    if (/\b(integrate|migrate to|replace with)\b/i.test(text)) signals.push("Opens with integrate/migrate/replace as the ask");
    if (/\beveryone agrees\b|\bwe'?ve decided\b|\bit'?s been decided\b|\bi already know the answer\b/i.test(text)) signals.push("Consensus or decision asserted before evidence");
    if (/\b(asap|urgently)\b/i.test(text) && firstIndexOfAny(low, SOLUTION_NOUNS) !== -1) signals.push("Urgency paired with a named solution and no problem statement");
    if (/\b(quick win|low[\s-]hanging fruit)\b/i.test(text)) signals.push("'Quick win / low-hanging fruit' framing around a specific build");

    /* DETECTION RULE: solution-noun precedes any problem-noun */
    var solIdx = firstIndexOfAny(low, SOLUTION_NOUNS);
    var probIdx = firstIndexOfAny(low, PROBLEM_NOUNS);
    var solBeforeProblem = (solIdx !== -1 && (probIdx === -1 || solIdx < probIdx));
    if (solBeforeProblem) signals.push("A solution noun appears before any problem is named");

    /* DETECTION RULE: bias verb present with zero problem connectors */
    var hasBiasVerb = BIAS_VERBS.some(function (v) { return low.indexOf(v) !== -1; });
    var hasConnector = PROBLEM_CONNECTORS.some(function (c) { return low.indexOf(c) !== -1; });
    if (hasBiasVerb && !hasConnector) signals.push("A build/add/implement verb appears with no 'because / so that / the problem is' framing");

    /* DETECTION RULE: imperative solution verb in first 12 words */
    var firstWords = low.split(/\s+/).slice(0, 12).join(" ");
    if (/^(build|add|implement|launch|create|make|ship|deploy)\b/.test(firstWords.trim()) || /\b(build|add|implement|launch|ship|deploy)\b/.test(firstWords) && firstIndexOfAny(firstWords, SOLUTION_NOUNS) !== -1) {
      signals.push("An imperative solution verb appears in the opening words");
    }

    signals = uniq(signals);

    /* CONFIDENCE: biased only when >=2 signals OR solution clearly precedes problem */
    var biased = signals.length >= 2 || solBeforeProblem;
    return { biased: biased, signals: signals };
  }

  /* ============================================================
     3) getStageCoaching(stageId, session)
     -> { questions[3..5], lenses[], summaryHints[] }
     ============================================================ */
  var STAGE_LENSES = {
    1: ["problem", "value"],
    2: ["problem", "assumptions"],
    3: ["evidence", "customer-outcome"],
    4: ["journey", "value"],
    5: ["customer-outcome", "journey"]
  };

  function getStageCoaching(stageId, session) {
    var stages = DATA.stages || [];
    var stage = stages.filter(function (s) { return s.id === Number(stageId); })[0] || stages[0];
    var qs = (stage.coachingQuestions || []).slice(0, 5);
    if (qs.length < 3) qs = (stage.prompts || []).slice(0, 3);
    var lenses = (STAGE_LENSES[stage.id] || []).map(function (k) { return { key: k, label: lensLabel(k) }; });
    return {
      stageId: stage.id,
      title: stage.title,
      questions: qs,
      lenses: lenses,
      summaryHints: (stage.outputs || []).slice()
    };
  }
  function lensLabel(k) {
    var map = { evidence: "Evidence", problem: "Problem framing", "customer-outcome": "Customer outcome", assumptions: "Assumptions", journey: "End-to-end journey", value: "Customer value", "best-in-class": "Best-in-class", future: "Future-state" };
    return map[k] || k;
  }

  /* ============================================================
     4) assessProblemReadiness(session) -> { ready, score, gaps[], ... }
     ADVISORY only — never hard-blocks Stage 4.
     ============================================================ */
  var READINESS_GAP_COPY = {
    actualProblemStated: "The core problem is not yet clearly stated.",
    rootCauseExplored: "Root causes have not been explored — we may be looking at a symptom.",
    customerImpactArticulated: "Customer impact (who is affected and how) is not yet defined.",
    desiredOutcomeDefined: "The desired outcome / success measure is unclear.",
    assumptionsSurfaced: "Key assumptions have not been surfaced."
  };

  function readText(session) {
    if (!session) return "";
    var parts = [session.problemText || ""];
    var sd = session.stageData || {};
    Object.keys(sd).forEach(function (k) {
      var v = sd[k];
      if (typeof v === "string") parts.push(v);
      else if (v && typeof v === "object") { Object.keys(v).forEach(function (kk) { if (typeof v[kk] === "string") parts.push(v[kk]); }); }
    });
    if (session.assumptions && session.assumptions.length) parts.push(session.assumptions.join(" "));
    if (session.journeyNotes && typeof session.journeyNotes === "object") {
      Object.keys(session.journeyNotes).forEach(function (k) {
        if (typeof session.journeyNotes[k] === "string") parts.push(session.journeyNotes[k]);
      });
    } else if (typeof session.journeyNotes === "string") {
      parts.push(session.journeyNotes);
    }
    if (session.customerFirst && typeof session.customerFirst === "object") {
      Object.keys(session.customerFirst).forEach(function (k) {
        if (typeof session.customerFirst[k] === "string") parts.push(session.customerFirst[k]);
      });
    }
    return parts.join("  ");
  }

  function assessProblemReadiness(session) {
    var text = readText(session), low = lc(text);
    var s2 = (session && session.stageData && session.stageData["2"]) || (session && session.stageData && session.stageData[2]) || {};
    var fired = {};

    fired.actualProblemStated = /\b(the problem is|the real issue is|root cause)\b/i.test(text) || /\bcustomers?\s+(are|is)\s+(unable|failing|dropping|struggling)/i.test(text) || /\bbecause\b/i.test(text) || len(s2.actualProblem) > 15;
    fired.rootCauseExplored = /\b(root cause|why|underlying|driver|caused by|5 whys|five whys)\b/i.test(text) || (s2.rootCauses && len(s2.rootCauses) > 0);
    fired.customerImpactArticulated = (/\bcustomers?\b|\buser\b|\bpersona\b/i.test(text) && /\b(pain|friction|impact|affected|struggle|frustrat)/i.test(text)) || len(s2.customerImpact) > 15;
    fired.desiredOutcomeDefined = /\b(outcome|so that|success measure|target|goal|kpi|metric)\b/i.test(text) || len(s2.desiredOutcomes) > 15;
    fired.assumptionsSurfaced = /\b(assume|assumption|we believe|hypothesis)\b/i.test(text) || (session && session.assumptions && session.assumptions.length > 0) || (s2.assumptions && (s2.assumptions.length || len(s2.assumptions)) > 0);
    var bias = detectSolutionBias(session ? session.problemText || text : text);
    fired.notSolutionBiased = !bias.biased;

    var weights = { actualProblemStated: 25, rootCauseExplored: 20, customerImpactArticulated: 20, desiredOutcomeDefined: 15, assumptionsSurfaced: 10, notSolutionBiased: 10 };
    var score = 0, k;
    for (k in weights) { if (fired[k]) score += weights[k]; }
    score = clamp(score, 0, 100);

    var gaps = [];
    ["actualProblemStated", "rootCauseExplored", "customerImpactArticulated", "desiredOutcomeDefined", "assumptionsSurfaced"].forEach(function (key) {
      if (!fired[key]) gaps.push(READINESS_GAP_COPY[key]);
    });

    var ready = score >= 60 && fired.notSolutionBiased && fired.actualProblemStated;
    var band = score >= 75 ? "strong" : (score >= 60 ? "adequate" : "thin");

    var advisory;
    if (!fired.notSolutionBiased) {
      advisory = "It looks like a solution may already be in mind. That instinct is useful later — for now, let's make sure we are solving the right problem. What is the underlying problem this would address, and what evidence points to it?";
    } else if (!ready) {
      advisory = "Before exploring solutions, it is worth strengthening the problem definition. A few areas look thin: " + (gaps.join(" ") || "the problem could be sharper.") + " You can continue to Stage 4 now, but options framed on a weak problem often solve the wrong thing. Shall we sharpen the problem first?";
    } else {
      advisory = "The problem looks well enough framed to explore solutions. Keep checking each option back against the problem you defined.";
    }

    return {
      ready: ready,
      score: score,
      band: band,
      gaps: gaps,
      fired: fired,
      solutionBiased: bias.biased,
      advisory: advisory,
      note: "Readiness is an estimate from keyword coverage, not a verdict — treat it as a prompt to reflect, and you can always proceed."
    };
  }

  /* ============================================================
     5) validateRequirements(text)
     -> { detectedType, strengths[], risksGaps[], improvements[],
          clarifyingQuestions[], scores:{...6...} }
     ============================================================ */
  function validateRequirements(text) {
    var low = lc(text), L = len(text);
    var strengths = [], risksGaps = [], improvements = [], clarifying = [];

    var hasAsA = /\bas an?\b/i.test(text);
    var hasIWant = /\bi want\b/i.test(text);
    var hasSoThat = /\bso that\b/i.test(text);
    var hasGwt = /\bgiven\b[\s\S]*\bwhen\b[\s\S]*\bthen\b/i.test(text);
    var hasAc = /\bacceptance criteria\b/i.test(text);
    var hasEpic = /\bepic\b/i.test(text);
    var multiPersona = (/\bas an? (user|admin|customer|agent|manager|colleague)\b/gi.test(text)) && ((text.match(/\bas an? /gi) || []).length > 1);
    var subjective = /\b(fast|quick|easy|simple|nice|good|properly|works?|robust|seamless|intuitive|user-?friendly)\b/i.test(text);
    var measurable = /\b(\d+\s?(s|sec|seconds|ms|%|percent)|within \d|less than \d|under \d|p9\d|99|95)\b/i.test(text);
    var customerOutcome = hasSoThat && /\bso that\b[\s\S]{0,80}\b(customer|user|they|i|me|applicant|so they can)\b/i.test(text);
    var systemOutcome = /\bso that the system\b|\bso that the record\b/i.test(text);
    var errorHandling = /\b(error|validation|invalid|failure|fallback|retry|edge case)\b/i.test(text);
    var nonFunctional = /\b(accessib|performance|security|load|mobile|responsive|wcag|gdpr|privacy)\b/i.test(text);
    var dependencies = /\b(depend|dependency|hand-?off|upstream|downstream|integrat|api|system of record)\b/i.test(text);
    var dod = /\b(definition of done|dod|done when)\b/i.test(text);

    /* detectedType */
    var detectedType = "free text";
    if (hasGwt) detectedType = "Given/When/Then acceptance criteria";
    else if (hasAsA && hasIWant) detectedType = "user story";
    else if (hasEpic) detectedType = "epic";
    else if (hasAc) detectedType = "acceptance criteria";
    else if (/\brequirements?\b/i.test(text)) detectedType = "requirement set";
    else if (/\bchange request\b/i.test(text)) detectedType = "change request";

    /* strengths (only when markers fire) */
    if (hasAsA && hasIWant) strengths.push("Uses recognisable user-story form (As a / I want), which gives a clear starting structure.");
    if (hasSoThat) strengths.push("Includes a 'so that' clause, so there is an attempt to express intent.");
    if (hasGwt) strengths.push("Frames behaviour as Given/When/Then, which lends itself to testable criteria.");
    if (measurable) strengths.push("Contains at least one measurable threshold, which makes 'done' checkable.");
    if (nonFunctional) strengths.push("Names a non-functional concern (e.g. accessibility, performance or mobile), which is often missed.");
    if (dependencies) strengths.push("References dependencies or hand-offs, showing some end-to-end awareness.");
    if (!strengths.length) strengths.push("There is raw intent here to work with — that is a fair starting point to sharpen.");

    /* risks / gaps */
    if (multiPersona) risksGaps.push("More than one persona appears in a single story (e.g. user and admin) — consider splitting into separate, focused stories.");
    if (systemOutcome) risksGaps.push("The 'so that' describes the system updating, not a customer benefit — traceability to a customer outcome is weak.");
    if (!hasSoThat) risksGaps.push("No 'so that' / outcome clause — it is unclear what improves for the customer if this is built.");
    if (subjective && !measurable) risksGaps.push("Subjective words like 'fast', 'works' or 'properly' appear with no measurable threshold, so acceptance is untestable.");
    if (!errorHandling) risksGaps.push("No error-handling, validation or failure behaviour is specified.");
    if (nonFunctional && !measurable) risksGaps.push("A non-functional need is asserted (e.g. mobile) but has no acceptance criteria to verify it.");
    if (!dependencies) risksGaps.push("Dependencies and hand-offs to upstream/downstream systems are not stated.");
    if (!dod) risksGaps.push("No clear definition of done.");
    if (!/\bproblem\b|\bbecause\b|\bchange request\b/i.test(text)) risksGaps.push("Weak traceability back to the underlying problem or change request.");

    /* improvements */
    if (multiPersona) improvements.push("Split mixed personas into separate stories so each has one clear actor and outcome.");
    if (systemOutcome || !customerOutcome) improvements.push("Rewrite each 'so that' as a customer benefit (what the customer can now do or notice), not a system state.");
    if (subjective && !measurable) improvements.push("Replace subjective words with measurable criteria, e.g. 'saved within 2 seconds', '99% success rate'.");
    if (!errorHandling) improvements.push("Add acceptance criteria for validation, errors and failure paths.");
    if (nonFunctional && !measurable) improvements.push("Specify testable thresholds for the non-functional needs (device, accessibility, performance).");
    if (!dependencies) improvements.push("List dependencies and hand-offs (e.g. identity, system of record) so nothing is silently assumed.");
    if (!dod) improvements.push("Add a definition of done so everyone shares the same bar.");
    if (!improvements.length) improvements.push("Tighten each requirement so a delivery team could build it without guessing.");

    /* clarifying questions */
    clarifying.push("Which specific customer outcome should each requirement improve, and how would the customer notice?");
    clarifying.push("What does 'done' look like, measurably, for the riskiest requirement here?");
    if (!dependencies) clarifying.push("What upstream or downstream systems and hand-offs does this touch?");
    if (!errorHandling) clarifying.push("What should happen when something goes wrong or the input is invalid?");
    if (multiPersona) clarifying.push("Who is the single primary actor for each story?");

    /* scores 0..100 */
    var clarity = 60;
    if (hasAsA && hasIWant) clarity += 12;
    if (hasGwt) clarity += 10;
    if (subjective) clarity -= 18;
    if (multiPersona) clarity -= 12;
    clarity = clamp(clarity, 0, 100);

    var completeness = 50;
    if (errorHandling) completeness += 12;
    if (nonFunctional) completeness += 10;
    if (dependencies) completeness += 12;
    if (dod) completeness += 10;
    if (!hasSoThat) completeness -= 10;
    completeness = clamp(completeness, 0, 100);

    /* ambiguity is scored as CLARITY-of-meaning (higher = less ambiguous) */
    var ambiguity = 70;
    if (subjective && !measurable) ambiguity -= 30;
    if (multiPersona) ambiguity -= 10;
    if (measurable) ambiguity += 10;
    ambiguity = clamp(ambiguity, 0, 100);

    var traceabilityProblem = 45;
    if (/\bproblem\b|\bbecause\b|\bchange request\b/i.test(text)) traceabilityProblem += 25;
    if (hasSoThat) traceabilityProblem += 10;
    traceabilityProblem = clamp(traceabilityProblem, 0, 100);

    var traceabilityCustomer = 40;
    if (customerOutcome) traceabilityCustomer += 30;
    if (systemOutcome) traceabilityCustomer -= 15;
    if (/\bcustomer\b/i.test(text)) traceabilityCustomer += 10;
    traceabilityCustomer = clamp(traceabilityCustomer, 0, 100);

    var acceptanceCriteria = 45;
    if (hasGwt) acceptanceCriteria += 20;
    if (measurable) acceptanceCriteria += 20;
    if (subjective && !measurable) acceptanceCriteria -= 20;
    if (hasAc) acceptanceCriteria += 8;
    acceptanceCriteria = clamp(acceptanceCriteria, 0, 100);

    /* very short input dampens confidence — pull scores toward a neutral midpoint */
    if (L < 40) {
      clarity = Math.round(clarity * 0.7);
      completeness = Math.round(completeness * 0.7);
      acceptanceCriteria = Math.round(acceptanceCriteria * 0.7);
    }

    return {
      detectedType: detectedType,
      strengths: strengths,
      risksGaps: risksGaps,
      improvements: improvements,
      clarifyingQuestions: clarifying,
      scores: {
        clarity: clarity,
        completeness: completeness,
        ambiguity: ambiguity,
        traceabilityProblem: traceabilityProblem,
        traceabilityCustomer: traceabilityCustomer,
        acceptanceCriteria: acceptanceCriteria
      },
      note: L < 40 ? "This is a short sample, so the read is tentative — paste the full stories and criteria for a firmer assessment." : "Findings are heuristic prompts to review, not a definitive audit."
    };
  }

  /* ============================================================
     6) assessRoleIntegrity(session)
     -> { mode, scores:{5}, insights[], opportunities[] }
     ============================================================ */
  var RI_TEMPLATES = {
    documentation: "You are currently operating strongly in documentation mode — that precision is valuable. The opportunity is to connect each requirement back to the customer outcome it serves.",
    outcomeFocus: "Customer outcome framing needs more definition — what noticeably improves for the customer if this succeeds, and how would you measure it?",
    customerFraming: "There is room to strengthen the customer lens — whose experience is this, and what friction are they feeling today?",
    strategic: "There is an opportunity to strengthen strategic journey ownership — how does this connect to the wider direction and the next 2-3 years?",
    endToEnd: "This looks focused on one step — consider what happens upstream and downstream, and who else is affected across the journey."
  };

  function assessRoleIntegrity(session) {
    var text = readText(session), low = lc(text), L = len(text);

    /* documentation: HIGH = drift */
    var docSignals = countMatches(text, ["story", "stories", "ticket", "acceptance criteria", "field", "spec", "requirement", "backlog", "jira", "document", "capture", "log", "record", "list"]);
    var documentation = clamp(30 + docSignals * 8, 0, 100);

    /* outcomeFocus */
    var outcomeSignals = countMatches(text, ["outcome", "result", "impact", "measure", "so that", "success metric", "kpi", "benefit", "target"]);
    var outcomeFocus = clamp(40 + outcomeSignals * 15, 0, 100);
    if (outcomeSignals === 0) outcomeFocus = clamp(outcomeFocus - 10, 0, 100);

    /* customerFraming */
    var custEvidence = countMatches(text, ["customer", "persona", "pain", "friction", "feedback", "complaint", "journey moment", "applicant"]);
    var genericUser = /\buser\b/i.test(text) ? 1 : 0;
    var customerFraming = clamp(40 + custEvidence * 15 + genericUser * 5, 0, 100);
    if (custEvidence === 0 && !genericUser) customerFraming = clamp(customerFraming - 10, 0, 100);

    /* strategic */
    var stratSignals = countMatches(text, ["strategy", "vision", "future-state", "future state", "best-in-class", "best in class", "trade-off", "tradeoff", "prioritis", "why now", "opportunity"]);
    var futureLens = /\b(future|2-3 years|emerging|forward)\b/i.test(text) ? 1 : 0;
    var deliveryOnly = /\b(ship|deliver|build|deploy)\b/i.test(text) && stratSignals === 0 ? 1 : 0;
    var strategic = clamp(35 + stratSignals * 15 + futureLens * 10 - deliveryOnly * 5, 0, 100);

    /* endToEnd */
    var e2eSignals = countMatches(text, ["upstream", "downstream", "hand-off", "handoff", "affected", "whole journey", "dependency", "dependencies", "ripple", "end-to-end", "end to end"]);
    var localOnly = e2eSignals === 0 && /\b(step|screen|form|field|button|page)\b/i.test(text) ? 1 : 0;
    var endToEnd = clamp(35 + e2eSignals * 15 - localOnly * 10, 0, 100);

    var scores = { outcomeFocus: outcomeFocus, customerFraming: customerFraming, strategic: strategic, endToEnd: endToEnd, documentation: documentation };

    /* mode classification from journey-owner dimensions */
    var owner = (outcomeFocus + customerFraming + strategic + endToEnd) / 4;
    var docDominant = documentation >= 70 && documentation > owner + 10;
    var mode;
    if (docDominant && owner < 45) mode = "documentation";
    else if (owner >= 65 && !docDominant) mode = "journey-owner";
    else mode = "balanced";

    /* insights — strength first, then opportunity, only fired templates */
    var insights = [];
    var ownerDims = [
      { key: "outcomeFocus", score: outcomeFocus },
      { key: "customerFraming", score: customerFraming },
      { key: "strategic", score: strategic },
      { key: "endToEnd", score: endToEnd }
    ];
    var highest = ownerDims.slice().sort(function (a, b) { return b.score - a.score; })[0];
    var strengthLines = {
      outcomeFocus: "Your outcome focus is a genuine strength — you keep one eye on the result that matters.",
      customerFraming: "Strong customer framing here — the customer's experience is central, not an afterthought.",
      strategic: "Good strategic lift — you connect this to the wider direction, not just the task.",
      endToEnd: "Clear end-to-end awareness — you are thinking across the journey, not one local step."
    };
    if (mode === "documentation") {
      insights.push({ kind: "strength", text: "Your documentation discipline is a real asset — detail and rigour are clearly there." });
      insights.push({ kind: "opportunity", text: RI_TEMPLATES.documentation });
    } else if (highest.score >= 55) {
      insights.push({ kind: "strength", text: strengthLines[highest.key] });
    } else {
      insights.push({ kind: "strength", text: "There is honest, useful thinking here to build on — a fair foundation to strengthen." });
    }

    /* opportunities = supportive templates for the two lowest journey-owner dims
       (RI_TEMPLATES are already complete, supportive sentences) */
    var lowest = ownerDims.slice().sort(function (a, b) { return a.score - b.score; }).slice(0, 2);
    var opportunities = lowest.map(function (d) {
      return RI_TEMPLATES[d.key];
    });
    /* keep insights to 2-3: add the top opportunity as a second insight */
    if (insights.length < 3 && lowest[0]) insights.push({ kind: "opportunity", text: RI_TEMPLATES[lowest[0].key] });

    if (L < 60) {
      insights.push({ kind: "note", text: "This is an early read based on limited input — treat it as a prompt to reflect, not a judgement." });
    }

    return {
      mode: mode,
      scores: scores,
      ownerAverage: Math.round(owner),
      insights: insights.slice(0, 3),
      opportunities: opportunities,
      note: "Role-integrity is a supportive estimate from your wording, never a verdict on your work."
    };
  }

  /* ============================================================
     7) scoreReflection(answers)
     -> { summary, observations[], growthActions[], nextWeekFocus[], strengthsSpotted[] }
     ============================================================ */
  var REFLECTION_TAGS = {
    evidence: ["data", "metric", "measure", "number", "%", "evidence", "insight", "baseline", "nps", "csat"],
    customer: ["customer", "user", "persona", "pain", "friction", "outcome", "experience"],
    endToEnd: ["upstream", "downstream", "hand-off", "handoff", "journey", "end-to-end", "end to end", "dependency", "whole"],
    strategic: ["strategy", "future", "best-in-class", "best in class", "vision", "priorit", "2-3 years"],
    governance: ["governance", "risk", "policy", "compliance", "control", "stakeholder"]
  };
  function answerLevel(v) {
    var l = len(v);
    if (l < 10) return "empty";
    if (l <= 60) return "thin";
    if (l <= 200) return "developed";
    return "rich";
  }
  function tagsIn(v) {
    var out = {}, k;
    for (k in REFLECTION_TAGS) { out[k] = countMatches(v, REFLECTION_TAGS[k]) > 0; }
    return out;
  }

  function scoreReflection(answers) {
    answers = answers || {};
    var fields = (DATA.reflectionFields || []).map(function (f) { return f.key; });
    if (!fields.length) fields = Object.keys(answers);

    var developed = 0, total = fields.length || 1, levels = {}, i;
    for (i = 0; i < fields.length; i++) {
      var lvl = answerLevel(answers[fields[i]]);
      levels[fields[i]] = lvl;
      if (lvl === "developed" || lvl === "rich") developed++;
    }
    var coverageRatio = developed / total;

    /* empty handling */
    var nonEmpty = fields.filter(function (f) { return answerLevel(answers[f]) !== "empty"; });
    if (nonEmpty.length <= Math.max(1, Math.floor(total * 0.2))) {
      return {
        summary: "There is not much captured yet this week — even a few lines on outcomes, blockers and evidence will let me give richer coaching.",
        observations: [],
        growthActions: ["Jot down one intended outcome and whether it landed.", "Note one blocker and one lesson, even briefly."],
        nextWeekFocus: ["Capture a fuller reflection so the coaching can be specific to your week."],
        strengthsSpotted: [],
        coverageRatio: coverageRatio,
        note: "Feedback is generated only from what you write — add detail and it sharpens."
      };
    }

    /* themes present across whole reflection */
    var blob = fields.map(function (f) { return answers[f] || ""; }).join("  ");
    var themeTags = tagsIn(blob);
    var themesPresent = Object.keys(themeTags).filter(function (k) { return themeTags[k]; });
    var themeNames = { evidence: "data and evidence", customer: "customer framing", endToEnd: "end-to-end thinking", strategic: "strategic thinking", governance: "governance and risk awareness" };

    var coverageWord = coverageRatio >= 0.6 ? "rich" : (coverageRatio >= 0.35 ? "solid" : "light");
    var thinFields = fields.filter(function (f) { return levels[f] === "empty" || levels[f] === "thin"; })
      .map(function (f) { var fd = (DATA.reflectionFields || []).filter(function (x) { return x.key === f; })[0]; return fd ? fd.label.toLowerCase() : f; });

    var summary = "A " + coverageWord + "-coverage reflection. "
      + (themesPresent.length ? "You evidenced " + themesPresent.map(function (k) { return themeNames[k]; }).join(", ") + ". " : "")
      + (thinFields.length ? thinFields.slice(0, 3).join(", ") + " had less detail this week." : "Most areas were given good attention this week.");

    /* observations — grounded in the field they came from, cap 4 */
    var observations = [];
    if (tagsIn(answers.dataEvidenceUse || "").evidence) observations.push("Strong, evidence-led thinking shows in your note on use of data — you reference concrete signals.");
    if (tagsIn(answers.customerOutcomeProgress || "").customer) observations.push("Your progress note keeps the customer outcome in view, which is exactly the journey-owner instinct.");
    else if (levels.customerOutcomeProgress === "empty" || levels.customerOutcomeProgress === "thin") observations.push("Customer-outcome progress was light this week — worth making the customer benefit explicit.");
    if (tagsIn(answers.endToEndThinking || "").endToEnd) observations.push("You showed clear end-to-end awareness, naming wider journey effects rather than one step.");
    if (answerLevel(answers.blockers) === "developed" || answerLevel(answers.blockers) === "rich") observations.push("Honest, specific articulation of blockers — naming them clearly is the first step to clearing them.");
    observations = observations.slice(0, 4);

    /* growth actions — from lowest-coverage / lowest-keyword dimensions, max 3 */
    var growthActions = [];
    if (!themeTags.evidence) growthActions.push("Bring one baseline metric to next week's key decision so evidence leads, not assumption.");
    if (!themeTags.endToEnd) growthActions.push("Map upstream and downstream impact for your main initiative before committing.");
    if (!themeTags.customer) growthActions.push("Name the specific customer and the outcome that improves for your top piece of work.");
    if (!themeTags.strategic) growthActions.push("Connect one task this week to the wider direction or a 2-3 year view.");
    growthActions = growthActions.slice(0, 3);
    if (!growthActions.length) growthActions.push("Pick one strength from this week and deliberately stretch it further next week.");

    /* next-week focus — from areasForImprovement + top growth gap */
    var nextWeekFocus = [];
    if (len(answers.areasForImprovement) >= 10) {
      nextWeekFocus.push("Act on what you named to improve: " + String(answers.areasForImprovement).trim().split(/[.\n]/)[0].slice(0, 120) + ".");
    } else {
      nextWeekFocus.push("Set a clear area to improve next week — none was captured, so derive it from the thinnest areas above.");
    }
    if (growthActions[0]) nextWeekFocus.push(growthActions[0]);
    if (thinFields[0] && nextWeekFocus.length < 3) nextWeekFocus.push("Give more attention to " + thinFields[0] + " next week.");
    nextWeekFocus = nextWeekFocus.slice(0, 3);

    /* strengths spotted — rich AND tagged, or quote strengths field */
    var strengthsSpotted = [];
    if (len(answers.strengths) >= 10) strengthsSpotted.push("In your own words: " + String(answers.strengths).trim().slice(0, 140) + (len(answers.strengths) > 140 ? "…" : ""));
    if ((answerLevel(answers.dataEvidenceUse) === "rich" || answerLevel(answers.dataEvidenceUse) === "developed") && tagsIn(answers.dataEvidenceUse || "").evidence) strengthsSpotted.push("Strong evidence-led thinking — you cited concrete data.");
    if ((answerLevel(answers.endToEndThinking) === "rich" || answerLevel(answers.endToEndThinking) === "developed") && tagsIn(answers.endToEndThinking || "").endToEnd) strengthsSpotted.push("Clear end-to-end awareness across the journey.");
    if ((answerLevel(answers.customerOutcomeProgress) === "rich" || answerLevel(answers.customerOutcomeProgress) === "developed") && tagsIn(answers.customerOutcomeProgress || "").customer) strengthsSpotted.push("Customer-outcome focus came through clearly.");
    strengthsSpotted = uniq(strengthsSpotted).slice(0, 3);

    return {
      summary: summary,
      observations: observations,
      growthActions: growthActions,
      nextWeekFocus: nextWeekFocus,
      strengthsSpotted: strengthsSpotted,
      coverageRatio: coverageRatio,
      note: "All feedback is drawn from your own words via supportive heuristics; it never asserts achievements you did not write."
    };
  }

  /* ============================================================
     8) dataConfidence(input)  (text OR session)
     -> { level, note, assumptionsToFlag[] }
     ============================================================ */
  function dataConfidence(input) {
    var text = (input && typeof input === "object") ? readText(input) : (input || "");
    var low = lc(text);
    var evidenceHits = countMatches(text, ["data", "metric", "metrics", "baseline", "evidence", "research", "complaint", "complaints", "feedback", "nps", "csat", "%", "percent", "survey", "analytics", "session", "conversion"]);
    var measured = /\b\d+(\.\d+)?\s?(%|percent|points|customers|users|seconds|days)\b/i.test(text) ? 1 : 0;
    var assumptionHits = countMatches(text, ["assume", "assumption", "we think", "we believe", "probably", "likely", "guess", "no data", "anecdotal", "i reckon"]);

    var level, note;
    var sustaining = evidenceHits + measured * 2;
    if (sustaining >= 4 && assumptionHits <= sustaining) {
      level = "high";
      note = "There is reasonable evidence cited here. Keep checking it is recent, complete and representative.";
    } else if (sustaining >= 2) {
      level = "medium";
      note = "Some evidence is present, but it is partial. Worth strengthening the data before high-stakes decisions.";
    } else {
      level = "low";
      note = "Evidence here is light — the thinking may be sound, but treat the claims as working assumptions until you can back them with data.";
    }

    var assumptionsToFlag = [];
    if (assumptionHits > 0) assumptionsToFlag.push("Explicit assumption language is present — make sure each assumption is written down and revisited with evidence.");
    if (sustaining < 2) assumptionsToFlag.push("Key claims are not yet evidenced — flag them as assumptions rather than facts.");
    if (!measured) assumptionsToFlag.push("No baseline figure is stated — capture today's number so improvement can be measured.");

    return { level: level, note: note, assumptionsToFlag: assumptionsToFlag };
  }

  /* ============================================================
     9) futureExternalPrompts(text) -> prompts[]
     ============================================================ */
  function futureExternalPrompts(text) {
    var low = lc(text);
    var base = (DATA.futurePrompts || []).slice();
    var bank = (DATA.coachingQuestionBank || {});
    var extra = [];
    if (/\bemerging|\btech|\bai\b|\bautomation\b/i.test(text)) extra = extra.concat((bank["best-in-class"] || []).slice(0, 1));
    if (/\bcompetitor|\bindustry|\bbenchmark\b/i.test(text)) extra = extra.concat((bank["best-in-class"] || []).slice(1, 2));
    var prompts = uniq(base.concat(extra, (bank.future || []).slice(0, 2)));
    return prompts.slice(0, 7);
  }

  /* ============================================================
     10) processSupportPrompts(text)
     -> { riskConsiderations[], governancePathways[], policyOwnership[],
          stakeholdersControls[], disclaimer }
     ============================================================ */
  function processSupportPrompts(text) {
    var ps = DATA.processSupport || {};
    return {
      riskConsiderations: (ps.riskConsiderations || []).slice(),
      riskOpportunityThinking: (ps.riskOpportunityThinking || []).slice(),
      governancePathways: (ps.governancePathways || []).slice(),
      policyOwnership: (ps.policyOwnership || []).slice(),
      stakeholdersControls: (ps.stakeholdersControls || []).slice(),
      disclaimer: ps.disclaimer || "This is light-touch coaching support only and is not a formal governance, risk or compliance decision or sign-off."
    };
  }

  /* ============================================================
     11) journeyChecklistFor(session) -> items[]
     ============================================================ */
  function journeyChecklistFor(session) {
    var prompts = (DATA.journeyChecklist || []);
    var keys = ["upstream", "downstream", "affected", "handoffs", "friction", "wholeVsLocal"];
    var notes = (session && session.journeyNotes && typeof session.journeyNotes === "object") ? session.journeyNotes : {};
    return prompts.map(function (p, i) {
      var key = keys[i] || ("item" + i);
      return {
        key: key,
        prompt: p,
        note: notes[key] || "",
        answered: !!(notes[key] && len(notes[key]) > 0)
      };
    });
  }

  /* ---------- export ---------- */
  window.CJM_ENGINE = {
    recommendMode: recommendMode,
    detectSolutionBias: detectSolutionBias,
    getStageCoaching: getStageCoaching,
    assessProblemReadiness: assessProblemReadiness,
    validateRequirements: validateRequirements,
    assessRoleIntegrity: assessRoleIntegrity,
    scoreReflection: scoreReflection,
    dataConfidence: dataConfidence,
    futureExternalPrompts: futureExternalPrompts,
    processSupportPrompts: processSupportPrompts,
    journeyChecklistFor: journeyChecklistFor,
    /* exposed for views that want the raw label */
    modeLabel: modeLabel
  };
})();
