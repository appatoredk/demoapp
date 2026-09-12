import { app } from "google-play-scraper-fetch";

// ==========================================
// HELPER: optimizar URL de imagen de Google
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
// HELPER: formatear app a JSON limpio
// ==========================================
function formatearApp(datos, appIdFallback) {
  const screenshots = Array.isArray(datos.screenshots) ? datos.screenshots : [];

  const bannerRaw =
    datos.headerImage ||
    (screenshots.length > 0 ? screenshots[0] : "") ||
    datos.icon ||
    "";

  return {
    name: datos.title || "Sin nombre",
    appId: datos.appId || appIdFallback || "",
    developer: datos.developer || "Desconocido",
    icon: optimizarUrl(datos.icon || "", 200, 200),
    score: datos.score || 0,
    scoreText: datos.scoreText || "",
    installs: datos.installs || "",
    priceText: datos.priceText || "Gratis",
    summary: datos.summary || "",
    description: datos.description || "",
    screenshots: screenshots.map((s) => optimizarUrl(s, 1080, 800)),
    bannerAd: optimizarUrl(bannerRaw, 1080, 600)
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// ==========================================
// CATÁLOGO AMPLIADO
// ==========================================

// 🎮 JUEGOS — acción, aventura, deportes, estrategia, supervivencia
const CATALOGO_JUEGOS = [
  // Acción / Battle Royale
  "com.dts.freefireth",
  "com.epicgames.fortnite",
  "com.tencent.ig",
  "com.pubg.krmobile",
  "com.activision.callofduty.shooter",
  "com.ea.gp.apexlegendsmobilefps",
  "com.garena.game.codm",
  "com.mojang.minecraftpe",
  "com.roblox.client",
  "com.miHoYo.GenshinImpact",
  "com.miHoYo.hkrpg",
  "com.innersloth.spacemafia",
  "com.supercell.clashofclans",
  "com.supercell.clashroyale",
  "com.supercell.brawlstars",
  "com.supercell.squad",
  "com.king.candycrushsaga",
  "com.king.candycrushsodasaga",
  "com.king.farmheroessaga",
  "com.outfit7.talkingtomgoldrun",
  "com.gameloft.android.ANMP.GloftA9HM",
  "com.gameloft.android.ANMP.GloftA8HM",
  "com.ea.gp.fifamobile",
  "com.ea.gp.maddenmobile",
  "com.firsttouchgames.dls7",
  "com.dream11.fantasy11",
  "com.kiloo.subwaysurf",
  "com.halfbrick.jetpackjoyride",
  "com.imangi.templerun2",
  "com.imangi.templerun",
  "com.miniclip.eightballpool",
  "com.miniclip.bowmasters",
  "com.zeptolab.cuttherope",
  "com.rovio.baba",
  "com.rovio.angrybirds",
  "com.rovio.angrybirds2",
  "com.sega.sonicdash",
  "com.sega.sonic2.runner",
  "com.noodlecake.altosodyssey",
  "com.noodlecake.altosadventure",
  "com.playdead.limbo.full",
  "com.and.games505.TerrariaPaid"
];

// 📱 APPS — redes, música, productividad, mensajería, streaming
const CATALOGO_APPS = [
  // Redes sociales
  "com.whatsapp",
  "com.whatsapp.w4b",
  "com.instagram.android",
  "com.zhiliaoapp.musically",
  "com.twitter.android",
  "com.facebook.katana",
  "com.facebook.lite",
  "com.facebook.orca",
  "com.snapchat.android",
  "com.pinterest",
  "com.reddit.frontpage",
  "com.linkedin.android",
  "com.tumblr",
  "com.vkontakte.android",

  // Mensajería
  "org.telegram.messenger",
  "com.telegram.messenger",
  "com.discord",
  "com.viber.voip",
  "com.skype.raider",
  "com.microsoft.teams",

  // Música / video
  "com.spotify.music",
  "com.google.android.youtube",
  "com.google.android.apps.youtube.music",
  "com.netflix.mediaclient",
  "com.amazon.avod.thirdpartyclient",
  "com.disney.disneyplus",
  "com.hbo.hbonow",
  "com.twitch.android.app",
  "com.deezer.android.app",
  "com.soundcloud.android",

  // Productividad / Google
  "com.google.android.apps.docs",
  "com.google.android.apps.photos",
  "com.google.android.gm",
  "com.google.android.apps.maps",
  "com.google.android.keep",
  "com.google.android.calendar",
  "com.google.android.apps.drive",
  "com.google.android.apps.translate",
  "com.microsoft.office.word",
  "com.microsoft.office.excel",
  "com.microsoft.office.powerpoint",
  "com.microsoft.office.outlook",
  "com.dropbox.android",
  "com.onedrive.android",

  // Finanzas
  "com.paypal.android.p2pmobile",
  "com.mercadopago.wallet",
  "com.binance.dev",
  "com.coinbase.android"
];

// 🕹️ ARCADE — clásicos, retro, casual, puzzle
const CATALOGO_ARCADE = [
  // Casual / puzzle
  "com.king.candycrushjellysaga",
  "com.king.candycrushfriends",
  "com.king.bubblewitch3",
  "com.king.petrescuesaga",
  "com.king.farmheroes",
  "com.rovio.baba",
  "com.rovio.angrybirds",
  "com.rovio.angrybirdsepic",
  "com.rovio.angrybirdsrio",
  "com.rovio.angrybirdsstarwars",
  "com.rovio.angrybirdsstarwars.ads.iap",
  "com.rovio.angrybirdsgo",
  "com.zeptolab.cuttherope",
  "com.zeptolab.cuttheropemagic",
  "com.zeptolab.cuttherope2",
  "com.playrix.homescapes",
  "com.playrix.gardenscapes",
  "com.playrix.fishdomdd.gplay",
  "com.playrix.township",
  "com.melsoftgames.candyblast",
  "com.sgn.pandapop.gp",
  "com.king.candycrushsodasaga",
  "com.dreamgames.royalmatch",
  "com.matteljv.uno",
  "com.gameloft.android.ANMP.GloftMVHM",
  "com.gameloft.android.ANMP.GloftUNHM",

  // Retro / clásicos
  "com.sega.sonicdash",
  "com.sega.sonic2.runner",
  "com.sega.sonicboomandroid",
  "com.namcobandaigames.pacman",
  "com.bandainamcoent.pacman256",
  "com.dsemu.drastic",
  "com.gameloft.android.ANMP.GloftB2HM",

  // Arcade moderno
  "com.halfbrick.jetpackjoyride",
  "com.halfbrick.fruitninjafree",
  "com.noodlecake.altosodyssey",
  "com.noodlecake.altosadventure",
  "com.tiltingpoint.terragenesis",
  "com.playdead.limbo.full",
  "com.and.games505.TerrariaPaid",
  "com.telltalegames.walkingdead100"
];

// ==========================================
// HELPER: obtener varias apps en paralelo
// ==========================================
async function obtenerApps(ids) {
  const promesas = ids.map((id) =>
    app({ appId: id, lang: "es", country: "mx" })
      .then((d) => formatearApp(d, id))
      .catch(() => null)
  );
  const resultados = await Promise.all(promesas);
  return resultados.filter((x) => x !== null);
}

// ==========================================
// HELPER: mezclar array
// ==========================================
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ==========================================
// EXPORT DEFAULT — el Worker
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
        const datos = await app({ appId: appId.trim(), lang: "es", country: "mx" });
        return jsonResponse(formatearApp(datos, appId.trim()));
      }

      // ==========================================
      // /api/random
      // ==========================================
      if (url.pathname === "/api/random") {
        const todo = [...CATALOGO_JUEGOS, ...CATALOGO_APPS, ...CATALOGO_ARCADE];
        const appId = todo[Math.floor(Math.random() * todo.length)];
        const datos = await app({ appId: appId, lang: "es", country: "mx" });
        return jsonResponse(formatearApp(datos, appId));
      }

      // ==========================================
      // /api/home — pantalla "Hoy" completa
      // ==========================================
      if (url.pathname === "/api/home") {
        // Mezclar TODO el catálogo para elegir featured y segunda
        const todo = [...CATALOGO_JUEGOS, ...CATALOGO_APPS, ...CATALOGO_ARCADE];
        const mezclado = shuffle(todo);

        const featuredId = mezclado[0];
        const segundaId = mezclado[1];

        // Tomar 8 de cada categoría (más variedad)
        const juegosSel = shuffle(CATALOGO_JUEGOS).slice(0, 8);
        const appsSel = shuffle(CATALOGO_APPS).slice(0, 8);
        const arcadeSel = shuffle(CATALOGO_ARCADE).slice(0, 8);

        const [featuredData, segundaData, juegosData, appsData, arcadeData] =
          await Promise.all([
            app({ appId: featuredId, lang: "es", country: "mx" }).catch(() => null),
            app({ appId: segundaId, lang: "es", country: "mx" }).catch(() => null),
            obtenerApps(juegosSel),
            obtenerApps(appsSel),
            obtenerApps(arcadeSel)
          ]);

        // Títulos variados
        const titulosJuegos = [
          "Los juegos del momento",
          "Imposible dejar de jugar",
          "Lo más jugado esta semana",
          "Juegos que enganchan",
          "Recomendados para ti",
          "Diversión asegurada",
          "Los que todos juegan",
          "Puro vicio"
        ];
        const titulosApps = [
          "Apps que necesitas",
          "Imprescindibles del día",
          "Descubre algo nuevo",
          "Organiza tu vida",
          "Las más descargadas",
          "Recomendadas para ti",
          "Top apps de hoy",
          "No te las pierdas"
        ];
        const titulosArcade = [
          "Arcade destacado",
          "Para partidas cortas",
          "Clásicos reinventados",
          "Retro pero moderno",
          "Casual y adictivo",
          "Diversión rápida",
          "Puzzles y más",
          "Para relajarse"
        ];
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

        return jsonResponse({
          generado: new Date().toISOString(),
          featured: featuredData ? formatearApp(featuredData, featuredId) : null,
          segunda: segundaData ? formatearApp(segundaData, segundaId) : null,
          secciones: [
            {
              titulo: pick(titulosJuegos),
              categoria: "juegos",
              apps: juegosData
            },
            {
              titulo: pick(titulosApps),
              categoria: "apps",
              apps: appsData
            },
            {
              titulo: pick(titulosArcade),
              categoria: "arcade",
              apps: arcadeData
            }
          ]
        });
      }

      // ==========================================
      // /api/list?category=juegos&count=30
      // ==========================================
      if (url.pathname === "/api/list") {
        const category = (url.searchParams.get("category") || "juegos").toLowerCase();
        const count = Math.min(parseInt(url.searchParams.get("count") || "20"), 40);

        let idsDisponibles;
        if (category === "juegos") idsDisponibles = CATALOGO_JUEGOS;
        else if (category === "apps") idsDisponibles = CATALOGO_APPS;
        else if (category === "arcade") idsDisponibles = CATALOGO_ARCADE;
        else idsDisponibles = CATALOGO_JUEGOS;

        const mezclados = shuffle(idsDisponibles).slice(0, count);
        const resultados = await obtenerApps(mezclados);

        return jsonResponse({
          category,
          count: resultados.length,
          apps: resultados
        });
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
          try {
            const datos = await app({ appId: q, lang: "es", country: "mx" });
            return jsonResponse({ query: q, apps: [formatearApp(datos, q)] });
          } catch (e) {
            return jsonResponse({ query: q, apps: [] });
          }
        }

        const todoCatalogo = [...CATALOGO_JUEGOS, ...CATALOGO_APPS, ...CATALOGO_ARCADE];
        const todas = await obtenerApps(todoCatalogo);

        const resultados = todas.filter((item) => {
          const nombre = (item.name || "").toLowerCase();
          const dev = (item.developer || "").toLowerCase();
          return nombre.includes(q) || dev.includes(q);
        });

        return jsonResponse({ query: q, apps: resultados });
      }

      // ==========================================
      // RUTA PRINCIPAL
      // ==========================================
      return jsonResponse({
        status: "online",
        message: "Cloudflare Worker funcionando",
        endpoints: [
          "/api/app?id=com.example",
          "/api/random",
          "/api/home",
          "/api/list?category=juegos&count=8",
          "/api/search?q=whatsapp"
        ]
      });
    } catch (error) {
      return jsonResponse({ error: true, message: error.message }, 500);
    }
  }
};
