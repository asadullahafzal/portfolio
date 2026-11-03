import * as THREE from "three";

// The curved monitor's screen: a code editor drawn on a <canvas>, used as a texture.
// `typeTo(n)` reveals the first n characters of the code, so the editor appears to type.

const W = 1280;
const H = 560;

const CODE = `// src/data/profile.ts
export const profile = {
  name: "Asadullah Afzal",
  roles: ["Full-Stack Engineer", "SEO Expert", "AI Educator"],
  stack: ["Next.js", "Node.js", "MongoDB", "PostgreSQL"],
  shipping: ["CPC Point", "The Dollar Tech", "Query Finder"],
  trained: "200+ people in AI",
  status: "open to work",
};
`;

const C = {
  bg: "#1a1816",
  chrome: "#141311",
  sidebar: "#171513",
  line: "#2a2724",
  text: "#e6e3db",
  dim: "#7c776d",
  comment: "#6f6a60",
  keyword: "#f2a33a",
  string: "#b8c98d",
  prop: "#e6e3db",
  punct: "#8f8a7e",
  accent: "#f2a33a",
};

const FONT = '26px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

// Tiny tokenizer: enough to colour this one snippet like an editor would
function tokens(line: string): { text: string; color: string }[] {
  if (line.trimStart().startsWith("//")) return [{ text: line, color: C.comment }];
  const out: { text: string; color: string }[] = [];
  const re = /("[^"]*"?)|\b(export|const)\b|(\b\w+)(?=:)|([{}[\](),:;=])|(\s+)|([^\s"{}[\](),:;=]+)/g;
  for (const m of line.matchAll(re)) {
    const [t, str, kw, prop, punct] = m;
    out.push({ text: t, color: str ? C.string : kw ? C.keyword : prop ? C.prop : punct ? C.punct : C.text });
  }
  return out;
}

export function createScreen() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  // The screen is the inside of a curved surface; mirror so text reads correctly
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.offset.x = 1;

  const files = ["app", "components", "data", "  profile.ts", "lib", "public"];

  function drawChrome() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    // Title bar
    ctx.fillStyle = C.chrome;
    ctx.fillRect(0, 0, W, 34);
    ["#e0675a", "#e6b04b", "#7fb77e"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(22 + i * 20, 17, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = '15px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = C.dim;
    ctx.textAlign = "center";
    ctx.fillText("asadullahafzal.com — portfolio", W / 2, 22);
    ctx.textAlign = "left";
    // Sidebar
    ctx.fillStyle = C.sidebar;
    ctx.fillRect(0, 34, 180, H - 34 - 26);
    ctx.font = '13px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = C.dim;
    ctx.fillText("EXPLORER", 20, 62);
    ctx.font = '20px ui-monospace, Menlo, Consolas, monospace';
    files.forEach((f, i) => {
      const active = f.trim() === "profile.ts";
      if (active) {
        ctx.fillStyle = "rgba(242,163,58,0.12)";
        ctx.fillRect(0, 78 + i * 36, 180, 32);
      }
      ctx.fillStyle = active ? C.text : C.dim;
      ctx.fillText(f, 18, 100 + i * 36);
    });
    // Tab
    ctx.fillStyle = C.chrome;
    ctx.fillRect(180, 34, W - 180, 44);
    ctx.fillStyle = C.bg;
    ctx.fillRect(180, 34, 190, 44);
    ctx.fillStyle = C.accent;
    ctx.fillRect(180, 34, 190, 3);
    ctx.fillStyle = C.text;
    ctx.font = '20px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillText("profile.ts", 200, 63);
    // Status bar
    ctx.fillStyle = C.accent;
    ctx.fillRect(0, H - 26, W, 26);
    ctx.font = '14px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = "#1a1816";
    ctx.fillText("main  ·  TypeScript  ·  Next.js 16", 16, H - 8);
    ctx.textAlign = "right";
    ctx.fillText("build passing", W - 16, H - 8);
    ctx.textAlign = "left";
  }

  let shown = -1;
  function typeTo(n: number, cursorOn: boolean) {
    const count = Math.min(n, CODE.length);
    drawChrome();
    ctx.font = FONT;
    const visible = CODE.slice(0, count);
    const lines = visible.split("\n");
    const x0 = 250;
    const y0 = 122;
    const lh = 42;
    lines.forEach((line, i) => {
      const y = y0 + i * lh;
      ctx.fillStyle = C.dim;
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), x0 - 22, y);
      ctx.textAlign = "left";
      let x = x0;
      for (const t of tokens(line)) {
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, x, y);
        x += ctx.measureText(t.text).width;
      }
      if (i === lines.length - 1 && cursorOn) {
        ctx.fillStyle = C.accent;
        ctx.fillRect(x + 3, y - 24, 13, 30);
      }
    });
    texture.needsUpdate = true;
    shown = count;
  }

  typeTo(0, true);
  return { texture, typeTo, total: CODE.length, get shown() { return shown; }, dispose: () => texture.dispose() };
}
