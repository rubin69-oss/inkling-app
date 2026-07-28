const config = {
  appId: "com.inkling.app",
  appName: "Inkling",
  webDir: "public",
  server: {
    // IMPORTANT: replace this with your real deployed URL once you've
    // deployed the web app (see README step 2 — Vercel). The native
    // Android shell loads your live site, so your Anthropic/OpenAI API
    // keys stay safely on your server and are never bundled into the app.
    url: "https://REPLACE-WITH-YOUR-DEPLOYED-URL.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

module.exports = config;
