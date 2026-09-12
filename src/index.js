import { app } from "google-play-scraper-fetch";

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

          return new Response(
            JSON.stringify({
              error: true,
              message: "Falta el parámetro id"
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        const datos = await app({
          appId: appId.trim(),
          lang: "es",
          country: "mx"
        });

        return new Response(
          JSON.stringify({
            name: datos.title || "Sin nombre",
            appId: datos.appId || appId,
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
              (
                datos.screenshots &&
                datos.screenshots.length > 0
                  ? datos.screenshots[0]
                  : ""
              )
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
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

        const indice =
          Math.floor(
            Math.random() * aplicaciones.length
          );

        const appId =
          aplicaciones[indice];

        const datos = await app({
          appId: appId,
          lang: "es",
          country: "mx"
        });

        return new Response(
          JSON.stringify({
            name: datos.title || "Sin nombre",
            appId: datos.appId || appId,
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
              (
                datos.screenshots &&
                datos.screenshots.length > 0
                  ? datos.screenshots[0]
                  : ""
              )
          }),
          {
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }


      // ==========================================
      // RUTA PRINCIPAL
      // ==========================================

      return new Response(
        JSON.stringify({
          status: "online",
          message: "Cloudflare Worker funcionando"
        }),
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (error) {

      return new Response(
        JSON.stringify({
          error: true,
          message: error.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};
