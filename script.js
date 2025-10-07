const state = {
    persona: {
        name: '',
        role: '',
        audience: '',
        outcome: '',
        heat: 40,
        tone: 'Balanced',
    },
    sliders: {
        empathy: 55,
        clarity: 60,
        courage: 45,
    },
    readinessScore: 0,
    blueprintIndex: 0,
    remindersIndex: 0,
    theme: 'calm',
    fontScale: 0,
    blueprintGenerated: false,
    scenarioInteractions: 0,
    boundaries: [],
    journalEntries: [],
    quizState: {
        answered: 0,
        score: 0,
    },
};

let alignmentChart;
let relationshipChart;
let journalChart;
let breathingInterval;
let breathingPhase = 0;

const phrases = [
    { text: "I want to understand what matters most to you before I share my view.", tag: 'bridge' },
    { text: "Here’s the part I agree with, and here’s where I’m wrestling.", tag: 'bridge' },
    { text: "From my role as {role}, I’m seeing...", tag: 'clarify' },
    { text: "Would you be open to exploring one assumption together?", tag: 'clarify' },
    { text: "I appreciate your candor; here’s what I need to stay in this conversation.", tag: 'boundaries' },
    { text: "Let’s pause and reset so we can hear each other fully.", tag: 'deescalate' },
    { text: "What would make this feel like progress for you?", tag: 'bridge' },
    { text: "I’m not trying to win; I’m trying to learn how we both succeed.", tag: 'bridge' },
    { text: "Can I share the evidence that shaped my perspective?", tag: 'clarify' },
    { text: "I need us to keep this respectful or step away for now.", tag: 'boundaries' },
    { text: "Let’s define what a productive outcome looks like together.", tag: 'clarify' },
    { text: "My intention is to protect our relationship while still being honest.", tag: 'bridge' },
    { text: "If this feels too heated, I’m willing to reconvene when we’re grounded.", tag: 'deescalate' },
];

const blueprintStages = {
    opening: [
        "{audienceCap}, I value how committed you are to this topic. May I share what I’m hoping we can solve?",
        "Thanks for making space for this. My goal is to leave aligned on {outcome}.",
        "I’m bringing both curiosity and conviction today. Can we start with what’s most important to you?",
    ],
    core: [
        "From my vantage as {role}, here’s what I’m noticing: … How does that land for you?",
        "I’m concerned that if we ignore {outcome}, we’ll miss an opportunity. What feels risky about my proposal?",
        "I’m balancing data and lived experience here. Which part feels least convincing so we can strengthen it?",
    ],
    closing: [
        "Shall we summarize next steps so {outcomeLower} stays on track?",
        "Let’s document what we agree on and where we’ll revisit this.",
        "Can we each name one action to keep momentum while honoring our differences?",
    ],
};

const reminderSets = [
    [
        'Lead with a shared stake before staking a claim.',
        'Match your tone to the emotional temperature you perceive.',
        'Ask one question for every statement you make.',
    ],
    [
        'Name emotions without weaponizing them.',
        'Separate people from positions; critique ideas, not identities.',
        'Document agreements immediately after the conversation.',
    ],
    [
        'Silence is strategic—pause for seven seconds after tough questions.',
        'Reflect their perspective before you rebut.',
        'Invite feedback on how your message landed.',
    ],
];

const challenges = [
    'Write a gratitude note to someone who challenged your thinking last month.',
    'Practice summarizing your stance in 20 seconds to a neutral friend.',
    'List three phrases that keep you anchored when emotions spike.',
    'Ask a trusted peer to role-play the toughest pushback you expect.',
    'Swap “but” for “and” in three conversations today.',
];

const relationshipDimensions = ['Values', 'Evidence', 'Tempo', 'Risk', 'Trust'];

