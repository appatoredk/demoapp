import { app } from "google-play-scraper-fetch";

// ==========================================
// CONFIGURACIÓN
// ==========================================
const CONFIG = {
  LANG: "es",
  COUNTRY: "mx",
  TIMEOUT_MS: 8000,
  HOME_SECTION_SIZE: 5,
  LIST_MAX_COUNT: 40,
};

// ==========================================
// CACHÉ EN MEMORIA
// ==========================================
const CACHE = {
  home: { data: null, time: 0, ttl: 60 * 1000 },
  apps: new Map(),
  lists: new Map(),
  APP_TTL: 5 * 60 * 1000,
};

function getCacheHome() {
  if (CACHE.home.data && Date.now() - CACHE.home.time < CACHE.home.ttl) return CACHE.home.data;
  return null;
}
function setCacheHome(data) { CACHE.home = { data, time: Date.now(), ttl: CACHE.home.ttl }; }
function getCacheApp(id) {
  const item = CACHE.apps.get(id);
  if (item && Date.now() - item.time < CACHE.APP_TTL) return item.data;
  return null;
}
function setCacheApp(id, data) { CACHE.apps.set(id, { data, time: Date.now() }); }
function getCacheList(key) {
  const item = CACHE.lists.get(key);
  if (item && Date.now() - item.time < CACHE.APP_TTL) return item.data;
  return null;
}
function setCacheList(key, data) { CACHE.lists.set(key, { data, time: Date.now() }); }

// ==========================================
// HELPER: optimizar URL de imagen
// ==========================================
function optimizarUrl(url, w, h) {
  if (!url || typeof url !== "string") return "";
  if (url.includes("=w") || url.includes("=h")) return url;
  if (url.includes("play-lh.googleusercontent.com")) {
    return url + "=w" + w + "-h" + h;
  }
  return url;
}

// ==========================================
// HELPER: URLs de alternativas (APKPure, Uptodown, etc.)
// ==========================================
function getAlternativas(appId, appName) {
  const id = appId || "";
  const nombreLimpio = (appName || "").toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 40);

  return {
    apkpure: "https://apkpure.com/" + nombreLimpio + "/" + id,
    apkpureBuscar: "https://apkpure.com/search?q=" + encodeURIComponent(appName || id),
    uptodown: "https://" + nombreLimpio + ".en.uptodown.com/android",
    uptodownBuscar: "https://en.uptodown.com/android/search/" + encodeURIComponent(appName || id),
    apkmirror: "https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s=" + encodeURIComponent(appName || id),
    playStore: "https://play.google.com/store/apps/details?id=" + id
  };
}

// ==========================================
// HELPER: formatear app
// ==========================================
function formatearApp(datos, appIdFallback) {
  if (!datos) return null;
  const screenshots = Array.isArray(datos.screenshots) ? datos.screenshots : [];

  const bannerRaw =
    datos.headerImage ||
    (screenshots.length > 0 ? screenshots[0] : "") ||
    datos.icon ||
    "";

  const appId = datos.appId || appIdFallback || "";
  const appName = datos.title || "Sin nombre";

  return {
    name: appName,
    appId: appId,
    developer: datos.developer || "Desconocido",
    developerId: datos.developerId || "",
    icon: optimizarUrl(datos.icon || "", 200, 200),
    score: datos.score || 0,
    scoreText: datos.scoreText || "",
    ratings: datos.ratings || 0,
    reviews: datos.reviews || 0,
    installs: datos.installs || "",
    priceText: datos.priceText || "Gratis",
    price: datos.price || 0,
    free: datos.free !== undefined ? datos.free : true,
    currency: datos.currency || "USD",
    summary: datos.summary || "",
    description: datos.description || "",
    screenshots: screenshots.map((s) => optimizarUrl(s, 1080, 800)),
    bannerAd: optimizarUrl(bannerRaw, 1080, 600),
    genre: datos.genre || "",
    genreId: datos.genreId || "",
    updated: datos.updated || 0,
    version: datos.version || "",
    recentChanges: datos.recentChanges || "",
    playUrl: "https://play.google.com/store/apps/details?id=" + appId,
    alternativas: getAlternativas(appId, appName)
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60"
    }
  });
}

// ==========================================
// HELPER: fetch con timeout y caché
// ==========================================
async function fetchConTimeout(appId) {
  const cached = getCacheApp(appId);
  if (cached) return cached;

  try {
    const promesa = app({ appId, lang: CONFIG.LANG, country: CONFIG.COUNTRY });
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), CONFIG.TIMEOUT_MS)
    );
    const datos = await Promise.race([promesa, timeout]);
    const formateado = formatearApp(datos, appId);
    if (formateado) setCacheApp(appId, formateado);
    return formateado;
  } catch (e) {
    return null;
  }
}

