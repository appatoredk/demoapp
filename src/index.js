import { app } from "google-play-scraper-fetch";

export default {
  async fetch(request, env, ctx) {

    try {

      const datos = await app({
        appId: "com.google.android.youtube",
        lang: "es",
        country: "mx"
      });

      return new Response(
        JSON.stringify({
          name: datos.title || "Sin nombre",
          appId: datos.appId || "com.google.android.youtube",
          icon: datos.icon || "",
          details: datos.description || ""
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