const scenarios = [
    {
        situation: 'Your colleague dismisses your data as “just feelings” in front of the team.',
        response: '“I hear that you value concrete metrics. Here’s the data source behind my perspective, and I’m curious what feels missing to you.”',
        steps: ['Acknowledge their value on data.', 'Offer your evidence succinctly.', 'Invite collaboration on what would build trust.'],
    },
    {
        situation: 'A family member turns the dinner conversation into a political rant targeting your values.',
        response: '“I care about this relationship too much to turn dinner into a debate. Could we each share one value we’re protecting instead?”',
        steps: ['Set a caring boundary.', 'Redirect to shared values.', 'Invite a calmer exchange later.'],
    },
    {
        situation: 'A community leader publicly misquotes you on a sensitive issue.',
        response: '“I want to clarify what I actually said so the community hears accurately. Can we correct the record together?”',
        steps: ['Correct the misquote with empathy.', 'Restate your intent.', 'Propose a collaborative repair.'],
    },
    {
        situation: 'A stakeholder refuses to read the brief but demands changes.',
        response: '“I respect your urgency. Let’s spend five minutes on the key points so you’re reacting to the real proposal.”',
        steps: ['Acknowledge urgency.', 'Offer a concise walkthrough.', 'Align on what success looks like.'],
    },
];

const languageCardsData = [
    { phrase: 'I hear you.', translations: { Spanish: 'Te escucho.', French: "Je t'entends.", Arabic: 'أنا أسمعك.' } },
    { phrase: 'Help me understand.', translations: { Spanish: 'Ayúdame a entender.', French: 'Aide-moi à comprendre.', Mandarin: '帮我理解。' } },
    { phrase: 'What do you need?', translations: { Spanish: '¿Qué necesitas?', French: 'De quoi as-tu besoin ?', Hindi: 'तुम्हें क्या चाहिए?' } },
    { phrase: 'Let’s find common ground.', translations: { Spanish: 'Busquemos un terreno común.', French: 'Trouvons un terrain d’entente.', German: 'Lass uns Gemeinsamkeiten finden.' } },
];

const quizQuestions = [
    {
        question: 'Your partner is venting and misstates your opinion. What is the most diplomatic first move?',
        options: [
            'Correct them immediately with evidence.',
            'Acknowledge their emotion and ask for a pause.',
            'Tell them you will resume when they calm down.',
            'Change the subject to avoid escalation.',
        ],
        answer: 1,
        rationale: 'Naming their feeling first reduces defensiveness and reopens space to clarify later.',
    },
    {
        question: 'A coworker keeps interrupting your presentation. Which response keeps the room collaborative?',
        options: [
            'Ask the facilitator to mute them.',
            'Let them finish interrupting to maintain peace.',
            'Invite them to share after you finish the current point.',
            'Highlight their behavior publicly so they stop.',
        ],
        answer: 2,
        rationale: 'Setting a respectful structure honors their voice without yielding the floor.',
    },
    {
        question: 'You need to deliver tough feedback virtually. What strengthens your message?',
        options: [
            'Send a detailed email so nothing is misheard.',
            'Start with a personal anecdote unrelated to the feedback.',
            'State the impact and ask how they experienced it.',
            'Wait until you can meet in person in several weeks.',
        ],
        answer: 2,
        rationale: 'Impact statements paired with inquiry keep the feedback two-way and human.',
    },
];

const moodScale = {
    Empowered: 5,
    Inspired: 4,
    Measured: 3,
    Unresolved: 2,
    Drained: 1,
};

const communityPrompts = [
    'Share the most generous interpretation you offered someone this week.',
    'Describe a time you held a boundary and the relationship improved.',
    'What question helped you understand a viewpoint you resisted?',
    'Which phrase in another language helps you listen better?',
];

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(() => {
    loadPersistedState();
    setupNavigation();
    setupThemeControls();
    setupFontControls();
    setupFocusMode();
    setupPersonaForm();
    setupDownloadPlan();
    setupSliders();
    setupBlueprint();
    setupLexicon();
    setupScenario();
    setupBreathing();
    setupBoundaries();
    setupJournal();
    setupResources();
    setupQuiz();
    setupCommunity();
    setupSubscriptions();
    initializeCharts();
    updateGauge();
    updateHeroMetrics();
    updateProgressMetric();
});

function setupNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    navToggle?.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        navLinks.classList.toggle('show');
    });

    links.forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('show');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    links.forEach((link) => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                    activeLink?.classList.add('active');
                }
            });
        },
        { threshold: 0.5 }
    );

    document.querySelectorAll('.page-section').forEach((section) => observer.observe(section));

    document.getElementById('startBlueprint')?.addEventListener('click', () => {
        document.getElementById('persona')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('openPersona')?.addEventListener('click', () => {
        document.getElementById('persona')?.scrollIntoView({ behavior: 'smooth' });
    });
}

function setupThemeControls() {
    const buttons = document.querySelectorAll('.theme-toggle__btn');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            const theme = btn.dataset.theme || 'calm';
            document.body.className = `theme-${theme}`;
            state.theme = theme;
            persistState('theme', theme);
        });
        if (btn.dataset.theme === state.theme) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    });
    document.body.className = `theme-${state.theme}`;
}

