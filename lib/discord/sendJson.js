async function sendJson({ channel, value }) {
  return channel.send(`\`\`\`json\n${JSON.stringify(value, replaceErrors, 2)}\n\`\`\``, {
    split: true,
  });
}

function replaceErrors(key, value) {
  if (value instanceof Error) {
    var error = {};

    Object.getOwnPropertyNames(value).forEach(function (key) {
      error[key] = value[key];
    });

    return error;
  }

  return value;
}


module.exports = {
  sendJson,
};