async function obtenerAppSegura(appId, poolFallback) {
  let r = await fetchConTimeout(appId);
  if (r) return r;
  if (poolFallback && poolFallback.length > 0) {
    const alt = poolFallback[Math.floor(Math.random() * poolFallback.length)];
    if (alt !== appId) {
      r = await fetchConTimeout(alt);
      if (r) return r;
    }
  }
  return null;
}

// ==========================================
// CATÁLOGOS
// ==========================================
const CATALOGO_JUEGOS = [
  "com.dts.freefireth", "com.epicgames.fortnite", "com.tencent.ig",
  "com.pubg.krmobile", "com.activision.callofduty.shooter",
  "com.ea.gp.apexlegendsmobilefps", "com.garena.game.codm",
  "com.mojang.minecraftpe", "com.roblox.client", "com.miHoYo.GenshinImpact",
  "com.miHoYo.hkrpg", "com.innersloth.spacemafia", "com.supercell.clashofclans",
  "com.supercell.clashroyale", "com.supercell.brawlstars", "com.supercell.squad",
  "com.king.candycrushsaga", "com.king.candycrushsodasaga",
  "com.king.farmheroessaga", "com.outfit7.talkingtomgoldrun",
  "com.gameloft.android.ANMP.GloftA9HM", "com.gameloft.android.ANMP.GloftA8HM",
  "com.ea.gp.fifamobile", "com.ea.gp.maddenmobile", "com.firsttouchgames.dls7",
  "com.dream11.fantasy11", "com.kiloo.subwaysurf", "com.halfbrick.jetpackjoyride",
  "com.imangi.templerun2", "com.imangi.templerun", "com.miniclip.eightballpool",
  "com.miniclip.bowmasters", "com.zeptolab.cuttherope", "com.rovio.baba",
  "com.rovio.angrybirds", "com.rovio.angrybirds2", "com.sega.sonicdash",
  "com.sega.sonic2.runner", "com.noodlecake.altosodyssey",
  "com.noodlecake.altosadventure", "com.playdead.limbo.full",
  "com.and.games505.TerrariaPaid"
];

const CATALOGO_APPS = [
  "com.whatsapp", "com.whatsapp.w4b", "com.instagram.android",
  "com.zhiliaoapp.musically", "com.twitter.android", "com.facebook.katana",
  "com.facebook.lite", "com.facebook.orca", "com.snapchat.android",
  "com.pinterest", "com.reddit.frontpage", "com.linkedin.android",
  "com.tumblr", "com.vkontakte.android", "org.telegram.messenger",
  "com.telegram.messenger", "com.discord", "com.viber.voip",
  "com.skype.raider", "com.microsoft.teams", "com.spotify.music",
  "com.google.android.youtube", "com.google.android.apps.youtube.music",
  "com.netflix.mediaclient", "com.amazon.avod.thirdpartyclient",
  "com.disney.disneyplus", "com.hbo.hbonow", "com.twitch.android.app",
  "com.deezer.android.app", "com.soundcloud.android",
  "com.google.android.apps.docs", "com.google.android.apps.photos",
  "com.google.android.gm", "com.google.android.apps.maps",
  "com.google.android.keep", "com.google.android.calendar",
  "com.google.android.apps.drive", "com.google.android.apps.translate",
  "com.microsoft.office.word", "com.microsoft.office.excel",
  "com.microsoft.office.powerpoint", "com.microsoft.office.outlook",
  "com.dropbox.android", "com.onedrive.android",
  "com.paypal.android.p2pmobile", "com.mercadopago.wallet",
  "com.binance.dev", "com.coinbase.android"
];

const CATALOGO_ARCADE = [
  "com.king.candycrushjellysaga", "com.king.candycrushfriends",
  "com.king.bubblewitch3", "com.king.petrescuesaga", "com.king.farmheroes",
  "com.rovio.baba", "com.rovio.angrybirds", "com.rovio.angrybirdsepic",
  "com.rovio.angrybirdsrio", "com.rovio.angrybirdsstarwars",
  "com.rovio.angrybirdsstarwars.ads.iap", "com.rovio.angrybirdsgo",
  "com.zeptolab.cuttherope", "com.zeptolab.cuttheropemagic",
  "com.zeptolab.cuttherope2", "com.playrix.homescapes",
  "com.playrix.gardenscapes", "com.playrix.fishdomdd.gplay",
  "com.playrix.township", "com.melsoftgames.candyblast",
  "com.sgn.pandapop.gp", "com.king.candycrushsodasaga",
  "com.dreamgames.royalmatch", "com.matteljv.uno",
  "com.gameloft.android.ANMP.GloftMVHM", "com.gameloft.android.ANMP.GloftUNHM",
  "com.sega.sonicdash", "com.sega.sonic2.runner", "com.sega.sonicboomandroid",
  "com.namcobandaigames.pacman", "com.bandainamcoent.pacman256",
  "com.dsemu.drastic", "com.gameloft.android.ANMP.GloftB2HM",
  "com.halfbrick.jetpackjoyride", "com.halfbrick.fruitninjafree",
  "com.noodlecake.altosodyssey", "com.noodlecake.altosadventure",
  "com.tiltingpoint.terragenesis", "com.playdead.limbo.full",
  "com.and.games505.TerrariaPaid", "com.telltalegames.walkingdead100"
];