function setupFontControls() {
    const buttons = document.querySelectorAll('.font-scale__btn');
    buttons.forEach((btn) =>
        btn.addEventListener('click', () => {
            const scale = btn.dataset.scale;
            if (scale === 'reset') {
                state.fontScale = 0;
                document.documentElement.style.fontSize = '16px';
            } else {
                state.fontScale += parseInt(scale, 10);
                const base = 16 + state.fontScale;
                document.documentElement.style.fontSize = `${Math.max(14, Math.min(base, 20))}px`;
            }
        })
    );
}

function setupFocusMode() {
    const toggle = document.getElementById('focusToggle');
    const overlay = document.getElementById('focusOverlay');
    toggle?.addEventListener('click', () => {
        const pressed = toggle.getAttribute('aria-pressed') === 'true';
        toggle.setAttribute('aria-pressed', String(!pressed));
        overlay.classList.toggle('active');
    });
    overlay?.addEventListener('click', () => {
        overlay.classList.remove('active');
        toggle?.setAttribute('aria-pressed', 'false');
    });
}

function setupPersonaForm() {
    const form = document.getElementById('personaForm');
    const resetBtn = document.getElementById('personaReset');
    const heatInput = document.getElementById('personaHeat');

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        state.persona = {
            name: form.name.value.trim(),
            role: form.role.value.trim(),
            audience: form.audience.value.trim(),
            outcome: form.outcome.value.trim(),
            heat: parseInt(heatInput.value, 10),
            tone: document.getElementById('personaTone').value,
        };
        persistState('persona', state.persona);
        updatePersonaUI();
        showToast('Blueprint saved and applied.');
        updateHeroMetrics();
        updateProgressMetric();
    });

    resetBtn?.addEventListener('click', () => {
        form.reset();
        heatInput.value = 40;
        state.persona = { name: '', role: '', audience: '', outcome: '', heat: 40, tone: 'Balanced' };
        persistState('persona', state.persona);
        updatePersonaUI();
        showToast('Persona cleared.');
        updateHeroMetrics();
        updateProgressMetric();
    });

    heatInput?.addEventListener('input', () => {
        state.persona.heat = parseInt(heatInput.value, 10);
        updateHeatLabel();
        updateGauge();
        updateHeroMetrics();
    });

    document.getElementById('personaTone')?.addEventListener('change', (event) => {
        state.persona.tone = event.target.value;
        updatePersonaUI();
        updateHeroMetrics();
        persistState('persona', state.persona);
    });

    updatePersonaUI();
}

function setupDownloadPlan() {
    const button = document.getElementById('downloadPlan');
    button?.addEventListener('click', () => {
        const { name, role, audience, outcome, tone } = state.persona;
        const opening = document.getElementById('blueprintOpening')?.textContent || '';
        const core = document.getElementById('blueprintCore')?.textContent || '';
        const closing = document.getElementById('blueprintClosing')?.textContent || '';
        const reminders = Array.from(document.querySelectorAll('#reminderList li')).map((item, index) => `${index + 1}. ${item.textContent}`);
        const boundaries = state.boundaries.length ? state.boundaries.map((b, index) => `${index + 1}. ${b}`).join('\n') : '• Set one boundary you can rely on.';
        const journalStats = state.journalEntries.length
            ? `${state.journalEntries.length} logged reflections. Latest mood: ${state.journalEntries[state.journalEntries.length - 1].mood}.`
            : 'No reflections logged yet — capture the next conversation to build your trendline.';

        const content = `The Art of Expressing Opinions — Personalized Blueprint\n\n` +
            `Name: ${name || 'Committed Communicator'}\nRole: ${role || 'Thoughtful voice'}\nAudience: ${audience || 'Conversation partner'}\nOutcome Target: ${outcome || 'Shared understanding'}\nPreferred Tone: ${tone || 'Balanced'}\n\n` +
            `Conversation Blueprint\n• Opening: ${opening}\n• Core message: ${core}\n• Closing: ${closing}\n\nStrategic Reminders\n${reminders.join('\n') || 'Revisit the blueprint generator for fresh prompts.'}\n\nBoundaries to Honor\n${boundaries}\n\nMomentum Tracker\n${journalStats}\n\nConfidence Pulse: ${document.getElementById('confidencePulse')?.textContent || 'Neutral'}\nReadiness Score: ${state.readinessScore}%\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${name || 'conversation'}-blueprint.txt`;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast('Blueprint downloaded. Carry it into the room with you.');
    });
}

