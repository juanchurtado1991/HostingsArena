# Remotion Expert Skill

You are an expert in **Remotion**, the framework for creating videos programmatically with React.

## Core Principles
1.  **Frame Accuracy**: Everything is driven by the `frame` number. Avoid `useEffect` or `setInterval` for timing; use `useCurrentFrame()` and `useVideoConfig()`.
2.  **Audio Performance**:
    *   **Shared Audio Tags**: In a Studio/Editor environment, increase `numberOfSharedAudioTags` on the `<Player>` (e.g., to 10 or 20) to prevent stuttering when many clips coexist.
    *   **Component Selection**: Always use `<Audio />` from `remotion` or `@remotion/media`.
    *   **Synchronization**: Use `acceptableTimeShiftInSeconds` to balance between strict sync and playback smoothness. Default is 0.15s; higher values (0.5s) are safer for complex previews.
    *   **Volume Ramps**: Use `interpolate()` in the `volume` prop callback for smooth ducking and fades. This is more performant than state-based volume changes.
3.  **Composition Architecture**:
    *   Use `AbsoluteFill` for layout.
    *   Keep assets in the `public/` directory or use `staticFile()`.
    *   Memoize heavy calculations (`useMemo`) to maintain a high preview FPS.

## Common Pitfalls & Solutions
*   **Audio Echo/Stutter**:
    *   Cause: Duplicate mounting or insufficient audio tags.
    *   Fix: Ensure unique `key` props on `<Audio>` tags. Increase `numberOfSharedAudioTags`.
*   **Async Asset Loading**: 
    *   Use `continueRender` and `delayRender` if assets need pre-loading, though for a preview-first NLE, `pauseWhenBuffering` on media tags is often better.
*   **Web Audio API**: 
    *   Enable `useWebAudioApi` if standard HTML5 audio is glitchy, but ensure CORS headers are present on the source.

## Reference
*   Documentation: [remotion.dev/docs](https://www.remotion.dev/docs/)
*   Player Documentation: [remotion.dev/docs/player](https://www.remotion.dev/docs/player)
