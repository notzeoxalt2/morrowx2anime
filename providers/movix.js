const source = require("./movix-source.js");

async function getStreams(...args) {
  const streams = await source.getStreams(...args);
  return streams.map((stream) => {
    const match = String(stream.name || "").match(/(2160|1440|1080|720|480|360)p/i);
    return {
      ...stream,
      quality: stream.quality || (match ? `${match[1]}p` : "Auto"),
      provider: "movix"
    };
  });
}

module.exports = { getStreams };