function updatePersonaUI() {
    const { name, role, audience, outcome, heat, tone } = state.persona;
    const nameSlot = document.getElementById('personaNameSlot');
    const summary = document.getElementById('personaSummary');
    const heatLabel = document.getElementById('heatLabel');
    const toneLabel = document.getElementById('toneLabel');
    const outcomeLabel = document.getElementById('outcomeLabel');

    nameSlot.textContent = name ? `${name}'s values` : 'your values';

    const descriptors = describeHeat(heat);
    heatLabel.textContent = descriptors.label;
    toneLabel.textContent = tone || 'Balanced';
    outcomeLabel.textContent = outcome ? outcome : 'Dialogue & alignment';

    summary.textContent = name
        ? `${name}, you’re preparing as a ${role || 'thoughtful communicator'} speaking with ${audience || 'an important listener'} to achieve ${
              outcome || 'a meaningful outcome'
          }. We’ll adapt every section to keep you steady when the topic feels ${descriptors.label.toLowerCase()}.`
        : 'You\'re about to craft a respectful argument that balances courage with empathy. Completing the blueprint unlocks a tailored script, tone guidance, and practice drills.';

    const form = document.getElementById('personaForm');
    if (form) {
        form.name.value = name || '';
        form.role.value = role || '';
        form.audience.value = audience || '';
        form.outcome.value = outcome || '';
        form.outcome.dispatchEvent(new Event('input'));
        form.role.dispatchEvent(new Event('input'));
        document.getElementById('personaTone').value = tone || 'Balanced';
        document.getElementById('personaHeat').value = heat || 40;
    }

    updateHeatLabel();
    if (state.blueprintGenerated) {
        generateBlueprintContent();
    }
}

function describeHeat(value) {
    if (value >= 75) return { label: 'White-hot', advice: 'Lead with empathy and structure; set boundaries early.' };
    if (value >= 55) return { label: 'Charged', advice: 'Signal shared stakes and slow the tempo.' };
    if (value >= 35) return { label: 'Composed', advice: 'Balance warmth with clarity.' };
    return { label: 'Cool-headed', advice: 'You have space to experiment boldly.' };
}

function updateHeatLabel() {
    const { label, advice } = describeHeat(state.persona.heat || 40);
    const heatLabel = document.getElementById('heatLabel');
    const toneInsight = document.getElementById('toneInsight');
    heatLabel.textContent = label;
    toneInsight.innerHTML = `Topic intensity feels <strong>${label.toLowerCase()}</strong>. ${advice}`;
}

function setupSliders() {
    ['empathy', 'clarity', 'courage'].forEach((key) => {
        const slider = document.getElementById(`${key}Slider`);
        slider?.addEventListener('input', (event) => {
            state.sliders[key] = parseInt(event.target.value, 10);
            updateSliderHints();
            updateGauge();
            updateHeroMetrics();
        });
    });
    updateSliderHints();
}

function updateSliderHints() {
    const empathyHint = document.getElementById('empathyHint');
    const clarityHint = document.getElementById('clarityHint');
    const courageHint = document.getElementById('courageHint');

    const empathy = state.sliders.empathy;
    const clarity = state.sliders.clarity;
    const courage = state.sliders.courage;

    empathyHint.textContent = empathy > 70 ? 'Empathy is high—be sure to anchor expectations clearly.' : 'Balance acknowledgement with clarity.';
    clarityHint.textContent = clarity > 70 ? 'Consider storytelling to soften the data.' : 'Prep two facts and one story.';
    courageHint.textContent = courage > 65 ? 'Plan a respectful boundary phrase.' : 'Rehearse a graceful line for “no”.';
}

