let io;

module.exports = {
  init: (server, options) => {
    io = require("socket.io")(server, options);

    return io;
  },
  get: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }

    return io;
  },
};
