// Heady Knowledge Base — provides real answers about the Heady ecosystem
// Used as the primary search engine when Heady Brain API is unavailable

const HEADY_KNOWLEDGE = [
    {
        keywords: ['heady', 'heady systems', 'what is heady', 'heady project', 'about heady'],
        title: 'Heady Systems — The Architecture of Intelligence',
        answer: `Heady Systems is an AI-powered ecosystem designed by a single developer to operate as a fully autonomous, intelligent infrastructure platform.

**Core Components:**
• **HeadyBrain** — Proprietary AI routing layer at manager.headysystems.com that processes queries through optimized inference
• **HeadyBattle** — Adversarial intelligence engine that challenges assumptions and validates outputs
• **HeadySoul** — Ethical oversight and decision governance system
• **HeadyBuddy** — User-facing AI assistant available at headybuddy.org
• **HeadyMCP** — Model Context Protocol integration for tool orchestration
• **HeadyWeb** — Chromium-based intelligent browser (you're using it now!)
• **HCFP** — Heady Core Functionality Platform — enforces production domain rules and auto-success mode

**Infrastructure:**
The platform runs on Cloudflare (DNS/CDN/WAF), Node.js + Express backends, Drupal 11 CMS, Qdrant vector database for semantic search, and Sacred Geometry design principles throughout.

Visit headysystems.com for architecture details.`,
        source: 'heady-knowledge-base',
    },
    {
        keywords: ['headybuddy', 'heady buddy', 'ai assistant', 'chat bot'],
        title: 'HeadyBuddy — Your AI Assistant',
        answer: `HeadyBuddy is the user-facing AI assistant in the Heady ecosystem, available at headybuddy.org.

**Features:**
• Real-time AI chat powered by Heady Brain
• Browser extension (Chrome/Chromium) with sidebar panel
• Widget embeddable on any website via headybuddy-widget.js
• Routes through manager.headysystems.com/api/brain/chat
• Privacy-first — no third-party tracking

HeadyBuddy is integrated directly into HeadyWeb's sidebar (click the ✨ icon in the address bar).`,
        source: 'heady-knowledge-base',
    },
    {
        keywords: ['headymcp', 'mcp', 'model context protocol', 'tools'],
        title: 'HeadyMCP — Model Context Protocol Integration',
        answer: `HeadyMCP provides AI tool orchestration through the Model Context Protocol (MCP) standard.

**Capabilities:**
• Chat, analyze, refactor, deploy via MCP tools
• HeadyPerplexity integration for deep research
• HeadyJules for background coding tasks
• HuggingFace model search and inference
• Knowledge base and service registry search
• Health monitoring across all Heady services

Available at headymcp.com. The MCP server connects through manager.headysystems.com.`,
        source: 'heady-knowledge-base',
    },
    {
        keywords: ['headyweb', 'browser', 'chromium', 'heady web'],
        title: 'HeadyWeb — The Intelligent Browser',
        answer: `HeadyWeb is a Chromium-based browser by Heady Systems, designed to be faster, smarter, and more private than Chrome or Comet.

**Features:**
• AI-powered search through Heady Brain (no Google dependency)
• Built-in HeadyBuddy AI sidebar
• Sacred Geometry animated new-tab page
• Tab management, bookmarks, address bar
• Ecosystem quick-access tiles
• HeadyBattle verification on all search results
• HCFP enforced for security

**Plans:**
• Free tier — basic AI search + browsing
• Pro ($9.99/mo) — unlimited AI queries, priority processing, search history sync
• Enterprise (custom) — team features, API access, custom branding

You're currently using HeadyWeb!`,
        source: 'heady-knowledge-base',
    },
    {
        keywords: ['headyme', 'admin', 'dashboard', 'command center'],
        title: 'HeadyMe — Admin Command Center',
        answer: `HeadyMe (headyme.com) is the Sacred Geometry admin dashboard for the Heady ecosystem.

**Features:**
• Real-time service monitoring
• AI node management (20 Heady AI nodes)
• Deployment controls
• Analytics and metrics
• User management
• System health visualization with Sacred Geometry patterns`,
        source: 'heady-knowledge-base',
    },
    {
        keywords: ['headyconnection', 'connection', 'community'],
        title: 'HeadyConnection — Community Platform',
        answer: `HeadyConnection (headyconnection.org) is the community and connection platform in the Heady ecosystem.

It provides social features, user networking, and community-driven AI interactions.`,
        source: 'heady-knowledge-base',
    },
    {
        keywords: ['price', 'pricing', 'plan', 'subscription', 'cost', 'pay', 'payment', 'free', 'pro', 'enterprise'],
        title: 'HeadyWeb Plans & Pricing',
        answer: `**HeadyWeb Browser Plans:**

🆓 **Free**
• AI-powered search (limited queries/day)
• Sacred Geometry new-tab page
• Bookmarks & tab management
• Basic HeadyBuddy sidebar

⭐ **Pro — $9.99/month**
• Unlimited AI search queries
• Priority Heady Brain processing
• Search history sync across devices
• Advanced HeadyBuddy (longer context, code generation)
• Ad-free experience
• HeadyBattle deep analysis on search results

🏢 **Enterprise — Custom pricing**
• Team/org management
• API access to Heady Brain
• Custom branding
• SLA + dedicated support
• Self-hosted option

Sign up to get started!`,
        source: 'heady-knowledge-base',
    },
    {
        keywords: ['sacred geometry', 'metatron', 'design', 'aesthetic'],
        title: 'Sacred Geometry in Heady',
        answer: `Sacred Geometry is the core design philosophy throughout the Heady ecosystem.

**Implementation:**
• Metatron's Cube animated background on HeadyWeb new-tab page
• Flower of Life patterns in HeadyMe admin dashboard
• Golden ratio proportions in UI layouts
• Harmonic color palettes derived from geometric relationships
• Animated nodes representing the 20 Heady AI interconnections

The Sacred Geometry symbolizes the interconnected intelligence architecture of the Heady platform.`,
        source: 'heady-knowledge-base',
    },
];

export function searchHeadyKnowledge(query) {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);

    let bestMatch = null;
    let bestScore = 0;

    for (const entry of HEADY_KNOWLEDGE) {
        let score = 0;
        for (const kw of entry.keywords) {
            if (q.includes(kw)) {
                score += kw.split(' ').length * 10; // Longer keyword matches score higher
            }
            for (const word of words) {
                if (kw.includes(word) && word.length > 2) {
                    score += 3;
                }
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }

    if (bestMatch && bestScore >= 3) {
        return {
            ok: true,
            title: bestMatch.title,
            response: bestMatch.answer,
            source: bestMatch.source,
            query,
            confidence: Math.min(bestScore / 30, 1),
        };
    }

    // No match — return a general "ask HeadyBuddy" response
    return {
        ok: true,
        title: `Search: "${query}"`,
        response: `Heady Brain is processing your query. For the best results on general topics, HeadyBuddy (sidebar) can provide interactive, contextual AI responses.\n\n**Quick actions:**\n• Click the ✨ icon in the address bar to open HeadyBuddy\n• Visit headybuddy.org for full AI chat\n• Try searching for Heady-specific topics: "HeadyWeb plans", "HeadyMCP", "Sacred Geometry"`,
        source: 'heady-search',
        query,
        confidence: 0.3,
    };
}

export { HEADY_KNOWLEDGE };