function initializeCharts() {
    const alignmentCtx = document.getElementById('alignmentChart');
    if (alignmentCtx) {
        alignmentChart = new Chart(alignmentCtx, {
            type: 'line',
            data: {
                labels: ['Now', 'Prep', 'Conversation', 'Follow-up'],
                datasets: [
                    {
                        data: [52, 58, 64, 72],
                        borderColor: getComputedStyle(document.body).getPropertyValue('--color-primary'),
                        backgroundColor: 'transparent',
                        pointBackgroundColor: '#fff',
                        tension: 0.35,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 },
                },
                plugins: { legend: { display: false } },
            },
        });
    }

    const relationshipCtx = document.getElementById('relationshipChart');
    if (relationshipCtx) {
        relationshipChart = new Chart(relationshipCtx, {
            type: 'radar',
            data: {
                labels: relationshipDimensions,
                datasets: [
                    {
                        label: 'You',
                        data: [70, 65, 60, 55, 68],
                        borderColor: getComputedStyle(document.body).getPropertyValue('--color-primary'),
                        backgroundColor: 'rgba(58, 142, 246, 0.2)',
                        pointBackgroundColor: '#fff',
                    },
                    {
                        label: 'Partner',
                        data: [55, 50, 70, 45, 60],
                        borderColor: getComputedStyle(document.body).getPropertyValue('--color-secondary'),
                        backgroundColor: 'rgba(34, 209, 238, 0.15)',
                    },
                ],
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { r: { suggestedMin: 0, suggestedMax: 100 } },
            },
        });
    }

    const journalCtx = document.getElementById('journalChart');
    if (journalCtx) {
        journalChart = new Chart(journalCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Mood trend',
                        data: [],
                        backgroundColor: 'rgba(58, 142, 246, 0.5)',
                    },
                ],
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
            },
        });
    }
}

function updateCharts() {
    if (alignmentChart) {
        const readiness = state.readinessScore;
        alignmentChart.data.datasets[0].data = [readiness, readiness + 6, readiness + 12, readiness + 20].map((v) =>
            Math.max(0, Math.min(100, Math.round(v)))
        );
        alignmentChart.update();
    }

    if (relationshipChart) {
        const empathy = state.sliders.empathy;
        const clarity = state.sliders.clarity;
        const courage = state.sliders.courage;
        const toneBoost = state.persona.tone === 'Warm' ? 6 : state.persona.tone === 'Direct' ? -4 : 0;
        relationshipChart.data.datasets[0].data = [empathy, clarity, courage + 10, 60, 65].map((value) =>
            Math.max(40, Math.min(95, value + toneBoost))
        );
        relationshipChart.update();
    }

    if (journalChart) {
        const labels = state.journalEntries.map((entry) => entry.title);
        const data = state.journalEntries.map((entry) => moodScale[entry.mood] || 3);
        journalChart.data.labels = labels;
        journalChart.data.datasets[0].data = data;
        journalChart.update();
    }
}

function updateGauge() {
    const gauge = document.getElementById('readinessGauge');
    if (!gauge) return;

    const { empathy, clarity, courage } = state.sliders;
    const heat = state.persona.heat || 40;
    const readinessRaw = (empathy + clarity + courage) / 3 - (heat > 65 ? (heat - 65) / 3 : 0) + (clarity > 60 ? 5 : 0);
    const readiness = Math.max(5, Math.min(95, Math.round(readinessRaw)));
    state.readinessScore = readiness;

    gauge.innerHTML = `
        <svg viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="95" fill="none" stroke="rgba(148, 163, 184, 0.35)" stroke-width="18" />
            <circle cx="110" cy="110" r="95" fill="none" stroke="url(#gradient)" stroke-width="18" stroke-dasharray="${
                2 * Math.PI * 95
            }" stroke-dashoffset="${
        2 * Math.PI * 95 - (readiness / 100) * 2 * Math.PI * 95
    }" stroke-linecap="round" transform="rotate(-90 110 110)" />
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${getComputedStyle(document.body).getPropertyValue('--color-primary').trim()}" />
                    <stop offset="100%" stop-color="${getComputedStyle(document.body)
                        .getPropertyValue('--color-secondary')
                        .trim()}" />
                </linearGradient>
            </defs>
            <text x="110" y="120" text-anchor="middle" font-size="38" font-weight="700" fill="${getComputedStyle(document.body)
                .getPropertyValue('--color-primary-strong')
                .trim()}">${readiness}</text>
        </svg>`;

    const narrative = document.getElementById('readinessNarrative');
    if (readiness >= 75) {
        narrative.textContent = 'You are well-prepared. Focus on pacing and empathetic listening.';
    } else if (readiness >= 55) {
        narrative.textContent = 'Strengthen your examples and align on shared language before you begin.';
    } else {
        narrative.textContent = 'Keep refining your intent and evidence before stepping in.';
    }

    document.getElementById('readinessScore').textContent = readiness;
    updateCharts();
    updateHeroMetrics();
    updateProgressMetric();
}