// ==========================================
// HELPERS
// ==========================================
async function obtenerApps(ids) {
  const promesas = ids.map((id) => fetchConTimeout(id));
  const resultados = await Promise.all(promesas);
  return resultados.filter((x) => x !== null);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==========================================
// EXPORT DEFAULT
// ==========================================
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // ==========================================
      // /api/app?id=...
      // ==========================================
      if (url.pathname === "/api/app") {
        const appId = url.searchParams.get("id");
        if (!appId || appId.trim() === "") {
          return jsonResponse({ error: true, message: "Falta el parámetro id" }, 400);
        }
        const datos = await fetchConTimeout(appId.trim());
        if (!datos) {
          return jsonResponse({ error: true, message: "App no encontrada" }, 404);
        }
        return jsonResponse(datos);
      }

      // ==========================================
      // /api/check-update?id=com.whatsapp&version=2.24.1
      // ==========================================
      if (url.pathname === "/api/check-update") {
        const appId = url.searchParams.get("id");
        const currentVersion = url.searchParams.get("version");

        if (!appId || appId.trim() === "") {
          return jsonResponse({ error: true, message: "Falta el parámetro id" }, 400);
        }

        const datos = await fetchConTimeout(appId.trim());
        if (!datos) {
          return jsonResponse({
            updateAvailable: false,
            error: "App no encontrada en Play Store"
          });
        }

        let latest = datos.version || "";

        // Si Play Store devuelve "VARY" o está vacío, usamos fecha como referencia
        const versionInvalida = !latest ||
                                latest === "VARY" ||
                                latest === "Varies with device" ||
                                latest.toUpperCase() === "VARY";

        let updateAvailable = false;
        let metodo = "version";

        if (versionInvalida) {
          metodo = "fecha";
          const updated = datos.updated || 0;
          const diasDesde = (Date.now() - updated) / (1000 * 60 * 60 * 24);
          updateAvailable = diasDesde > 0 && diasDesde < 60;
        } else {
          updateAvailable = currentVersion && (currentVersion !== latest);
        }

        return jsonResponse({
          appId: appId,
          name: datos.name,
          currentVersion: currentVersion || "desconocida",
          latestVersion: versionInvalida ? "no disponible (varía)" : latest,
          updateAvailable: updateAvailable,
          metodo: metodo,
          recentChanges: datos.recentChanges || "",
          updated: datos.updated || 0,
          playUrl: datos.playUrl,
          icon: datos.icon,
          developer: datos.developer,
          alternativas: datos.alternativas
        });
      }

      // ==========================================
      // /api/random
      // ==========================================
      if (url.pathname === "/api/random") {
        const todo = [...CATALOGO_JUEGOS, ...CATALOGO_APPS, ...CATALOGO_ARCADE];
        for (let i = 0; i < 3; i++) {
          const datos = await fetchConTimeout(pick(todo));
          if (datos) return jsonResponse(datos);
        }
        return jsonResponse({ error: true, message: "No se pudo cargar" }, 500);
      }

      // ==========================================
      // /api/home
      // ==========================================
      if (url.pathname === "/api/home") {
        const cached = getCacheHome();
        if (cached) return jsonResponse(cached);

        const todo = [...CATALOGO_JUEGOS, ...CATALOGO_APPS, ...CATALOGO_ARCADE];
        const mezclado = shuffle(todo);
        const featuredId = mezclado[0];
        const segundaId = mezclado[1];

        const juegosSel = shuffle(CATALOGO_JUEGOS).slice(0, CONFIG.HOME_SECTION_SIZE);
        const appsSel = shuffle(CATALOGO_APPS).slice(0, CONFIG.HOME_SECTION_SIZE);
        const arcadeSel = shuffle(CATALOGO_ARCADE).slice(0, CONFIG.HOME_SECTION_SIZE);

        const [featuredData, segundaData, juegosData, appsData, arcadeData] =
          await Promise.all([
            obtenerAppSegura(featuredId, todo),
            obtenerAppSegura(segundaId, todo),
            obtenerApps(juegosSel),
            obtenerApps(appsSel),
            obtenerApps(arcadeSel)
          ]);

        const titulosJuegos = [
          "Los juegos del momento", "Imposible dejar de jugar",
          "Lo más jugado esta semana", "Juegos que enganchan",
          "Recomendados para ti", "Diversión asegurada",
          "Los que todos juegan", "Puro vicio"
        ];
        const titulosApps = [
          "Apps que necesitas", "Imprescindibles del día",
          "Descubre algo nuevo", "Organiza tu vida",
          "Las más descargadas", "Recomendadas para ti",
          "Top apps de hoy", "No te las pierdas"
        ];
        const titulosArcade = [
          "Arcade destacado", "Para partidas cortas",
          "Clásicos reinventados", "Retro pero moderno",
          "Casual y adictivo", "Diversión rápida",
          "Puzzles y más", "Para relajarse"
        ];

        const respuesta = {
          generado: new Date().toISOString(),
          featured: featuredData,
          segunda: segundaData,
          secciones: [
            { titulo: pick(titulosJuegos), categoria: "juegos", apps: juegosData },
            { titulo: pick(titulosApps), categoria: "apps", apps: appsData },
            { titulo: pick(titulosArcade), categoria: "arcade", apps: arcadeData }
          ]
        };

        setCacheHome(respuesta);
        return jsonResponse(respuesta);
      }

      // ==========================================
      // /api/list?category=juegos&count=30&type=free
      // ==========================================
      if (url.pathname === "/api/list") {
        const category = (url.searchParams.get("category") || "juegos").toLowerCase();
        const count = Math.min(parseInt(url.searchParams.get("count") || "20"), CONFIG.LIST_MAX_COUNT);
        const type = (url.searchParams.get("type") || "all").toLowerCase();

        const cacheKey = category + "_" + count + "_" + type;
        const cached = getCacheList(cacheKey);
        if (cached) return jsonResponse(cached);

        let idsDisponibles;
        if (category === "juegos") idsDisponibles = CATALOGO_JUEGOS;
        else if (category === "apps") idsDisponibles = CATALOGO_APPS;
        else if (category === "arcade") idsDisponibles = CATALOGO_ARCADE;
        else idsDisponibles = CATALOGO_JUEGOS;

        const mezclados = shuffle(idsDisponibles).slice(0, count);
        let resultados = await obtenerApps(mezclados);

        if (type === "free") {
          resultados = resultados.filter((a) => a.free === true || a.price === 0 || a.priceText === "Free" || a.priceText === "Gratis");
        } else if (type === "paid") {
          resultados = resultados.filter((a) => a.free === false || a.price > 0);
        }

        const respuesta = {
          category,
          type,
          count: resultados.length,
          apps: resultados
        };

        setCacheList(cacheKey, respuesta);
        return jsonResponse(respuesta);
      }

      // ==========================================
      // /api/search?q=...
      // ==========================================
      if (url.pathname === "/api/search") {
        const query = url.searchParams.get("q");
        if (!query || query.trim() === "") {
          return jsonResponse({ error: true, message: "Falta el parámetro q" }, 400);
        }

        const q = query.trim().toLowerCase();

        if (q.includes(".")) {
          const datos = await fetchConTimeout(q);
          return jsonResponse({ query: q, apps: datos ? [datos] : [] });
        }

        const todoCatalogo = [...CATALOGO_JUEGOS, ...CATALOGO_APPS, ...CATALOGO_ARCADE];
        const resultados = [];

        for (const id of todoCatalogo) {
          const cached = getCacheApp(id);
          if (cached) {
            const nombre = (cached.name || "").toLowerCase();
            const dev = (cached.developer || "").toLowerCase();
            if (nombre.includes(q) || dev.includes(q)) {
              resultados.push(cached);
            }
          }
        }

        if (resultados.length === 0) {
          const sinCache = todoCatalogo.filter((id) => !getCacheApp(id)).slice(0, 20);
          const encontrados = await obtenerApps(sinCache);
          for (const item of encontrados) {
            const nombre = (item.name || "").toLowerCase();
            const dev = (item.developer || "").toLowerCase();
            if (nombre.includes(q) || dev.includes(q)) {
              resultados.push(item);
            }
          }
        }

        return jsonResponse({ query: q, apps: resultados });
      }

      // ==========================================
      // RUTA PRINCIPAL
      // ==========================================
      return jsonResponse({
        status: "online",
        message: "Cloudflare Worker funcionando",
        version: "3.1",
        cache: {
          home: CACHE.home.data ? "activo" : "vacío",
          appsEnCache: CACHE.apps.size,
          listasEnCache: CACHE.lists.size
        },
        endpoints: [
          "/api/app?id=com.example",
          "/api/check-update?id=com.whatsapp&version=2.24.1",
          "/api/random",
          "/api/home",
          "/api/list?category=juegos&count=8&type=free",
          "/api/list?category=apps&count=8&type=paid",
          "/api/search?q=whatsapp"
        ]
      });
    } catch (error) {
      return jsonResponse({ error: true, message: error.message }, 500);
    }
  }
};
