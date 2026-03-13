const { bundle } = require("@remotion/bundler");
const path = require("path");
const fs = require("fs");

async function run() {
  console.log("🚀 Pre-bundling Video Studio template...");
  
  const entryPoint = path.join(process.cwd(), "components/video/entry.ts");
  // Save to public folder so it's accessible as a static asset
  const bundleLocation = path.join(process.cwd(), "public", "video-bundle.js");
  
  try {
    const result = await bundle({
      entryPoint,
      publicDir: path.join(process.cwd(), "public"),
      // Use production settings for the bundle
      enableFastRefresh: false,
    });
    
    console.log("📦 Bundler returned path:", result);
    const bundleDest = path.join(process.cwd(), "public", "video-bundle");
    
    // Recursive copy function
    function copyDir(src, dest) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.writeFileSync(destPath, fs.readFileSync(srcPath));
        }
      }
    }

    if (fs.existsSync(bundleDest)) {
        // Clean old bundle
        fs.rmSync(bundleDest, { recursive: true, force: true });
    }
    
    copyDir(result, bundleDest);
    console.log("✅ Video bundle directory created at:", bundleDest);

    // --- Post-processing index.html ---
    const indexPath = path.join(bundleDest, "index.html");
    if (fs.existsSync(indexPath)) {
      console.log("🛠 Post-processing index.html to use relative paths...");
      let html = fs.readFileSync(indexPath, "utf8");
      
      // Replace src="/bundle.js" with src="./bundle.js"
      // Replace href="/bundle.css" with href="./bundle.css"
      // Also handles double quotes and potential other assets starting with /
      html = html.replace(/(src|href)="\/([^"]+)"/g, '$1="./$2"');
      
      fs.writeFileSync(indexPath, html);
      console.log("✨ Successfully patched index.html for subdirectory support.");
    }
  } catch (error) {
    console.error("❌ Failed to bundle video:", error);
    process.exit(1);
  }
}

run();
