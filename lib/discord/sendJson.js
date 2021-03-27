async function sendJson({ channel, value }) {
  return channel.send(`\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``);
}

module.exports = {
  sendJson,
};
