import { fetchApp } from "parse-play";

export default {
  async fetch(request, env, ctx) {

    try {

      const app = await fetchApp(
        "com.google.android.youtube",
        {
          language: "ES",
          country: "MX"
        }
      );

      return new Response(
        JSON.stringify({
          name: app?.name || "Sin nombre",
          appId: app?.app_id || "com.google.android.youtube",
          icon: app?.icon_url || "",
          details: app?.description || ""
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
