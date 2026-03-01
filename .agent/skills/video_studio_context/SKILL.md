---
name: Video Studio Architecture
description: Context and architecture of the HostingArena Video Studio, covering the 3-Phase workflow, NLE (Non-Linear Editor) pipeline, Remotion rendering, Zustand state management, and CORS audio proxying.
---

# Video Studio Architecture & Context

This skill serves as the central knowledge hub for the HostingArena Video Studio. It documents the core components, data flow, and state management patterns used to build the web-based Non-Linear Editor (NLE) and video renderer using Remotion.

## Core Concepts

The Video Studio is divided into two primary environments:

1. **The Interactive UI (Next.js/React):** Where the user selects voices, music, edits clips, and previews the video.
2. **The Render Engine (Remotion):** A headless environment (`/api/admin/video/render/route.ts`) that takes a declarative state (Layers and Clips) and generates the final MP4 video via `@remotion/bundler` and `@remotion/renderer`.

### The 3-Phase Workflow

The studio workflow separates "Content" from "Technical Visuals" for better user focus:

1. **Phase 1 (Preparation):** Automation ingestion. Scripts and initial scenes are generated or loaded.
2. **Phase 2 (Creative Simplification):** Focuses strictly on the **Script**, **Voice Selection**, and **Background Music**. 
   - Uses `Phase2Creative.tsx`.
   - `prepareAssemblyData()` acts as the bridge here. It generates TTS through the edge API, calculates word timestamps, and translates scenes into an initial formal NLE timeline (Layers of Clips).
3. **Phase 3 (Advanced NLE):** The technical visual editor (`Phase3Editor.tsx`).
   - A multi-layer system where the user visually edits boundaries (`startFrame`, `durationInFrames`) and properties (effects, opacity).
   - Syncs React UI playback state with the Remotion player.
   - Includes Auto-Save to `localStorage` (debounced).

## Key Files & Responsibilities

### State Management (Zustand)
- **`frontend/store/useStudioStore.ts`**: The atomic store powering Phase 3. 
  - *Why not Context?* React Context triggers global re-renders for every subscriber on any state change. With 30 FPS playback, this caused infinite loops ("Maximum update depth exceeded"). Zustand allows component subscriptions to specific slices of state (e.g., `currentTime` or `selectedClipId`), heavily decoupling the Canvas, Timeline, and Player components.
  - Implements History (Undo/Redo logic).
- **`frontend/contexts/VideoStudioContext.tsx`**: Legacy monolithic store handling Phases 1 and 2, and the heavy lifting of `prepareAssemblyData()`. Hydrates `useStudioStore` before transitioning to Phase 3.

### Rendering Engine (Remotion)
- **`frontend/components/video/Composition.tsx`**: The main Remotion component. It maps the Zustand `layers` state into Remotion components (`<Sequence>`, `<Audio>`, `<Video>`, etc.).
  - **Crucial Helpers:**
    - `resolveAsset(url, baseUrl)`: Ensures local files are wrapped in `staticFile()`. Proxies external URLs (Critical for CORS).
    - `renderLayers()`: Iterates through tracks (Visual, Narration, Music, SFX). Ensures correct `z-index` layering dynamically.
    - Ducking Engine: Uses `useCurrentFrame()` to calculate if a voice layer is active, dynamically lowering music volume.
  
### The Editor UI (Phase 3)
- **`frontend/components/video/studio/Phase3Editor.tsx`**: The NLE view. It mounts the `TimelineContainer` and `CanvasEditor`. Listens to `useStudioStore` mutations. Serializes the store to `localStorage` as a draft safely to avoid data loss on refresh.
- **`frontend/components/video/VideoPlayer.tsx`**: Syncs visually with the `@remotion/player`. 
  - *Master/Slave Sync Fix:* To avoid recursive loops between UI Scrubbing and Player Playing, it uses directional logic. When playing -> Player updates UI. When scrubbing -> UI updates Player.

### Asset Proxying (`api/proxy/route.ts`)
- **The Problem:** Remotion's Headless render strictly blocks `http` access to cross-origin resources (like Jamendo MP3 files) due to CORS security inside Chromium.
- **The Solution:** We stream audio through a middleman GET proxy (`/api/proxy?url=...`) attaching `Access-Control-Allow-Origin: *`.
- **Absolute URLs:** In the backend headless render, relative URLs (like `/api/proxy`) fail. `route.ts` derives the server's absolute protocol/host and passes it to `Composition.tsx` as `baseUrl`, enforcing completely absolute endpoints during `renderMedia()`. With this proxy, `useWebAudioApi={true}` is safe.

## Common Gotchas & Rules

1. **Absolute vs Relative Paths:** The browser `VideoPlayer` and the backend `Remotion Render` handle paths differently. Always use `resolveAsset()` in `Composition.tsx`.
2. **Master/Slave Updates:** If you need to make changes to how the timeline plays back, remember the dual nature of state. Mutate the Remotion Player state with `playerRef.current?.seekTo()` when the user drags, but read via `playerRef.current?.getCurrentFrame()` in an interval loop to update a UI slider (or write to the atomic `useStudioStore`).
3. **Synchronization Logic (The Stuttering Bug):** In local React dev environments, the `<Player>` drops slightly below the target 30 FPS. If `acceptableTimeShiftInSeconds` is low on `<Audio>`, Remotion forces audio backward, creating aggressive stutter loops. 
    - **CRITICAL:** Set `acceptableTimeShiftInSeconds={0.5}` inside `Composition.tsx` for precise sync in production. Ensure the timeline does not loop backwards internally.
4. **Z-Index Layering:** When adding a new AbsoluteFill, do not hardcode its z-index unless it is explicitly `-1` or `-2` (like a fallback background). Iterating layers must assign an ascending `z-index` natively based on its layer array index: `zIndex: lIdx`.
5. **The Edge TTS Duration Quirk (CRITICAL):**
    - `msedge-tts` injects variable "dead air" trailing silence at the end of the voiceover buffer.
    - `ffprobe` will report a physical duration longer than the actual spoken words.
    - **The Only Truth:** The exact length of a clip comes from capturing the trailing edge of the last text item in `WordBoundaries`.
    - **Formula:** Microsoft uses Ticks. `seconds = Ticks / 10,000,000`.
    - **Implementation:** `api/admin/video/voice/route.ts` extracts the `duration` logically from the word offset + 0.1s padding. `Composition.tsx` must use `endAt={exactDuration}` in `<Audio>` to mechanically guillotine the trailing physical silence and keep visuals synced. 
6. **No Placeholder Mutations:** Never mutate `layers` or `clips` directly via JS array operations. Use `useStudioStore` actions (`updateClip`, `addLayer`, `pushToHistory`) to trigger safe React re-renders and push to the undo/redo stack properly.
