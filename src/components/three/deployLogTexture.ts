import * as THREE from "three";

// The vertical monitor: a portrait terminal replaying this site's real deploy
// (deploy/deploy.sh), line by line, on a loop.

const W = 600;
const H = 1040;

const LOG: [string, string][] = [
  ["$ ssh portfolio-vps", "#e9e6ff"],
  ["$ bash deploy/deploy.sh", "#e9e6ff"],
  ["==> Pulling latest code", "#c084fc"],
  ["    Fast-forward main", "#8a86a8"],
  ["==> Installing dependencies", "#c084fc"],
  ["    dependencies installed", "#8a86a8"],
  ["==> Building", "#c084fc"],
  ["    Compiled successfully", "#34d3b0"],
  ["    static pages generated", "#8a86a8"],
  ["==> Assembling release", "#c084fc"],
  ["==> Switching to new release", "#c084fc"],
  ["==> Checking the site responds", "#c084fc"],
  ["    HTTP 200 in 10 ms", "#34d3b0"],
  ["Live: asadullahafzal.com", "#34d3b0"],
  ["", "#8a86a8"],
  ["$ lighthouse --mobile", "#e9e6ff"],
  ["  SEO              100", "#34d3b0"],
  ["  Accessibility    100", "#34d3b0"],
  ["  Best practices   100", "#34d3b0"],
];

export function createDeployLog({ flipY = false }: { flipY?: boolean } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = flipY;
  texture.anisotropy = 4;

  let shown = -1;
  function show(lines: number, cursorOn: boolean) {
    const n = Math.min(lines, LOG.length);
    ctx.fillStyle = "#090718";
    ctx.fillRect(0, 0, W, H);
    // Title bar
    ctx.fillStyle = "#120e2a";
    ctx.fillRect(0, 0, W, 54);
    ["#e0675a", "#e6b04b", "#7fb77e"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(28 + i * 26, 27, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = '20px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = "#8a86a8";
    ctx.textAlign = "center";
    ctx.fillText("deploy — zsh", W / 2 + 30, 34);
    ctx.textAlign = "left";

    ctx.font = '23px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    for (let i = 0; i < n; i++) {
      const [text, color] = LOG[i];
      ctx.fillStyle = color;
      ctx.fillText(text, 26, 104 + i * 47);
    }
    if (cursorOn) {
      ctx.fillStyle = "#915eff";
      ctx.fillRect(26, 104 + n * 47 - 22, 13, 28);
    }
    texture.needsUpdate = true;
    shown = n;
  }

  show(LOG.length, true);
  return { texture, show, total: LOG.length, get shown() { return shown; }, dispose: () => texture.dispose() };
}
