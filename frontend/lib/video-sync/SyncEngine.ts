export interface SceneTiming {
    index: number;
    startFrame: number;
    durationInFrames: number;
    endFrame: number;
}

export class SyncEngine {
    static readonly FPS = 30;
    static readonly INTRO_SECONDS = 6;
    static readonly OUTRO_SECONDS = 15;
    static readonly SCENE_PAUSE_SECONDS = 0.0;
    static readonly TITLE_CARD_SECONDS = 5.0; 
    static readonly WORDS_PER_SECOND = 2.5;

    static estimateDuration(text: string, speed: number = 1.0): number {
        if (!text || !text.trim()) return 3;
        const wordCount = text.trim().split(/\s+/).length;
        const baseEstimation = Math.max(2, wordCount / this.WORDS_PER_SECOND);
        const estimation = baseEstimation / speed;
        console.debug(`[SyncEngine] Estimated duration for text: ${estimation.toFixed(2)}s (${wordCount} words) at ${speed}x`);
        return estimation;
    }

    static secondsToFrames(seconds: number): number {
        return Math.round(seconds * this.FPS);
    }

    static getIntroFrames(): number {
        return Math.round(this.INTRO_SECONDS * this.FPS);
    }

    static getOutroFrames(): number {
        return Math.round(this.OUTRO_SECONDS * this.FPS);
    }

    static calculateTimings(scenes: { duration?: number, titleCardEnabled?: boolean }[]): SceneTiming[] {
        return this.calculateTimingsCustom(scenes, this.INTRO_SECONDS, this.TITLE_CARD_SECONDS);
    }

    static calculateTimingsCustom(
        scenes: { duration?: number, titleCardEnabled?: boolean }[],
        introDurationSec: number = this.INTRO_SECONDS,
        newsCardDurationSec: number = this.TITLE_CARD_SECONDS
    ): SceneTiming[] {
        const introFrames = Math.round(introDurationSec * this.FPS);
        const titleCardFrames = Math.round(newsCardDurationSec * this.FPS);
        const pauseFrames = this.secondsToFrames(this.SCENE_PAUSE_SECONDS);
        let currentOffset = introFrames;

        return scenes.map((scene, index) => {
            const preOffset = scene.titleCardEnabled ? titleCardFrames : 0;
            currentOffset += preOffset;

            const durationInFrames = this.secondsToFrames(scene.duration || 3);
            const timing: SceneTiming = {
                index,
                startFrame: currentOffset,
                durationInFrames,
                endFrame: currentOffset + durationInFrames
            };
            
            currentOffset += durationInFrames + pauseFrames;
            return timing;
        });
    }

    static getTotalDurationInFrames(scenes: { duration?: number }[]): number {
        const timings = this.calculateTimings(scenes);
        if (timings.length === 0) return this.getIntroFrames() + this.getOutroFrames();
        return timings[timings.length - 1].endFrame + this.getOutroFrames();
    }

    static getClipsDurationInFrames(layers: { clips: { startFrame: number, durationInFrames: number }[] }[]): number {
        let maxFrame = 0;
        layers.forEach(layer => {
            layer.clips.forEach(clip => {
                const end = clip.startFrame + clip.durationInFrames;
                if (end > maxFrame) maxFrame = end;
            });
        });
        return Math.max(maxFrame, this.getIntroFrames() + this.getOutroFrames());
    }
}
