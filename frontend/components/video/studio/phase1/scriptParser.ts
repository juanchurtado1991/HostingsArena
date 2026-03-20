import { SyncEngine } from '@/lib/video-sync/SyncEngine';

type TransitionType = 'crossfade' | 'zoom' | 'none';
const validTransitions: TransitionType[] = ['crossfade', 'zoom', 'none'];

export interface ParsedScene {
    speech: string;
    visual: string;
    headline?: string;
    subHeadline?: string;
    displayHeadline?: string;
    pexelsQuery?: string;
    transition: TransitionType;
    duration: number;
}

const calcDuration = (speech: string): number => SyncEngine.estimateDuration(speech);

const extractField = (block: string, field: string, fallback?: string): string | undefined => {
    const match = new RegExp(`\\[${field}:\\s*(.*?)\\]`, 'i').exec(block);
    return match ? match[1].trim() : fallback;
};

const extractTransition = (block: string): TransitionType => {
    const t = extractField(block, 'Transition', 'crossfade')?.toLowerCase().trim() || 'crossfade';
    return validTransitions.includes(t as TransitionType) ? (t as TransitionType) : 'crossfade';
};

const cleanSpeech = (block: string): string => {
    return block
        .replace(/\[.*?\]/g, '')
        .replace(/^(speech|script):\s*/i, '')
        .replace(/\n(speech|script):\s*/gi, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export function parseScript(text: string, videoFormat: string = '16:9'): ParsedScene[] {
    const sceneRegex = /\[Visual:\s*(.*?)\]/gi;
    const visualMatches = [...text.matchAll(sceneRegex)];

    let parsedScenes: ParsedScene[] = [];

    if (visualMatches.length >= 1) {
        visualMatches.forEach((match, i) => {
            const visual = match[1];
            const nextMatchIndex = visualMatches[i + 1]?.index || text.length;
            const fullBlock = text.substring(match.index!, nextMatchIndex);

            const speech = cleanSpeech(fullBlock);
            if (speech && speech.length > 10) {
                parsedScenes.push({
                    speech, visual,
                    headline: extractField(fullBlock, 'Headline'),
                    subHeadline: extractField(fullBlock, 'Subheadline'),
                    displayHeadline: extractField(fullBlock, 'DisplayHeadline'),
                    pexelsQuery: extractField(fullBlock, 'PexelsQuery'),
                    transition: extractTransition(fullBlock),
                    duration: calcDuration(speech),
                });
            }
        });
    }

    if (parsedScenes.length < 1) {
        parsedScenes = [];
        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);

        if (paragraphs.length >= 2) {
            paragraphs.forEach(para => {
                const visual = extractField(para, 'Visual', 'Dynamic technology news visualization')!;
                const speech = cleanSpeech(para);
                if (speech && speech.length > 10) {
                    parsedScenes.push({ speech, visual, transition: extractTransition(para), duration: calcDuration(speech) });
                }
            });
        } else {
            const allText = cleanSpeech(text);
            const sentences = allText.split(/(?<=[.!?])\s+/).filter(s => s.length > 5);
            const SENTENCES_PER_SCENE = 4;
            for (let i = 0; i < sentences.length; i += SENTENCES_PER_SCENE) {
                const chunk = sentences.slice(i, i + SENTENCES_PER_SCENE).join(' ');
                parsedScenes.push({ speech: chunk, visual: "Technology news background, cinematic lighting", transition: i === 0 ? 'none' : 'crossfade', duration: calcDuration(chunk) });
            }
        }
    }

    const MAX_WORDS_PER_SCENE = 400;
    const finalScenes: ParsedScene[] = [];
    const seenSentences = new Set<string>();

    for (const scene of parsedScenes) {
        const speech = scene.speech.trim();
        const sentenceKey = speech.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 100);
        if (seenSentences.has(sentenceKey)) continue;
        seenSentences.add(sentenceKey);

        const wordCount = speech.split(/\s+/).length;
        if (wordCount > MAX_WORDS_PER_SCENE) {
            const sentences = speech.split(/(?<=[.!?])\s+/);
            let currentChunk: string[] = [];
            let currentWords = 0;

            sentences.forEach((sentence, idx) => {
                currentChunk.push(sentence);
                currentWords += sentence.split(/\s+/).length;
                if (currentWords >= 120 || idx === sentences.length - 1) {
                    const chunkSpeech = currentChunk.join(' ');
                    finalScenes.push({ speech: chunkSpeech, visual: scene.visual, transition: finalScenes.length === 0 ? scene.transition : 'crossfade', duration: calcDuration(chunkSpeech) });
                    currentChunk = [];
                    currentWords = 0;
                }
            });
        } else {
            finalScenes.push(scene);
        }
    }

    if (finalScenes.length === 0) {
        const speech = cleanSpeech(text);
        if (speech.length > 0) return [{ speech, visual: "Dynamic News Visualization", transition: 'none' as const, duration: calcDuration(speech) }];
        return [];
    }

    const isShort = videoFormat === '9:16';
    const MAX_TOTAL_SECONDS = isShort ? 75 : 1200;
    const totalDuration = finalScenes.reduce((sum, s) => sum + (s.duration || 10), 0);
    if (totalDuration > MAX_TOTAL_SECONDS) {
        const scale = MAX_TOTAL_SECONDS / totalDuration;
        finalScenes.forEach(s => { s.duration = Math.max(3, Math.round((s.duration || 10) * scale)); });
    }

    return finalScenes;
}
