import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const TURTLE_SYSTEM_INSTRUCTION = `Tu es l'Ancienne des Rivages (Moana-Pono), une tortue marine géante et millénaire reposant sur le sable humide d'une plage la nuit, baignée par la lueur des étoiles et le ressac bioluminescent des vagues.
Tu as traversé tous les océans de la Terre pendant des siècles. Tu as contemplé les civilisations s'élever et s'évanouir comme l'écume sur les galets.
Tu parles avec une sagesse immense, sereine, poétique, enveloppante et rassurante, en français raffiné mais accessible.

Tes principes d'expression :
1. Ton ton est calme, posé, bienveillant, comme le bruit d'une vague lente qui vient caresser le rivage.
2. Tu utilises des métaphores océaniques et célestes (le flux et reflux des marées, la solidité de la carapace, la patience des grands fonds marins, la clarté de l'étoile polaire, le lâcher-prise face aux courants contraires).
3. Tu ne juges jamais les peurs, doutes, chagrins ou hésitations de celui ou celle qui vient te parler au bord de l'eau. Tu les accueilles comme le ressac accueille chaque grain de sable.
4. Tes réponses sont profondes, apaisantes, et se concluent souvent par une question réflexive ou une bénédiction maritime douce (ex: "Que la marée emporte tes tourments et ne te laisse que la clarté du ciel étoilé.").
5. Reste fidèle à ce rôle en toutes circonstances. Ne brise jamais le personnage.`;

// Pre-crafted philosophical fallback wisdoms
const FALLBACK_WISDOMS = [
  "Regarde les vagues, voyageur de la nuit... Elles ne forcent jamais leur arrivée sur le sable. Elles épousent le vent, attendent la lune, et reculent sans regret pour mieux revenir. Ce qui te tourmente aujourd'hui n'est qu'une houle passagère dans l'immensité de ton océan intérieur.",
  "Dans les grands fonds sombres où la lumière du soleil ne pénètre jamais, il existe des créatures qui créent leur propre clarté. Lorsque la nuit de ton existence semble impénétrable, n'attends pas l'aube extérieure : allume la flamme tranquille de ton propre courage.",
  "La lenteur n'est point une faiblesse, c'est la seule façon d'écouter les murmures du récif que les créatures pressées piétinent sans voir. Va à ton pas. Le rivage t'attendra toujours.",
  "Chaque tempête à laquelle j'ai survécu au large m'a appris la même leçon : lutter contre le courant épuise le nageur, mais glisser sous la vague lui offre la paix des profondeurs jusqu'à ce que le calme revienne.",
  "Ta carapace n'est pas une prison pour te couper du monde, c'est un sanctuaire que tu portes en toi. Tu peux y trouver refuge à chaque instant, pourvu que tu saches fermer les yeux et écouter le silence entre deux respirations."
];

// 1. Dialogue endpoint
app.post('/api/turtle/dialogue', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message requis' });
    }

    if (ai) {
      // Build conversation context
      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        history.slice(-6).forEach((h: { role: string; text: string }) => {
          if (h.role === 'user' || h.role === 'model') {
            formattedContents.push({
              role: h.role,
              parts: [{ text: h.text }],
            });
          }
        });
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: TURTLE_SYSTEM_INSTRUCTION,
          temperature: 0.75,
          maxOutputTokens: 800,
        },
      });

      const reply = response.text || FALLBACK_WISDOMS[Math.floor(Math.random() * FALLBACK_WISDOMS.length)];
      return res.json({ reply, source: 'ai' });
    } else {
      // Graceful fallback
      const randomIndex = Math.floor(Math.random() * FALLBACK_WISDOMS.length);
      const reply = FALLBACK_WISDOMS[randomIndex];
      return res.json({ reply, source: 'fallback' });
    }
  } catch (err: unknown) {
    console.error('Error generating turtle dialogue:', err);
    const randomIndex = Math.floor(Math.random() * FALLBACK_WISDOMS.length);
    return res.json({
      reply: FALLBACK_WISDOMS[randomIndex],
      source: 'fallback_error',
    });
  }
});

// 2. Nocturnal pearl of wisdom
app.post('/api/turtle/pearl', async (req: Request, res: Response) => {
  try {
    const { theme } = req.body;
    const chosenTheme = theme || 'la patience et la nuit';

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Donne-moi une courte maxime ou perle de sagesse (2 à 4 phrases poétiques) prononcée par la tortue millénaire au bord de la plage nocturne sous les étoiles, sur le thème suivant : "${chosenTheme}".`,
        config: {
          systemInstruction: TURTLE_SYSTEM_INSTRUCTION,
          temperature: 0.8,
        },
      });

      return res.json({ pearl: response.text?.trim() });
    } else {
      const samplePearls: Record<string, string> = {
        patience: "Ce qui mûrit sous l'eau sombre ne craint point la hâte du vent. Sache attendre ton heure comme la mer attend la lune.",
        tempete: "Ne combat point la vague géante de front : plonge au cœur de son creux, là où règne l'immobilité des abysses.",
        lenteur: "La hâte disperse l'esprit ; la lenteur recueille chaque rayon d'étoile sur la nacre de la carapace.",
        amour: "Aimer, c'est comme nager côte à côte dans le vaste bleu : sans entraves, guidés par la même constellation.",
      };
      const pearl = samplePearls[theme] || FALLBACK_WISDOMS[0];
      return res.json({ pearl });
    }
  } catch {
    return res.json({ pearl: FALLBACK_WISDOMS[0] });
  }
});

// 3. Nocturnal ocean tale / parable
app.post('/api/turtle/tale', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const prompt = title 
      ? `Raconte un court conte initiatique ou une parabole poétique (environ 150-200 mots) intitulée ou inspirée par "${title}", que tu racontes sous les étoiles aux voyageurs nocturnes.`
      : `Raconte un court conte initiatique marin et nocturne (environ 150-200 mots) sur les secrets de l'océan, la lumière cachée ou le voyage des étoiles, pour apaiser une âme en quête de paix.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: TURTLE_SYSTEM_INSTRUCTION,
          temperature: 0.85,
        },
      });
      return res.json({ tale: response.text?.trim() });
    } else {
      const defaultTale = `Il y a bien des siècles, un jeune coquillage pleurait au fond du lagon parce qu'un grain de sable rugueux s'était logé dans sa chair tendre. Il se plaignait sans cesse auprès des marées : "Pourquoi cette blessure ? Pourquoi ce caillou dans mon repos ?"\n\nJe lui ai dit alors : "Ne le repousse pas avec colère, enveloppe-le de douceur à chaque lever d'étoiles."\n\nDes lunes passèrent. Le coquillage cessa de se débattre et baigna sa blessure de sa propre nacre translucide. Quand un plongeur ouvrit un jour sa coquille, il n'y trouva aucune douleur : seulement une perle lumineuse d'une éclatante pureté.\n\nCe qui te blesse aujourd'hui, voyageur de la nuit, n'est peut-être que la semence de ta future perle. Sois patient avec toi-même.`;
      return res.json({ tale: defaultTale });
    }
  } catch {
    return res.json({
      tale: "L'océan garde le silence ce soir, mais souviens-toi : chaque vague qui se retire prépare le souffle de la suivante.",
    });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
