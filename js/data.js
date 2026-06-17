/* ============================================================
   CJM COACH PORTAL — DATA CONTRACT
   window.CJM_DATA : all static coaching content, personas, problems.
   Classic script (no modules). British English throughout.
   ============================================================ */
(function () {
  "use strict";

  window.CJM_DATA = {
    brand: {
      name: "CJM Coach Portal",
      tagline: "Your thinking partner for better journeys"
    },

    /* ---- Support modes ---- */
    modes: [
      { id: "five-stage-coaching", label: "Five-Stage Coaching", blurb: "Walk through the structured thinking framework, pausing before you solution. Best when the request is fresh or the problem feels fuzzy.", icon: "compass" },
      { id: "requirement-validator", label: "Requirement Validator", blurb: "Pressure-test epics, user stories, requirements and acceptance criteria for clarity, completeness and traceability before they ship.", icon: "clipboard-check" },
      { id: "weekly-reflection", label: "Weekly Reflection", blurb: "Step back and reflect on the week's progress, outcomes, blockers and lessons, and set a clear focus for the week ahead.", icon: "journal" },
      { id: "customer-first-framing", label: "Customer-First Framing", blurb: "Re-centre the work on the customer: who they are, the friction they feel, and the outcome that will genuinely improve for them.", icon: "heart" },
      { id: "end-to-end-journey", label: "End-to-End Journey", blurb: "Zoom out from the local step to the whole journey: upstream triggers, downstream effects, hand-offs and friction created elsewhere.", icon: "route" },
      { id: "future-external-thinking", label: "Future & External Thinking", blurb: "Stretch beyond today and beyond the building: best-in-class practice, shifting expectations and where customers will be in 2-3 years.", icon: "telescope" },
      { id: "process-governance-support", label: "Process & Governance Support", blurb: "Light-touch navigation of risk, governance pathways, policy ownership and likely controls. Helps you prepare, never signs anything off.", icon: "shield" }
    ],

    /* ---- 5-Stage thinking framework ---- */
    stages: [
      {
        id: 1, key: "pause-context",
        title: "Pause & Context Setting",
        subtitle: "Slow down before you speed up. Build a shared picture of what is actually happening.",
        prompts: [
          "What is happening right now?",
          "Why does this matter, and why now?",
          "Who is affected by this?",
          "What triggered this request or situation?",
          "What do we genuinely know versus what are we assuming?",
          "Is the ask already framed as a solution rather than a problem?"
        ],
        coachingQuestions: [
          "In your own words, what is actually happening here before we attach any solution to it?",
          "Why does this matter now rather than last quarter or next?",
          "Who is feeling the impact of this, and who has simply asked for it?",
          "What triggered this landing on your desk this week?",
          "Which parts of this do you know for certain, and which parts are still assumption?",
          "Does the request already name a solution? If so, what problem might that solution be quietly assuming?"
        ],
        outputs: [
          "A plain-language context statement",
          "A clear list of who is affected",
          "A known-versus-unknown split",
          "An early flag if the ask is solution-biased"
        ]
      },
      {
        id: 2, key: "problem-definition",
        title: "Problem Definition",
        subtitle: "Define the real problem clearly, so you do not invest in solving the wrong one.",
        prompts: [
          "What is the actual problem we are trying to solve?",
          "What are the likely root causes?",
          "What is the impact on the customer?",
          "What is the business or operational impact?",
          "What outcomes do we want to achieve?",
          "What key assumptions are we making?",
          "What constraints are we working within?",
          "What is the risk of solving the wrong problem?"
        ],
        coachingQuestions: [
          "If you had to state the real problem in one sentence, with no solution attached, what would it be?",
          "What sits beneath the symptom? What might the root cause actually be?",
          "How does this problem show up in the customer's experience?",
          "What does this cost the business or operation if nothing changes?",
          "What outcome would tell you this problem is genuinely resolved?",
          "Which assumptions are you leaning on most heavily right now?",
          "What is the cost or risk if it turns out we have framed the wrong problem?"
        ],
        outputs: [
          "A sharp, solution-free problem statement",
          "Candidate root causes",
          "Customer and business impact summary",
          "Desired outcomes, constraints and named assumptions",
          "A note on the risk of solving the wrong problem"
        ]
      },
      {
        id: 3, key: "research-insight",
        title: "Research & Insight Gathering",
        subtitle: "Let evidence lead. Gather the customer, data and journey signals before exploring options.",
        prompts: [
          "What customer evidence do we have?",
          "What complaints or feedback are we seeing?",
          "What does the data and insight tell us?",
          "Where are the journey pain points?",
          "What evidence is missing?",
          "What internal and external signals are relevant?",
          "How does this compare with best-in-class (benchmark thinking)?"
        ],
        coachingQuestions: [
          "What direct customer evidence supports your view of the problem?",
          "What are complaints, feedback or contact data telling you about where it hurts?",
          "What does the data say, and how confident are you in its quality?",
          "Where along the journey are the real pain points concentrated?",
          "What evidence is missing that would change your confidence if you had it?",
          "What external or industry signals are relevant here, not just internal ones?",
          "How would a best-in-class organisation be looking at this?"
        ],
        outputs: [
          "A summary of customer and data evidence",
          "Mapped journey pain points",
          "Explicit gaps in the evidence base",
          "Internal and external signals, with benchmark notes",
          "An honest confidence level on the evidence"
        ]
      },
      {
        id: 4, key: "solution-exploration",
        title: "Solution Exploration",
        subtitle: "Only once the problem is well defined: explore options openly, with trade-offs and consequences in view.",
        prompts: [
          "What options could address the defined problem?",
          "What are the trade-offs of each option?",
          "What does a strong future-state look like?",
          "Could emerging technology change the answer?",
          "What unintended consequences might arise?",
          "What are the end-to-end implications across the journey?"
        ],
        coachingQuestions: [
          "Now the problem is clear, what is the full range of options, not just the first one?",
          "What does each option give up as well as gain? What are the honest trade-offs?",
          "What would a genuinely strong future-state look like, not just a patch?",
          "Could emerging technology or a different model change the shape of the answer?",
          "What unintended consequences could each option create for customers or colleagues?",
          "What are the end-to-end implications of each option across the wider journey?"
        ],
        outputs: [
          "A set of options with trade-offs",
          "A described future-state direction",
          "Notes on emerging technology relevance",
          "Identified unintended consequences",
          "End-to-end implications for each option"
        ]
      },
      {
        id: 5, key: "validation-alignment",
        title: "Validation & Outcome Alignment",
        subtitle: "Check the solution truly answers the defined problem and lands a measurable customer outcome.",
        prompts: [
          "Does the solution address the problem we defined?",
          "Are the customer outcomes clear?",
          "Are the success measures clear?",
          "Are the requirements complete?",
          "What dependencies and risks remain?",
          "What governance, policy or risk inputs are needed?",
          "Is this genuinely end-to-end?"
        ],
        coachingQuestions: [
          "Does this solution clearly answer the problem you defined, or has the problem quietly shifted?",
          "What is the specific customer outcome, and how will the customer notice it improving?",
          "What measures will tell you, objectively, whether this has worked?",
          "Are the requirements complete and traceable back to both the problem and the outcome?",
          "What dependencies or risks are still open, and who needs to know?",
          "What governance, policy or risk inputs should be lined up before this proceeds?",
          "Is this solving the whole journey, or have we landed back on one local step?"
        ],
        outputs: [
          "Confirmation the solution maps to the defined problem",
          "Clear customer outcomes and success measures",
          "A completeness check on requirements",
          "Remaining dependencies and risks",
          "Governance, policy and risk inputs to prepare",
          "An end-to-end confirmation"
        ]
      }
    ],

    /* ---- Customer-first decision framework fields ---- */
    customerFirstFields: [
      { key: "targetCustomer", label: "Target customer", placeholder: "Who specifically is this for? e.g. first-time applicants completing the online claim form." },
      { key: "customerPain", label: "Customer pain or friction", placeholder: "What is hard, slow, confusing or frustrating for them today?" },
      { key: "targetOutcome", label: "Target customer outcome", placeholder: "What will be better for the customer if this succeeds? Describe the outcome, not the feature." },
      { key: "whyItMatters", label: "Why this matters to the customer", placeholder: "Why does this genuinely matter to them, in their terms, not ours?" },
      { key: "expectedImprovement", label: "Expected noticeable improvement", placeholder: "What change would the customer actually notice? e.g. completing in one sitting instead of three attempts." },
      { key: "confidence", label: "Confidence level", placeholder: "How confident are you, and on what evidence? Low / Medium / High and why." }
    ],

    /* ---- End-to-end journey validation checklist ---- */
    journeyChecklist: [
      "What happens upstream, before the customer reaches this step?",
      "What happens downstream, after this step is complete?",
      "Who else is affected by this change, inside or outside the team?",
      "What hand-offs and dependencies exist around this point in the journey?",
      "Could this change create friction somewhere else in the journey?",
      "Are we improving the full journey, or optimising one local step only?"
    ],

    /* ---- Data-driven decision support prompts ---- */
    dataPrompts: [
      "What evidence supports this decision, and where did it come from?",
      "How good is the quality of that data? Is it complete, recent and reliable?",
      "What baseline metrics describe the situation today, before any change?",
      "What customer insight (feedback, complaints, research) backs this up?",
      "How frequent and how severe is the issue for customers?",
      "What is your confidence level in this evidence: low, medium or high?",
      "Where data is missing, what assumptions are you making, and have you flagged them clearly?"
    ],

    /* ---- Future & external thinking prompts ---- */
    futurePrompts: [
      "What would best-in-class organisations, in or beyond your industry, do here?",
      "How might customer expectations shift over the next 2-3 years?",
      "Which emerging technologies could change what good looks like for this journey?",
      "If you designed for three years ahead rather than today, what would you do differently?",
      "What wider opportunity sits just beyond the immediate request that is worth naming?"
    ],

    /* ---- Internal process / governance support ---- */
    processSupport: {
      riskConsiderations: [
        "What could go wrong for the customer if this proceeds as planned?",
        "What operational, data or delivery risks are worth surfacing early?",
        "Which risks are new, and which already exist in the current journey?",
        "What is the risk of doing nothing, not just the risk of acting?"
      ],
      riskOpportunityThinking: [
        "Where could managing this risk well actually create an opportunity or advantage?",
        "Could a control or safeguard here also improve the customer experience?",
        "What would a confident, proportionate response to this risk look like?",
        "Is there an upside to leaning into this uncertainty rather than only defending against it?"
      ],
      governancePathways: [
        "Which governance forum or route is this likely to need, and when?",
        "What would those decision-makers want to see before they engage?",
        "Is this best raised early for steer, or later for decision?",
        "What evidence and framing would make that conversation smoother?"
      ],
      policyOwnership: [
        "Which policies might this touch, and who owns them?",
        "Who should be consulted before assumptions about policy are baked in?",
        "Is there a policy constraint that should shape the options now rather than later?",
        "Where is policy unclear, and who can give an authoritative read?"
      ],
      stakeholdersControls: [
        "Who are the likely stakeholders to involve, and at what point?",
        "What existing controls already apply to this part of the journey?",
        "Who owns the controls that this change might affect?",
        "Which colleagues can pressure-test this before it goes further?"
      ],
      disclaimer: "This is light-touch coaching support to help you prepare and think things through. It does not provide formal compliance, risk or governance decisions, and it is not a sign-off. Always confirm with the relevant risk, policy and governance owners before proceeding."
    },

    /* ---- Role integrity dimensions ---- */
    roleIntegrityDimensions: [
      { key: "outcomeFocus", label: "Outcome focus", description: "You keep the work anchored to a clear, measurable outcome rather than activity. When this is strong, every decision traces back to a result that matters; when it dips, there is a gentle opportunity to ask 'what outcome are we actually moving?'" },
      { key: "customerFraming", label: "Customer framing", description: "You frame the work through the customer's experience and needs, not only internal requirements. Strong customer framing means the customer's pain and target outcome are explicit and central, in their language." },
      { key: "strategic", label: "Strategic thinking", description: "You connect this piece of work to the bigger picture, future direction and external context. This is the lens that lifts you from task-completion to journey ownership and forward intent." },
      { key: "endToEnd", label: "End-to-end ownership", description: "You take ownership of the whole journey, including upstream triggers, downstream effects and hand-offs, rather than a single local step. This is the heart of the journey-owner role." },
      { key: "documentation", label: "Documentation", description: "You capture requirements, stories and detail clearly and rigorously. This is a genuine strength to value, the coaching note is simply to make sure it complements, rather than replaces, outcome and journey ownership." }
    ],

    /* ---- Weekly reflection fields ---- */
    reflectionFields: [
      { key: "intendedOutcomes", label: "Intended outcomes this week", placeholder: "What were you aiming to achieve this week?" },
      { key: "achieved", label: "What was achieved", placeholder: "What actually got done, and what landed well?" },
      { key: "customerOutcomeProgress", label: "Progress against customer outcomes", placeholder: "How did this week move a real customer outcome forward?" },
      { key: "strengths", label: "Strengths shown", placeholder: "What did you do well? Where did you operate at your best?" },
      { key: "blockers", label: "Blockers", placeholder: "What got in the way, slowed you down, or stayed stuck?" },
      { key: "lessons", label: "Lessons learned", placeholder: "What did you learn that will change how you work next time?" },
      { key: "dataEvidenceUse", label: "Use of data and evidence", placeholder: "Where did evidence lead your decisions? Where did you rely on assumption?" },
      { key: "endToEndThinking", label: "End-to-end thinking", placeholder: "Where did you consider the whole journey, and where did focus narrow to one step?" },
      { key: "governanceRiskProcess", label: "Governance, risk and process considerations", placeholder: "What risk, policy or governance points came up, and how did you handle them?" },
      { key: "areasForImprovement", label: "Areas for improvement", placeholder: "What would you like to strengthen next week?" }
    ],

    /* ---- Coaching question bank (by theme) ---- */
    coachingQuestionBank: {
      evidence: [
        "What evidence supports this decision, and how strong is it really?",
        "Where did this data come from, and how recent and complete is it?",
        "If a sceptical colleague asked 'how do you know?', what would you point to?",
        "What would change your mind, and do you have the evidence to test it?",
        "Where are you confident on evidence, and where are you honestly relying on assumption?",
        "What is the single piece of evidence that would most strengthen this case if you had it?"
      ],
      problem: [
        "What problem are you actually trying to solve, in one sentence, with no solution attached?",
        "Is this the real problem, or a symptom of something deeper?",
        "What are the likely root causes beneath what you are seeing?",
        "What is the risk if it turns out you have framed the wrong problem?",
        "Who agrees this is the problem, and who might define it differently?",
        "What outcome would tell you the problem is genuinely resolved?"
      ],
      "customer-outcome": [
        "What customer outcome improves if this succeeds?",
        "How would the customer actually notice the difference?",
        "Why does this matter to the customer, in their words rather than ours?",
        "Who exactly is the customer here, and are there segments we are overlooking?",
        "Is this meaningful to customers, or mainly convenient for us internally?",
        "What does 'better' look like from the customer's seat, not the team's?"
      ],
      assumptions: [
        "What assumptions are you making right now?",
        "Which of those assumptions, if wrong, would most undermine the work?",
        "What are you treating as fact that is actually still unproven?",
        "Where have you assumed because the data was missing, and have you flagged it?",
        "What would you need to check before betting on this assumption?",
        "Whose perspective might challenge the assumptions you are most comfortable with?"
      ],
      journey: [
        "What might you be missing across the wider journey?",
        "What happens upstream and downstream of this step?",
        "Who else is affected, and what hand-offs or dependencies are in play?",
        "Could improving this point create friction somewhere else?",
        "Are you optimising a component rather than the whole journey?",
        "If you followed one customer end to end, where would this change help, and where might it hurt?"
      ],
      value: [
        "Is this meaningful to customers, or mainly useful internally?",
        "What value does this create, and for whom?",
        "If you removed this, what would the customer actually lose?",
        "Are we solving something that matters, or something that is simply easy to do?",
        "How does this connect to the outcomes the organisation most cares about?",
        "What is the cost of doing this versus the cost of not doing it?"
      ],
      "best-in-class": [
        "What would best-in-class organisations do here?",
        "Who does this brilliantly, in or beyond your industry, and what can you borrow?",
        "If you reset expectations to the best you have ever experienced, what would change?",
        "What good practice exists externally that we are not yet using?",
        "Where are we accepting 'good enough' that the best would not?",
        "What benchmark would make you genuinely proud of this journey?"
      ],
      future: [
        "What might customers expect from this in 2-3 years?",
        "How are expectations in this space shifting, and are we ahead or behind?",
        "Which emerging technologies could change what good looks like here?",
        "If you designed for three years ahead, what would you do differently today?",
        "What opportunity sits just beyond the immediate request worth naming?",
        "What would future-you wish present-you had considered now?"
      ]
    },

    /* ---- Demo personas (4) ---- */
    personas: [
      {
        id: "persona-early-career",
        name: "Maya Holloway",
        role: "Customer Journey Manager (Early Career)",
        avatarInitials: "MH",
        background: "Maya moved into a CJM role nine months ago from a coordinator post and is still building her structured thinking muscles. She is enthusiastic and quick to act, which means she often reaches for a feature or fix before the underlying problem is properly framed. She tends to look at the single step in front of her rather than the whole journey.",
        strengths: [
          "High energy and genuine enthusiasm for improving the customer experience",
          "Comfortable talking to customers and frontline colleagues",
          "Willing to take action and unafraid to start"
        ],
        blindSpots: [
          "Jumps to solutions before the problem is defined",
          "Limited end-to-end view; optimises the local step she can see",
          "Weak structure; skips the pause, context-setting and evidence stages",
          "Under-uses data and rarely states assumptions explicitly"
        ],
        coachingStyleNeeds: [
          "Gentle, encouraging pace that builds confidence rather than overwhelming",
          "Strong scaffolding through the 5-stage framework with one stage at a time",
          "Frequent prompts to pause and reframe before solutioning",
          "Concrete worked examples that model good problem definition"
        ],
        seedProblemId: "problem-a"
      },
      {
        id: "persona-ba-oriented",
        name: "Daniel Osei",
        role: "Customer Journey Manager (BA-Oriented)",
        avatarInitials: "DO",
        background: "Daniel came into the CJM role from a business analyst background and is meticulous about documentation, requirements and traceability. He writes thorough specifications but tends to treat the journey as a backlog of stories rather than an outcome to own. His instinct is to capture and document rather than to challenge the why or frame the customer outcome.",
        strengths: [
          "Excellent at structured documentation and requirements capture",
          "Strong attention to detail and process discipline",
          "Comfortable with epics, stories and acceptance criteria"
        ],
        blindSpots: [
          "Drifts into BA-only behaviour and away from journey ownership",
          "Weak focus on measurable customer outcomes and strategic intent",
          "Limited customer framing; describes what the system does, not what the customer gains",
          "Treats requirement quality as the goal rather than a means to an outcome"
        ],
        coachingStyleNeeds: [
          "Challenge that reframes documentation work as outcome ownership",
          "Role-integrity feedback that names documentation-mode supportively",
          "Repeated 'what customer outcome improves?' prompts tied to each requirement",
          "Encouragement to step up to strategic and end-to-end framing"
        ],
        seedProblemId: "problem-b"
      },
      {
        id: "persona-delivery-focused",
        name: "Priya Nair",
        role: "Customer Journey Manager (Delivery-Focused)",
        avatarInitials: "PN",
        background: "Priya is a high-tempo delivery operator who is trusted to ship and to hit dates. Her bias for action gets things moving quickly, but the rush can mean research and customer framing are thin and downstream impacts are missed. She is most comfortable when there is a clear thing to build and a deadline to beat.",
        strengths: [
          "Strong delivery bias and momentum; gets initiatives moving",
          "Decisive and comfortable under time pressure",
          "Good at coordinating teams and removing blockers"
        ],
        blindSpots: [
          "Neglects research and insight gathering in favour of speed",
          "Thin customer framing; assumes the need rather than evidencing it",
          "Risks optimising a local step and creating downstream friction",
          "May solution before problem readiness is adequate"
        ],
        coachingStyleNeeds: [
          "Brisk, practical coaching that respects her pace but inserts key checks",
          "Targeted end-to-end journey validation prompts before committing to build",
          "Quick evidence and data-confidence checks rather than long detours",
          "Permission-giving framing that slowing down briefly de-risks delivery"
        ],
        seedProblemId: "problem-c"
      },
      {
        id: "persona-experienced-strategic",
        name: "Eleanor Whitfield",
        role: "Customer Journey Manager (Experienced & Strategic)",
        avatarInitials: "EW",
        background: "Eleanor is a seasoned journey owner with a strong strategic baseline, solid problem-framing habits and credible stakeholder relationships. Her thinking is sound but tends to stay inside the organisation's current context and present-day constraints. She benefits most from being stretched on innovation, external benchmarking and future-state ambition.",
        strengths: [
          "Mature problem definition and end-to-end journey ownership",
          "Strong strategic and stakeholder-management capability",
          "Comfortable with data, outcomes and measurable success"
        ],
        blindSpots: [
          "Thinks too internally; under-uses industry best practice and external signals",
          "Anchors on present-day constraints rather than future customer expectations",
          "Under-explores emerging technology and 2-3 year horizon shifts",
          "Can settle for a sound answer rather than a best-in-class one"
        ],
        coachingStyleNeeds: [
          "Peer-level, challenging dialogue rather than basic scaffolding",
          "Stretch prompts on future-state, emerging tech and external benchmarks",
          "Provocations comparing her plan to best-in-class organisations",
          "Forward-looking '2-3 years' and 'what would great look like' framing"
        ],
        seedProblemId: "problem-d"
      }
    ],

    /* ---- Demo problems (4) ---- */
    problems: [
      {
        id: "problem-a",
        code: "A",
        title: "Poorly Defined Issue",
        statement: "Customers are dropping out during a service process and stakeholders want a new feature urgently.",
        context: "An unspecified service process is losing customers partway through, and senior stakeholders are pushing for a new feature to fix it at speed. No one has yet pinned down where in the journey the drop-out occurs, why it happens, or which customers are affected. The request arrives already shaped as a solution ('build this feature') rather than as a defined problem, and the urgency is increasing pressure to skip framing.",
        assumptions: [
          "The drop-out is caused by a missing feature rather than confusing content, friction, trust or timing",
          "All customer segments are dropping out for the same reason",
          "The stage everyone is focused on is actually where the loss happens",
          "Stakeholder urgency reflects genuine customer harm rather than internal pressure"
        ],
        missingInformation: [
          "Where exactly in the process the drop-out occurs and the size of the drop",
          "Baseline conversion and trend data over time",
          "Customer feedback, complaints or session insight explaining why they leave",
          "Which segments are affected and whether the pattern varies by channel or device",
          "What changed or triggered the concern now"
        ],
        customerRisk: "Rushing to build a feature against an undefined problem risks adding complexity that does not address the real reason customers leave, potentially worsening friction. The customers actually being harmed may never benefit if the wrong stage or cause is targeted.",
        coachingOpportunities: [
          "Detect and gently name the solution-first framing before any building begins",
          "Use Stage 1 and Stage 2 to define the actual problem, root causes and affected customers",
          "Prompt for evidence and baseline data, flagging assumptions where data is missing",
          "Reframe stakeholder urgency into a sharper problem statement rather than a feature mandate"
        ],
        recommendedMode: "five-stage-coaching"
      },
      {
        id: "problem-b",
        code: "B",
        title: "Requirement Quality Issue",
        statement: "Change requests have been captured, but stories are inconsistent and acceptance criteria are poor.",
        context: "A set of change requests has been logged for an account-management journey, but the resulting user stories vary in format, level of detail and intent. Acceptance criteria are vague, untestable or missing, and the traceability back to the customer outcome and the underlying problem is weak. The CJM needs to assess requirement quality and strengthen it before the work is committed to delivery.",
        assumptions: [
          "The captured change requests reflect real, prioritised customer needs",
          "The inconsistencies are wording issues rather than genuine disagreement about scope",
          "Delivery teams can infer the missing detail without it being specified",
          "Acceptance criteria are understood the same way by everyone reading them"
        ],
        missingInformation: [
          "The customer outcome each story is meant to improve",
          "Definition of done and testable, measurable acceptance criteria",
          "Dependencies and hand-offs between stories and upstream/downstream systems",
          "Non-functional needs such as accessibility, performance and error handling",
          "Priority and the problem statement each requirement traces back to"
        ],
        customerRisk: "Inconsistent stories and weak acceptance criteria lead to ambiguous builds, rework and gaps that surface as customer-facing defects. Without traceability to a customer outcome, the team may deliver exactly what was written yet still fail the customer.",
        coachingOpportunities: [
          "Run the requirements validator over the pasted stories to expose ambiguity, contradiction and weak criteria",
          "Strengthen traceability from each story to the problem and to a measurable customer outcome",
          "Surface missing dependencies, hand-offs and non-functional requirements",
          "Use role-integrity feedback to lift the CJM from documentation mode to outcome ownership"
        ],
        recommendedMode: "requirement-validator",
        validatorExample: {
          epic: "Improve the online account update experience.",
          inconsistentUserStory: "As a user, I want to update my details so that the system is updated. As an admin I also need the customer record to refresh and it should be fast and work properly on mobile.",
          weakAcceptanceCriteria: [
            "It works",
            "The update is fast",
            "User can change their info",
            "No errors"
          ],
          whatTheValidatorShouldFlag: [
            "Mixed personas in one story (user and admin) — split into separate stories",
            "Outcome 'so that the system is updated' describes the system, not a customer benefit — no traceability to a customer outcome",
            "'fast', 'work properly', 'works' are subjective and untestable — no measurable threshold (e.g. saved within 2 seconds, 99% success rate)",
            "'No errors' gives no error-handling, validation or failure behaviour",
            "Mobile requirement is asserted but has no device/accessibility acceptance criteria",
            "No definition of done, no dependencies on the identity/record system, weak traceability to the underlying change request"
          ]
        }
      },
      {
        id: "problem-c",
        code: "C",
        title: "Fragmented Journey Optimisation",
        statement: "A team has proposed a local improvement that may create downstream friction.",
        context: "A delivery team has proposed an optimisation to one step of a journey, for example tightening up a form or automating an approval, to improve their own metric. The change looks like a clear win in isolation, but it touches hand-offs that other teams and systems depend on downstream. No one has mapped the upstream and downstream consequences of the local change or asked whether it improves the whole journey or just one component.",
        assumptions: [
          "Improving this single step improves the overall customer journey",
          "Downstream teams and systems can absorb the change without disruption",
          "The local metric the team is optimising is the right measure of success",
          "There are no hand-offs or dependencies that the change would break"
        ],
        missingInformation: [
          "What happens immediately upstream and downstream of the proposed change",
          "Who else is affected and which hand-offs or dependencies exist",
          "Whether the local gain is offset by friction or rework elsewhere",
          "End-to-end journey metrics, not just the team's local metric",
          "Whether downstream teams have been consulted"
        ],
        customerRisk: "A local optimisation can shift effort or friction further along the journey, leaving the customer no better off or actively worse off overall. Improving one team's number while degrading the end-to-end experience is a real risk for the customer.",
        coachingOpportunities: [
          "Apply the end-to-end journey validation checklist to map upstream, downstream and hand-offs",
          "Challenge whether this optimises a component or improves the whole journey",
          "Prompt the CJM to identify all affected teams and dependencies before committing",
          "Reframe the local metric against an end-to-end customer outcome"
        ],
        recommendedMode: "end-to-end-journey"
      },
      {
        id: "problem-d",
        code: "D",
        title: "Future-State Opportunity",
        statement: "A current interaction works today but may not meet customer expectations in 2-3 years.",
        context: "An existing interaction performs adequately today and generates few complaints, so it is easy to leave untouched. However, customer expectations are shifting, competitors and best-in-class organisations are moving ahead, and emerging technology is changing what 'good' looks like. The CJM has an opportunity to think beyond the immediate request and consider whether today's acceptable experience will still meet expectations in two to three years.",
        assumptions: [
          "Because it works today and complaints are low, it will remain acceptable",
          "Customer expectations will stay broadly where they are now",
          "Competitors and the wider industry are not materially raising the bar",
          "Emerging technology will not change what customers consider normal"
        ],
        missingInformation: [
          "Industry best practice and how best-in-class organisations handle this interaction",
          "Evidence of shifting customer expectations and external signals",
          "Emerging technologies that could reshape the interaction",
          "A forward-looking 2-3 year view of customer needs",
          "Opportunities that sit beyond the immediate, narrowly-scoped request"
        ],
        customerRisk: "An interaction that is merely acceptable today can quietly fall behind rising expectations, eroding customer satisfaction and loyalty before it shows up in complaints or metrics. By the time the gap is obvious, the organisation may be reacting rather than leading.",
        coachingOpportunities: [
          "Use future and external thinking prompts to stretch beyond present-day, internal context",
          "Benchmark against best-in-class organisations and emerging technology",
          "Explore what customers might reasonably expect in 2-3 years",
          "Surface opportunities beyond the immediate request while flagging confidence honestly where evidence is thin"
        ],
        recommendedMode: "future-external-thinking"
      }
    ]
  };
})();
