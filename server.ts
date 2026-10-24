import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Curated context-aware defaults for every onboarding step
const DEFAULT_STEP_TIPS: Record<string, { proTip: string; shortcut: string; efficiencyGain: string }> = {
  'step-search': {
    proTip: 'Use global fuzzy search to jump to any project, view, or team member in less than 2 keystrokes.',
    shortcut: '⌘ + K',
    efficiencyGain: '⚡ Saves ~15s per search'
  },
  'step-create': {
    proTip: 'Press shortcut "N" from anywhere on the dashboard to immediately open quick-project creation.',
    shortcut: 'N or ⌘ + N',
    efficiencyGain: '⚡ Instant project creation'
  },
  'step-metrics': {
    proTip: 'Hovering over key velocity and efficiency indicators exposes instant trend breakdowns and variance alerts.',
    shortcut: 'Hover / Tap',
    efficiencyGain: '⚡ Fast variance audit'
  },
  'step-chart': {
    proTip: 'Click any velocity chart bar to drill down directly into filtered sub-task distributions for that cycle.',
    shortcut: 'Click & Drag',
    efficiencyGain: '⚡ Zero-navigation drilldowns'
  },
  'step-filters': {
    proTip: 'Combine status filters with quick-search queries to save customized filtered views to your quick access bar.',
    shortcut: 'Option + Filter',
    efficiencyGain: '⚡ Cuts repetitive triage'
  },
  'step-team': {
    proTip: 'Use bulk email invites with pre-assigned role templates to onboard entire feature squads simultaneously.',
    shortcut: 'Shift + Enter',
    efficiencyGain: '⚡ Accelerates squad setup'
  }
};

function getCuratedTip(stepId?: string, stepTitle?: string, stepCategory?: string) {
  if (stepId && DEFAULT_STEP_TIPS[stepId]) {
    return DEFAULT_STEP_TIPS[stepId];
  }
  return {
    proTip: `Power-user tip: When using "${stepTitle || 'this feature'}", combine keyboard shortcuts with active filters to accelerate your ${stepCategory || 'workspace'} workflow.`,
    shortcut: '⌘ + K',
    efficiencyGain: '⚡ Saves 3x time on daily actions'
  };
}

interface CachedTip {
  proTip: string;
  shortcut: string;
  efficiencyGain: string;
  source: string;
  model?: string;
}

const tipCache = new Map<string, CachedTip>();
let rateLimitedUntil = 0;

// Pro-tip endpoint powered by Gemini API with fallback cascade & in-memory cache
app.post('/api/pro-tip', async (req, res) => {
  const { stepId, stepTitle, stepDescription, stepCategory, actionPrompt, keyInsight, userRole, force } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const cacheKey = `${stepId || 'unknown'}-${userRole || 'starter'}`;

  // Serve from cache if available and not forced refresh
  if (!force && tipCache.has(cacheKey)) {
    return res.json(tipCache.get(cacheKey)!);
  }

  // If no API key or currently within a rate-limit cooldown window, serve curated tip immediately
  if (!apiKey || Date.now() < rateLimitedUntil) {
    const fallback = getCuratedTip(stepId, stepTitle, stepCategory);
    const result: CachedTip = {
      ...fallback,
      source: 'curated'
    };
    tipCache.set(cacheKey, result);
    return res.json(result);
  }

  const prompt = `You are a world-class UX onboarding specialist and productivity engineering coach.
Generate a sharp, high-impact "Pro-Tip" for a user currently viewing the following step in an interactive workspace dashboard:

- Step ID: "${stepId || 'unknown'}"
- Step Title: "${stepTitle || 'Workspace Action'}"
- Step Description: "${stepDescription || ''}"
- Category: "${stepCategory || 'General'}"
- Live Action Prompt: "${actionPrompt || ''}"
- Key Insight: "${keyInsight || 'N/A'}"
- User Track / Role: "${userRole || 'starter'}"

Instructions:
1. Provide a "proTip": A concise, crisp (1-2 sentences), practical power-user tip, keyboard shortcut synergy, or productivity hack for this exact feature.
2. Provide a "shortcut": A keyboard shortcut or quick gesture (e.g., "⌘ + K", "Shift + Click", "N", "Esc", "Option + Drag", etc.).
3. Provide an "efficiencyGain": A brief tag noting the speedup or benefit (e.g. "⚡ 3x faster navigation", "🚀 Zero friction", "⏱️ Saves ~20s per task").

Return strictly valid JSON matching this schema:
{
  "proTip": "...",
  "shortcut": "...",
  "efficiencyGain": "..."
}`;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Recommended models per gemini-api guidelines
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text?.trim() || '{}';
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          proTip: text,
          shortcut: '⌘ + K',
          efficiencyGain: '⚡ Power-user shortcut'
        };
      }

      const result: CachedTip = {
        proTip: data.proTip || 'Leverage shortcuts and quick actions to streamline your workflow.',
        shortcut: data.shortcut || '⌘ + K',
        efficiencyGain: data.efficiencyGain || '⚡ Boosts speed',
        source: 'gemini',
        model
      };

      tipCache.set(cacheKey, result);
      return res.json(result);
    } catch (modelError: any) {
      const status = modelError?.status || modelError?.code;
      const errorMsg = String(modelError?.message || '');
      const isRateLimited =
        status === 429 ||
        status === 'RESOURCE_EXHAUSTED' ||
        errorMsg.includes('429') ||
        errorMsg.includes('RESOURCE_EXHAUSTED') ||
        errorMsg.includes('Quota exceeded') ||
        errorMsg.includes('rate-limits');

      const isUnavailable =
        status === 503 ||
        status === 'UNAVAILABLE' ||
        errorMsg.includes('503') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('UNAVAILABLE');

      if (isRateLimited) {
        // Enforce 30s cooldown to avoid hitting the Gemini Free Tier request limits
        rateLimitedUntil = Date.now() + 30000;
        break;
      }

      if (isUnavailable) {
        // Transient 503 spike, try next model in cascade
        continue;
      }

      break;
    }
  }

  // Seamless curated fallback if models are busy or rate-limited
  const fallback = getCuratedTip(stepId, stepTitle, stepCategory);
  const result: CachedTip = {
    ...fallback,
    source: 'curated'
  };
  tipCache.set(cacheKey, result);
  return res.json(result);
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
