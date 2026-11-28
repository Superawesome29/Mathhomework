const TUNNEL_CONFIG = {
  gistId: "804f626133299a1c9e3c0ad976e7d1b5",
  fileName: "urls.json",
  cacheSeconds: 30,
  hosts: {
    "school.mathhomework.dpdns.org": "school",
    "notes.mathhomework.dpdns.org": "notes"
  }
};

async function getTunnelUrls() {
  const key = "tunnelUrlsCache";
  try {
    const c = JSON.parse(sessionStorage.getItem(key) || "null");
    if (c && Date.now() - c.t < TUNNEL_CONFIG.cacheSeconds * 1000) return c.data;
  } catch (e) {}
  const r = await fetch("https://api.github.com/gists/" + TUNNEL_CONFIG.gistId, { cache: "no-store" });
  if (!r.ok) throw new Error("Gist fetch failed: " + r.status);
  const g = await r.json();
  const data = JSON.parse(g.files[TUNNEL_CONFIG.fileName].content);
  sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
  return data;
}

async function resolveTunnelUrls(text) {
  let urls;
  try { urls = await getTunnelUrls(); } catch (e) { console.error(e); return null; }
  for (const [host, name] of Object.entries(TUNNEL_CONFIG.hosts)) {
    const old = "https://" + host;
    if (text.includes(old)) {
      const now = urls[name];
      if (!now || now === "offline") return null;
      text = text.split(old).join(now.replace(/\/$/, ""));
    }
  }
  return text;
}
