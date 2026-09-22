const resolver = require("./resolver.js");

function createSiteProvider(name, url) {
  const provider = resolver.providerForSite(name, url);
  return {
    async getStreams(...args) {
      const streams = await provider.getStreams(...args);
      return streams.map((stream) => ({
        ...stream,
        name: `${name} | ${stream.name}`,
        provider: `morrow-anime-2-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        sourceSite: url,
        resolverBacked: true
      }));
    }
  };
}

module.exports = { createSiteProvider };
