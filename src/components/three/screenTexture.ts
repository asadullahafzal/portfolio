import * as THREE from "three";

// The curved monitor's screen: a code editor drawn on a <canvas>, used as a texture.
// `typeTo(n)` reveals the first n characters of the code, so the editor appears to type.


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
  bg: "#0d0b1f",
  chrome: "#090718",
  sidebar: "#0b091c",
  line: "#1d1838",
  text: "#e9e6ff",
  dim: "#6f6a96",
  comment: "#5f5a84",
  keyword: "#c084fc",
  string: "#34d3b0",
  prop: "#93c5fd",
  punct: "#8a86a8",
  accent: "#915eff",
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

type ScreenOptions = {
  /** Flip horizontally (for meshes with mirrored UVs) */
  mirror?: boolean;
  /** glTF models expect textures with flipY = false */
  flipY?: boolean;
  width?: number;
  height?: number;
};

export function createScreen({ mirror = false, flipY = true, width: W = 1280, height: H = 560 }: ScreenOptions = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.flipY = flipY;
  // Some screen meshes have mirrored UVs; flip so the text reads correctly
  if (mirror) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }

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
        ctx.fillStyle = "rgba(145,94,255,0.18)";
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
    ctx.fillStyle = "#ffffff";
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
    // Terminal panel under the editor when the screen has room for it
    if (H > 620) {
      const top = H - 26 - 150;
      ctx.fillStyle = C.chrome;
      ctx.fillRect(180, top, W - 180, 150);
      ctx.fillStyle = C.line;
      ctx.fillRect(180, top, W - 180, 2);
      ctx.font = '17px ui-monospace, Menlo, Consolas, monospace';
      ctx.fillStyle = C.dim;
      ctx.fillText("TERMINAL", 200, top + 30);
      const lines = [
        ["$ npm run build", C.text],
        ["Compiled successfully. Static pages generated", C.string],
        ["$ bash deploy/deploy.sh  ->  Live on asadullahafzal.com", C.text],
      ];
      lines.forEach(([t, c], i) => {
        ctx.fillStyle = c;
        ctx.fillText(t, 200, top + 66 + i * 30);
      });
    }
    texture.needsUpdate = true;
    shown = count;
  }

  typeTo(0, true);
  return { texture, typeTo, total: CODE.length, get shown() { return shown; }, dispose: () => texture.dispose() };
}
