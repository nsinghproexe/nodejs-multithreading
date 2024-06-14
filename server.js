const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;
const express = require("express");
const app = express();

// If the master process finds that there are worker processes
// available, it will fork one off.
let count = 0;
if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for 'exit' events on workers.
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case, it is an HTTP server
  app.get("/test-node-concurrently", (req, res) => {
    count+=1;
    console.log("request received ip address is: ", req.ip);
    console.log(`number of times api called count: ${count}`);
    res.send("Hello from Node.js Cluster!");
  });

  // Create HTTP server
  const server = http.createServer(app);

  // Have the worker report success when done.
  server.on("listening", () => {
    console.log(`Server running on port 3000, PID: ${process.pid}`);
  });

  // Fork the server
  server.listen(3000);
}
