// Captures the hero posters: stills of the 3D desk shown instantly while the live scene loads.
//   public/images/desk-poster.webp         (desktop framing)
//   public/images/desk-poster-mobile.webp  (phone framing)
// Re-run after changing the scene:
//   1. npm run build, then start the production server on port 3100
//   2. npm i --no-save puppeteer-core
//   3. node scripts/capture-desk-poster.mjs
import sharp from "sharp";
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-first-run"],
});

async function capture({ width, height, scale, out, resize }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
  // Wait until the live 3D scene has replaced the poster
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#top img")).opacity === "0", { timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000)); // let the camera settle
  // Only the scene, on a transparent page, so the poster blends with the background
  await page.addStyleTag({ content: "html,body{background:transparent!important} #top>div:not(:first-child){visibility:hidden!important}" });
  await page.evaluate(() => document.querySelectorAll("body > :not(main)").forEach((el) => el.remove()));
  await new Promise((r) => setTimeout(r, 300));
  const png = await page.screenshot({ clip: { x: 0, y: 0, width, height }, omitBackground: true });
  const info = await sharp(png).resize(resize).webp({ quality: 72, alphaQuality: 80 }).toFile(out);
  console.log(out, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
  await page.close();
}

await capture({ width: 1440, height: 900, scale: 1.25, out: "public/images/desk-poster.webp", resize: 1800 });
await capture({ width: 390, height: 844, scale: 2, out: "public/images/desk-poster-mobile.webp", resize: 780 });
await browser.close();
