import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const targetUrl = process.env.KONKIUM_URL || "http://127.0.0.1:5173/";
const port = Number(process.env.KONKIUM_CDP_PORT || 9340);
const outDir = path.resolve("output/chrome-checks");

const viewports = [
  { label: "mobile-390", width: 390, height: 844, mobile: true },
  { label: "tablet-768", width: 768, height: 1024, mobile: true },
  { label: "desktop-1440", width: 1440, height: 1000, mobile: false },
];

await mkdir(outDir, { recursive: true });

const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/konkium-chrome-profile-${port}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForChrome() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      // Keep waiting until Chrome opens the debugging port.
    }
    await sleep(200);
  }
  throw new Error("Chrome debugging endpoint did not start");
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const events = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      return;
    }
    if (msg.method) events.push(msg);
  };

  return new Promise((resolve, reject) => {
    ws.onopen = () =>
      resolve({
        events,
        send(method, params = {}) {
          const callId = ++id;
          ws.send(JSON.stringify({ id: callId, method, params }));
          return new Promise((resolve, reject) =>
            pending.set(callId, { resolve, reject }),
          );
        },
        close() {
          ws.close();
        },
      });
    ws.onerror = reject;
  });
}

async function inspectViewport(vp) {
  const targetRes = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  );
  const target = await targetRes.json();
  const client = await cdp(target.webSocketDebuggerUrl);
  const consoleErrors = [];

  await client.send("Runtime.enable");
  await client.send("Page.enable");
  await client.send("Log.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 1,
    mobile: vp.mobile,
  });
  await client.send("Page.navigate", { url: targetUrl });
  await sleep(3000);

  for (const ev of client.events) {
    if (ev.method === "Runtime.exceptionThrown") {
      consoleErrors.push(ev.params.exceptionDetails?.text || "Runtime exception");
    }
    if (ev.method === "Log.entryAdded" && ["error", "warning"].includes(ev.params.entry.level)) {
      consoleErrors.push(`${ev.params.entry.level}: ${ev.params.entry.text}`);
    }
  }

  const evalResult = await client.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const doc = document.documentElement;
      const qa = (selector) => Array.from(document.querySelectorAll(selector));
      const bottom = document.querySelector(".bottom-cta");
      const heroTitle = document.querySelector("#hero-title");
      const telLinks = qa('a[href^="tel:"]').map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute("href"),
      }));
      const mapLinks = qa('a[href*="map.naver.com"]').map((a) => ({
        text: a.textContent.trim(),
        href: a.href,
      }));
      const images = qa("img").map((img) => ({
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        src: img.currentSrc || img.src,
      }));
      const clickables = qa("a,button")
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return {
            text: el.textContent.trim(),
            href: el.getAttribute("href"),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            visible:
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.width > 0 &&
              rect.height > 0,
          };
        })
        .filter((item) => item.visible);
      const firstSectionHeading = document.querySelector("#clinics-title")?.getBoundingClientRect();
      return {
        title: document.title,
        lang: document.documentElement.lang,
        viewport: { innerWidth, innerHeight },
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        hasHorizontalScroll: doc.scrollWidth > doc.clientWidth + 1,
        heroTitle: heroTitle?.textContent.trim(),
        bottomCtaDisplay: bottom ? getComputedStyle(bottom).display : null,
        bottomCtaTop: bottom?.getBoundingClientRect().top ?? null,
        firstSectionHeadingTop: firstSectionHeading ? Math.round(firstSectionHeading.top) : null,
        telLinks,
        mapLinks,
        imageCount: images.length,
        images,
        buttonsTooSmall: clickables.filter((item) => item.width < 44 || item.height < 44),
        visibleTopText: document.body.innerText.slice(0, 700),
      };
    })()`,
  });

  const png = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const screenshot = path.join(outDir, `${vp.label}.png`);
  await writeFile(screenshot, Buffer.from(png.data, "base64"));
  client.close();

  return {
    label: vp.label,
    screenshot,
    consoleErrors,
    ...evalResult.result.value,
  };
}

try {
  await waitForChrome();
  const results = [];
  for (const viewport of viewports) {
    results.push(await inspectViewport(viewport));
  }

  await writeFile(path.join(outDir, "verification.json"), JSON.stringify(results, null, 2));

  const summary = results.map((result) => ({
    label: result.label,
    viewport: result.viewport,
    hasHorizontalScroll: result.hasHorizontalScroll,
    allTelCorrect: result.telLinks.every((link) => link.href === "tel:031-965-5775"),
    telLinks: result.telLinks.length,
    mapLinkCount: result.mapLinks.length,
    brokenImages: result.images.filter((image) => !image.complete || image.naturalWidth === 0)
      .length,
    missingAlt: result.images.filter((image) => !image.alt).length,
    buttonsTooSmall: result.buttonsTooSmall,
    bottomCtaDisplay: result.bottomCtaDisplay,
    firstSectionHeadingTop: result.firstSectionHeadingTop,
    bottomCtaTop: result.bottomCtaTop,
    consoleErrors: result.consoleErrors,
    screenshot: result.screenshot,
  }));

  console.log(JSON.stringify(summary, null, 2));
} finally {
  proc.kill("SIGTERM");
}
