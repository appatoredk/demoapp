export default {
  async fetch(request, env, ctx) {

    const datos = {
      name: "Aplicación de prueba",
      appId: "com.prueba.app",
      icon: "https://developers.cloudflare.com/favicon.ico",
      details: "Esta es una aplicación de prueba funcionando con Cloudflare Workers."
    };

    return new Response(
      JSON.stringify(datos),
      {
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        }
      }
    );
  }
};
