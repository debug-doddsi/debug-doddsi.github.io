import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
await page.goto("http://localhost:5187/", { waitUntil: "networkidle" });

await page.getByRole("button", { name: "Case Studies", exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "C:/tmp/casestudies2.png", fullPage: true });

await page.getByRole("button", { name: "Read case study" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: "C:/tmp/persevere.png", fullPage: true });

await page.getByRole("button", { name: "Back to Case Studies" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "C:/tmp/casestudies3.png", fullPage: true });

await browser.close();
console.log("done");
