/**
 * cleanup-temp.js — Runs before `next dev` to clear temporary Video Studio files.
 * 
 * Clears:  public/temp/*,  public/uploads/*,  public/voices/*.webm,  public/voices/voice_temp_*
 * Keeps:   public/voices/previews/*  (permanent, committed to repo)
 */
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');

const DIRS_TO_CLEAR = ['temp', 'uploads'];

let deleted = 0;

// 1. Clear temp and uploads completely
for (const dir of DIRS_TO_CLEAR) {
    const target = path.join(PUBLIC, dir);
    if (!fs.existsSync(target)) continue;
    for (const item of fs.readdirSync(target)) {
        const itemPath = path.join(target, item);
        try {
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                fs.rmSync(itemPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(itemPath);
            }
            deleted++;
        } catch (e) { /* skip */ }
    }
}

// 2. Clear old narrations in public/voices/ (but NOT the previews subfolder)
const voicesDir = path.join(PUBLIC, 'voices');
if (fs.existsSync(voicesDir)) {
    for (const item of fs.readdirSync(voicesDir)) {
        if (item === 'previews') continue; // never touch previews
        const itemPath = path.join(voicesDir, item);
        try {
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                fs.rmSync(itemPath, { recursive: true, force: true });
            } else if (item.endsWith('.webm')) {
                fs.unlinkSync(itemPath);
            }
            deleted++;
        } catch (e) { /* skip */ }
    }
}

console.log(`🧹 Video Studio cleanup: ${deleted} temp files/dirs removed.`);
