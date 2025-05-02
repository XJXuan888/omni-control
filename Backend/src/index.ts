/* ---------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { ArgumentParser } from "argparse";
import process from "process";

import hub from "./event";
import createUnixSocketServer from "./unix_socket";
import createHttpWebServer from "./web_server";

// Initiate argument parser
const parser = new ArgumentParser({
  description: "RoverMaster Mission Control Server",
});
parser.add_argument("-p", "--port", {
  help: "Server listen port",
  default: 8080,
  type: Number,
});
parser.add_argument("-s", "--socket", {
  help: "Local unix socket path",
  default: "/tmp/omni-control.sock",
  type: String,
});
parser.add_argument("-d", "--dev", {
  help: "Development mode, proxy static assets to given location",
  default: undefined,
  type: String,
});
const args = parser.parse_args(process.argv.slice(2));

// Create servers
createHttpWebServer(args.port, args.dev);
createUnixSocketServer(args.socket);

// Graceful shutdown helper
function handleShutdown(signal: string) {
  console.log(`[INFO] Received ${signal}, closing servers…`);
  // notify your servers via the event hub
  hub.dispatchEvent(new Event("shutdown"));

  // prevent duplicate calls
  process.removeAllListeners("SIGINT");
  process.removeAllListeners("SIGTERM");

  // force exit after 1 s if things hang
  setTimeout(() => process.exit(0), 1000).unref();
}

// Catch both Ctrl-C and docker/systemd stops
process.on("SIGINT",  () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
