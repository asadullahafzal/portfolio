// Captures public/images/desk-poster.webp: a still of the 3D desk shown instantly while
// the live scene loads. Re-run after changing the scene:
//   1. npm run build && start the production server on port 3100
//   2. npm i --no-save puppeteer-core
//   3. node scripts/capture-desk-poster.mjs
import sharp from "sharp";
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-first-run"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
// Wait until the live 3D scene has replaced the poster
await page.waitForFunction(() => getComputedStyle(document.querySelector("#top img")).opacity === "0" && document.querySelector("#top canvas"), { timeout: 30000 });
await new Promise((r) => setTimeout(r, 2500)); // let the camera settle
// Hide everything but the scene, with a transparent page, so the poster blends in
await page.addStyleTag({ content: "html,body{background:transparent!important} #top>div:first-child,#top>div:last-child{visibility:hidden!important}" });
await page.evaluate(() => document.querySelectorAll("body > :not(main)").forEach((el) => el.remove()));
await new Promise((r) => setTimeout(r, 300));
const box = await page.evaluate(() => {
  const r = document.querySelector("#top canvas").parentElement.getBoundingClientRect();
  return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height };
});
const png = await page.screenshot({ clip: box, omitBackground: true });
await sharp(png).resize(1600).webp({ quality: 70, alphaQuality: 80 }).toFile("public/images/desk-poster.webp");
console.log("captured", JSON.stringify(box));
await browser.close();
