export interface SceneTiming {
    index: number;
    startFrame: number;
    durationInFrames: number;
    endFrame: number;
}

export class SyncEngine {
    static readonly FPS = 30;
    static readonly INTRO_SECONDS = 3;
    static readonly OUTRO_SECONDS = 3;
    static readonly SCENE_PAUSE_SECONDS = 0.0; // Rapid-fire transitions for news style
    static readonly TITLE_CARD_SECONDS = 3.0; 
    static readonly WORDS_PER_SECOND = 2.5;

    /**
     * Estimates duration in seconds based on word count.
     * ONLY use this for placeholders in Phase 1/2 before audio is generated.
     */
    static estimateDuration(text: string, speed: number = 1.0): number {
        if (!text || !text.trim()) return 3;
        const wordCount = text.trim().split(/\s+/).length;
        const baseEstimation = Math.max(2, wordCount / this.WORDS_PER_SECOND);
        const estimation = baseEstimation / speed;
        console.debug(`[SyncEngine] Estimated duration for text: ${estimation.toFixed(2)}s (${wordCount} words) at ${speed}x`);
        return estimation;
    }

    /**
     * Converts seconds to exact frames at established FPS.
     * This is the authoritative way to define clip lengths.
     */
    static secondsToFrames(seconds: number): number {
        return Math.round(seconds * this.FPS);
    }

    /**
     * Gets absolute start frame for the content (after intro).
     */
    static getIntroFrames(): number {
        return Math.round(this.INTRO_SECONDS * this.FPS);
    }

    /**
     * Gets absolute frames for the outro.
     */
    static getOutroFrames(): number {
        return Math.round(this.OUTRO_SECONDS * this.FPS);
    }

    /**
     * Calculates timings for a list of scenes to ensure no gaps except natural pauses.
     * Authority: This uses the duration property which MUST be the real 
     * audio duration once audio has been generated.
     */
    static calculateTimings(scenes: { duration?: number, titleCardEnabled?: boolean }[]): SceneTiming[] {
        const introFrames = this.getIntroFrames();
        const pauseFrames = this.secondsToFrames(this.SCENE_PAUSE_SECONDS);
        const titleCardFrames = this.secondsToFrames(this.TITLE_CARD_SECONDS);
        let currentOffset = introFrames;

        return scenes.map((scene, index) => {
            // News Title Card logic: If enabled, it PUSHES the narration forward by 5s
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

    /**
     * Gets the total duration for the entire project
     * based on scenes (used for initial layout)
     */
    static getTotalDurationInFrames(scenes: { duration?: number }[]): number {
        const timings = this.calculateTimings(scenes);
        if (timings.length === 0) return this.getIntroFrames() + this.getOutroFrames();
        return timings[timings.length - 1].endFrame + this.getOutroFrames();
    }

    /**
     * Gets total duration based on actual clips (used for manual NLE)
     */
    static getClipsDurationInFrames(layers: { clips: { startFrame: number, durationInFrames: number }[] }[]): number {
        let maxFrame = 0;
        layers.forEach(layer => {
            layer.clips.forEach(clip => {
                const end = clip.startFrame + clip.durationInFrames;
                if (end > maxFrame) maxFrame = end;
            });
        });
        // We always want at least the outro buffer if it's auto-generated, 
        // but for manual NLE we just follow the max clip end or add a small buffer.
        return Math.max(maxFrame, this.getIntroFrames() + this.getOutroFrames());
    }
}