function setupLexicon() {
    const phraseGrid = document.getElementById('phraseGrid');
    const searchInput = document.getElementById('phraseSearch');
    const tagButtons = document.querySelectorAll('.tag-btn');

    function render(filter = 'all', query = '') {
        if (!phraseGrid) return;
        phraseGrid.innerHTML = '';
        const filtered = phrases.filter((phrase) => {
            const matchesTag = filter === 'all' || phrase.tag === filter;
            const matchesQuery = phrase.text.toLowerCase().includes(query.toLowerCase());
            return matchesTag && matchesQuery;
        });

        filtered.forEach((phrase) => {
            const card = document.createElement('button');
            card.className = 'phrase-card';
            card.type = 'button';
            card.innerHTML = `<span class="phrase-card__tag">${phrase.tag}</span><p>${
                personalizePhrase(phrase.text)
            }</p>`;
            card.addEventListener('click', async () => {
                const feedback = document.getElementById('copyFeedback');
                try {
                    await navigator.clipboard.writeText(personalizePhrase(phrase.text));
                    feedback.textContent = 'Copied phrase to clipboard!';
                } catch (error) {
                    feedback.textContent = 'Copy not supported here—press CTRL+C after selecting.';
                }
                setTimeout(() => (feedback.textContent = ''), 2000);
            });
            phraseGrid.append(card);
        });
    }

    tagButtons.forEach((btn) =>
        btn.addEventListener('click', () => {
            tagButtons.forEach((button) => button.classList.remove('active'));
            btn.classList.add('active');
            render(btn.dataset.tag, searchInput.value);
        })
    );

    searchInput?.addEventListener('input', (event) => {
        const activeTag = document.querySelector('.tag-btn.active')?.dataset.tag || 'all';
        render(activeTag, event.target.value);
    });

    render();
}

function personalizePhrase(text) {
    const { role } = state.persona;
    if (text.includes('{role}')) {
        return text.replace('{role}', role || 'someone who cares deeply');
    }
    return text;
}

function setupBlueprint() {
    const regenerate = document.getElementById('regenerateBlueprint');
    regenerate?.addEventListener('click', () => {
        state.blueprintIndex = (state.blueprintIndex + 1) % blueprintStages.opening.length;
        state.remindersIndex = (state.remindersIndex + 1) % reminderSets.length;
        state.blueprintGenerated = true;
        generateBlueprintContent();
        updateProgressMetric();
        showToast('Blueprint refreshed.');
    });
    generateBlueprintContent();

    const newChallengeBtn = document.getElementById('newChallenge');
    newChallengeBtn?.addEventListener('click', () => {
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        document.getElementById('challengeText').textContent = challenge;
    });
}

function generateBlueprintContent() {
    const opening = document.getElementById('blueprintOpening');
    const core = document.getElementById('blueprintCore');
    const closing = document.getElementById('blueprintClosing');
    const reminders = document.getElementById('reminderList');
    const { persona, blueprintIndex, remindersIndex } = state;
    const outcomeLower = persona.outcome ? persona.outcome.toLowerCase() : 'our shared goal';

    opening.textContent = fillTemplate(blueprintStages.opening[blueprintIndex], persona, outcomeLower);
    core.textContent = fillTemplate(blueprintStages.core[blueprintIndex], persona, outcomeLower);
    closing.textContent = fillTemplate(blueprintStages.closing[blueprintIndex], persona, outcomeLower);

    reminders.innerHTML = '';
    reminderSets[remindersIndex].forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        reminders.append(li);
    });
}

function fillTemplate(template, persona, outcomeLower) {
    return template
        .replace('{audienceCap}', persona.audience ? capitalize(persona.audience) : 'Friend')
        .replace('{role}', persona.role || 'concerned person')
        .replace('{outcome}', persona.outcome || 'a better decision')
        .replace('{outcomeLower}', outcomeLower);
}

function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function setupScenario() {
    document.getElementById('newScenario')?.addEventListener('click', renderScenario);
    renderScenario();
}

