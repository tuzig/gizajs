var liveServer = require("live-server");

var params = {
	port: 8888, // Set the server port. Defaults to 8080.
	host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
	file: "index.html", // When set, serve this file for every 404 (useful for single-page applications)
	wait: 100, // Waits for all changes, before reloading. Defaults to 0 sec.
	logLevel: 3, // 0 = errors only, 1 = some, 2 = lots
	middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};
liveServer.start(params);
