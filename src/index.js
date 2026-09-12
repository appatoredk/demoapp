import { app } from "google-play-scraper-fetch";

export default {
  async fetch(request, env, ctx) {

    try {

      const url = new URL(request.url);

      // Obtener el ID enviado en ?id=
      const appId = url.searchParams.get("id");

      // Si no enviaron ID
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

      // Consultar Google Play
      const datos = await app({
        appId: appId.trim(),
        lang: "es",
        country: "mx"
      });

      // Devolver solamente los datos básicos
      return new Response(
        JSON.stringify({
          name: datos.title || "Sin nombre",
          appId: datos.appId || appId,
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