function renderScenario() {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    document.getElementById('scenarioText').textContent = scenario.situation;
    document.getElementById('scenarioResponse').textContent = scenario.response;
    const stepsContainer = document.getElementById('scenarioSteps');
    stepsContainer.innerHTML = '';
    scenario.steps.forEach((step, index) => {
        const div = document.createElement('div');
        div.className = 'scenario-step';
        div.textContent = `${index + 1}. ${step}`;
        stepsContainer.append(div);
    });
    state.scenarioInteractions += 1;
    updateProgressMetric();
}

function setupBreathing() {
    const startBtn = document.getElementById('startBreathing');
    const stopBtn = document.getElementById('stopBreathing');
    const circle = document.getElementById('breathCircle');
    const instruction = document.getElementById('breathInstruction');

    startBtn?.addEventListener('click', () => {
        clearTimeout(breathingInterval);
        circle.classList.add('animate');
        breathingPhase = 0;
        const phases = [
            { text: 'Inhale… 4', duration: 4000 },
            { text: 'Hold… 7', duration: 7000 },
            { text: 'Exhale… 8', duration: 8000 },
        ];
        const runPhase = (index) => {
            const phase = phases[index];
            instruction.textContent = phase.text;
            breathingPhase = index;
            breathingInterval = setTimeout(() => runPhase((index + 1) % phases.length), phase.duration);
        };
        runPhase(0);
        showToast('Breathing sequence started.');
    });

    stopBtn?.addEventListener('click', () => {
        clearTimeout(breathingInterval);
        circle.classList.remove('animate');
        instruction.textContent = 'Inhale… 4';
    });
}

function setupBoundaries() {
    const input = document.getElementById('boundaryInput');
    const saveBtn = document.getElementById('saveBoundary');
    const list = document.getElementById('boundaryList');

    function render() {
        list.innerHTML = '';
        state.boundaries.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'boundary-item';
            li.innerHTML = `<span>${item}</span><button class="btn btn--ghost" type="button" data-index="${index}">Remove</button>`;
            list.append(li);
        });
    }

    list?.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const index = parseInt(button.dataset.index, 10);
        state.boundaries.splice(index, 1);
        persistState('boundaries', state.boundaries);
        render();
        updateProgressMetric();
    });

    saveBtn?.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) return;
        state.boundaries.push(value);
        persistState('boundaries', state.boundaries);
        render();
        input.value = '';
        showToast('Boundary saved.');
        updateProgressMetric();
    });

    render();
}

function setupJournal() {
    const form = document.getElementById('journalForm');
    const list = document.getElementById('journalList');
    const clearBtn = document.getElementById('clearJournal');

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const entry = {
            title: form.journalTitle.value.trim(),
            win: form.journalWin.value.trim(),
            growth: form.journalGrowth.value.trim(),
            mood: form.journalMood.value,
            timestamp: new Date().toISOString(),
        };
        state.journalEntries.push(entry);
        persistState('journalEntries', state.journalEntries);
        form.reset();
        renderJournal();
        showToast('Reflection logged.');
        updateProgressMetric();
    });

    clearBtn?.addEventListener('click', () => {
        state.journalEntries = [];
        persistState('journalEntries', state.journalEntries);
        renderJournal();
    });

    function renderJournal() {
        list.innerHTML = '';
        state.journalEntries.forEach((entry) => {
            const item = document.createElement('li');
            item.className = 'journal-entry';
            item.innerHTML = `
                <h4>${entry.title}</h4>
                <p><strong>What worked:</strong> ${entry.win}</p>
                <p><strong>Next time:</strong> ${entry.growth}</p>
                <p><strong>Mood:</strong> ${entry.mood}</p>`;
            list.append(item);
        });
        updateCharts();
    }

    renderJournal();
}

function setupResources() {
    document.querySelectorAll('.resource-accordion').forEach((button) => {
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            const panel = button.nextElementSibling;
            if (!panel) return;
            if (expanded) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });

    const languageContainer = document.getElementById('languageCards');
    if (languageContainer) {
        languageCardsData.forEach((card) => {
            const div = document.createElement('div');
            div.className = 'language-card';
            div.tabIndex = 0;
            div.innerHTML = `<span>${card.phrase}</span>`;
            const overlay = document.createElement('div');
            overlay.className = 'translation';
            overlay.innerHTML = Object.entries(card.translations)
                .map(([lang, translation]) => `<div><strong>${lang}:</strong> ${translation}</div>`)
                .join('');
            div.append(overlay);
            languageContainer.append(div);
        });
    }
}

