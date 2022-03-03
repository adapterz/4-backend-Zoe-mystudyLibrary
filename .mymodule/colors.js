const colors = require("colors/safe");

colors.setTheme({
  server_start: ["rainbow", "bold"],
  info: "grey",
  query: ["blue", "bold"],
  help: "cyan",
  warn: "yellow",
  debug: "magenta",
  error: ["red", "italic"],
});

module.exports = colors;
