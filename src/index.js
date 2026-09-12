import { app, list, search } from "google-play-scraper-fetch";

// ==========================================
// HELPER: formatear app a JSON limpio
// ==========================================
function formatearApp(datos, appIdFallback) {
  return {
    name: datos.title || "Sin nombre",
    appId: datos.appId || appIdFallback || "",
    developer: datos.developer || "Desconocido",
    icon: datos.icon || "",
    score: datos.score || 0,
    scoreText: datos.scoreText || "",
    installs: datos.installs || "",
    priceText: datos.priceText || "Gratis",
    summary: datos.summary || "",
    description: datos.description || "",
    screenshots: datos.screenshots || [],
    bannerAd:
      datos.headerImage ||
      (datos.screenshots && datos.screenshots.length > 0
        ? datos.screenshots[0]
        : "")
  };
}

// ==========================================
// HELPER: respuesta JSON estándar
// ==========================================
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
// CATÁLOGO (puedes agregar más IDs)
// ==========================================
const CATALOGO_JUEGOS = [
  "com.mojang.minecraftpe",
  "com.innersloth.spacemafia",
  "com.supercell.clashofclans",
  "com.dts.freefireth",
  "com.miHoYo.GenshinImpact",
  "com.ea.gp.fifamobile",
  "com.roblox.client",
  "com.king.candycrushsaga",
  "com.king.candycrushsodasaga",
  "com.outfit7.talkingtomgoldrun",
  "com.gameloft.android.ANMP.GloftA9HM",
  "com.epicgames.fortnite"
];

const CATALOGO_APPS = [
  "com.whatsapp",
  "com.instagram.android",
  "com.spotify.music",
  "com.google.android.youtube",
  "com.netflix.mediaclient",
  "com.zhiliaoapp.musically",
  "com.twitter.android",
  "com.discord",
  "com.snapchat.android",
  "com.facebook.katana",
  "com.pinterest",
  "com.reddit.frontpage",
  "com.telegram.messenger",
  "org.telegram.messenger",
  "com.microsoft.office.word",
  "com.google.android.apps.docs"
];

const CATALOGO_ARCADE = [
  "com.sega.sonicdash",
  "com.noodlecake.altosodyssey",
  "com.halfbrick.jetpackjoyride",
  "com.playdead.limbo.full",
  "com.tiltingpoint.terragenesis",
  "com.telltalegames.walkingdead100",
  "com.and.games505.TerrariaPaid"
];

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
          return jsonResponse(
            { error: true, message: "Falta el parámetro id" },
            400
          );
        }

        const datos = await app({
          appId: appId.trim(),
          lang: "es",
          country: "mx"
        });

        return jsonResponse(formatearApp(datos, appId.trim()));
      }

      // ==========================================
      // /api/random
      // ==========================================
      if (url.pathname === "/api/random") {
        const aplicaciones = [
          "com.google.android.youtube",
          "com.whatsapp",
          "com.instagram.android",
          "com.spotify.music",
          "com.google.android.apps.maps"
        ];

        const indice = Math.floor(Math.random() * aplicaciones.length);
        const appId = aplicaciones[indice];

        const datos = await app({
          appId: appId,
          lang: "es",
          country: "mx"
        });

        return jsonResponse(formatearApp(datos, appId));
      }

      // ==========================================
      // /api/home — pantalla "Hoy" completa
      // ==========================================
      if (url.pathname === "/api/home") {
        // Mezclamos todo el catálogo
        const todo = [...CATALOGO_JUEGOS, ...CATALOGO_APPS, ...CATALOGO_ARCADE];
        const mezclado = [...todo].sort(() => Math.random() - 0.5);

        const featuredId = mezclado[0];
        const segundaId = mezclado[1];

        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
        const toma4 = (arr) => shuffle(arr).slice(0, 4);

        const [featuredData, segundaData, juegosData, appsData, arcadeData] =
          await Promise.all([
            app({ appId: featuredId, lang: "es", country: "mx" }).catch(() => null),
            app({ appId: segundaId, lang: "es", country: "mx" }).catch(() => null),
            Promise.all(
              toma4(CATALOGO_JUEGOS).map((id) =>
                app({ appId: id, lang: "es", country: "mx" })
                  .then((d) => formatearApp(d, id))
                  .catch(() => null)
              )
            ),
            Promise.all(
              toma4(CATALOGO_APPS).map((id) =>
                app({ appId: id, lang: "es", country: "mx" })
                  .then((d) => formatearApp(d, id))
                  .catch(() => null)
              )
            ),
            Promise.all(
              toma4(CATALOGO_ARCADE).map((id) =>
                app({ appId: id, lang: "es", country: "mx" })
                  .then((d) => formatearApp(d, id))
                  .catch(() => null)
              )
            )
          ]);

        const titulosJuegos = [
          "Los juegos del momento",
          "Imposible dejar de jugar",
          "Lo más jugado esta semana",
          "Juegos que enganchan"
        ];
        const titulosApps = [
          "Apps que necesitas",
          "Imprescindibles del día",
          "Descubre algo nuevo",
          "Organiza tu vida"
        ];
        const titulosArcade = [
          "Arcade destacado",
          "Para partidas cortas",
          "Clásicos reinventados",
          "Retro pero moderno"
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
              apps: juegosData.filter(Boolean)
            },
            {
              titulo: pick(titulosApps),
              categoria: "apps",
              apps: appsData.filter(Boolean)
            },
            {
              titulo: pick(titulosArcade),
              categoria: "arcade",
              apps: arcadeData.filter(Boolean)
            }
          ]
        });
      }

      // ==========================================
      // /api/list?category=juegos&count=8
      // ==========================================
      if (url.pathname === "/api/list") {
        const category = (url.searchParams.get("category") || "juegos").toLowerCase();
        const count = Math.min(parseInt(url.searchParams.get("count") || "8"), 20);

        let idsDisponibles;
        if (category === "juegos") idsDisponibles = CATALOGO_JUEGOS;
        else if (category === "apps") idsDisponibles = CATALOGO_APPS;
        else if (category === "arcade") idsDisponibles = CATALOGO_ARCADE;
        else idsDisponibles = CATALOGO_JUEGOS;

        const mezclados = [...idsDisponibles].sort(() => Math.random() - 0.5);
        const seleccionados = mezclados.slice(0, count);

        const promesas = seleccionados.map(async (id) => {
          try {
            const datos = await app({ appId: id, lang: "es", country: "mx" });
            return formatearApp(datos, id);
          } catch (e) {
            return null;
          }
        });

        const resultados = (await Promise.all(promesas)).filter((x) => x !== null);

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
          return jsonResponse(
            { error: true, message: "Falta el parámetro q" },
            400
          );
        }

        // Intentamos con search() si está disponible
        try {
          const resultados = await search({
            term: query.trim(),
            num: 15,
            lang: "es",
            country: "mx"
          });

          const apps = resultados.map((item) => formatearApp(item, item.appId));
          return jsonResponse({ query, apps });
        } catch (e) {
          return jsonResponse(
            { error: true, message: "Error en búsqueda: " + e.message },
            500
          );
        }
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