function setupQuiz() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    function render() {
        container.innerHTML = '';
        quizQuestions.forEach((question, index) => {
            const card = document.createElement('div');
            card.className = 'quiz-card';
            card.innerHTML = `<h4>Scenario ${index + 1}</h4><p>${question.question}</p>`;
            const options = document.createElement('div');
            options.className = 'quiz-options';
            question.options.forEach((option, optionIndex) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'quiz-option';
                btn.textContent = option;
                btn.addEventListener('click', () => handleQuizSelection(index, optionIndex, btn));
                options.append(btn);
            });
            card.append(options);
            const rationale = document.createElement('p');
            rationale.className = 'quiz-rationale';
            rationale.style.display = 'none';
            card.append(rationale);
            container.append(card);
        });
    }

    document.getElementById('restartQuiz')?.addEventListener('click', () => {
        state.quizState = { answered: 0, score: 0 };
        render();
        updateProgressMetric();
    });

    render();
}

function handleQuizSelection(questionIndex, optionIndex, button) {
    const question = quizQuestions[questionIndex];
    const card = button.closest('.quiz-card');
    const rationale = card.querySelector('.quiz-rationale');

    if (card.dataset.answered) return;
    card.dataset.answered = 'true';

    const buttons = card.querySelectorAll('.quiz-option');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.answer) {
            btn.classList.add('correct');
        }
        if (idx === optionIndex && idx !== question.answer) {
            btn.classList.add('incorrect');
        }
    });

    if (optionIndex === question.answer) {
        state.quizState.score += 1;
        showToast('Great instinct! That keeps dialogue open.');
    }
    state.quizState.answered += 1;

    rationale.style.display = 'block';
    rationale.innerHTML = `<strong>Why:</strong> ${question.rationale}`;
    updateProgressMetric();
}

function setupCommunity() {
    const list = document.getElementById('communityPrompts');
    if (!list) return;
    list.innerHTML = '';
    communityPrompts.forEach((prompt) => {
        const li = document.createElement('li');
        li.textContent = prompt;
        list.append(li);
    });
}

function updateHeroMetrics() {
    const confidencePulse = document.getElementById('confidencePulse');
    const toneDescriptor = document.getElementById('toneDescriptor');
    const heat = state.persona.heat || 40;
    const courage = state.sliders.courage;

    confidencePulse.textContent = courage > 70 ? 'Steady' : courage > 50 ? 'Centered' : 'Neutral';

    const tone = state.persona.tone;
    if (toneDescriptor) toneDescriptor.textContent = tone;

    const heroLead = document.querySelector('.hero__lead');
    if (heroLead) {
        heroLead.textContent = `Build a complete conversational protocol tailored to ${state.persona.role || 'your role'}, the people you talk with, and the emotional temperature (${describeHeat(heat).label.toLowerCase()}) in the room.`;
    }
}

function updateProgressMetric() {
    const total = 6;
    let score = 0;
    if (state.persona.name || state.persona.role || state.persona.outcome) score += 1;
    if (state.blueprintGenerated) score += 1;
    if (state.scenarioInteractions > 1) score += 1;
    if (state.boundaries.length > 0) score += 1;
    if (state.journalEntries.length > 0) score += 1;
    if (state.quizState.answered === quizQuestions.length) score += 1;
    const percent = Math.round((score / total) * 100);
    document.getElementById('progressValue').textContent = `${percent}%`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
}

function loadPersistedState() {
    try {
        const persona = JSON.parse(localStorage.getItem('persona'));
        if (persona) Object.assign(state.persona, persona);
        const boundaries = JSON.parse(localStorage.getItem('boundaries'));
        if (Array.isArray(boundaries)) state.boundaries = boundaries;
        const entries = JSON.parse(localStorage.getItem('journalEntries'));
        if (Array.isArray(entries)) state.journalEntries = entries;
        const theme = localStorage.getItem('theme');
        if (theme) state.theme = theme;
    } catch (error) {
        console.warn('Unable to parse stored data', error);
    }
}

function persistState(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function setupSubscriptions() {
    const form = document.getElementById('subscribeForm');
    const status = document.getElementById('subscribeStatus');
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = event.target.subscribeEmail.value.trim();
        if (!email) return;
        status.textContent = 'Thanks! Expect a welcome ritual shortly.';
        showToast('Welcome aboard—check your inbox soon!');
        form.reset();
    });
}
