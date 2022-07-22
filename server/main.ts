import { Drash, SocketResource, HomeResource, FilesResource } from './deps.ts';

const httpPort = 8080;

const httpServer = new Drash.Server({
  hostname: 'localhost',
  port: httpPort,
  protocol: 'http',
  resources: [HomeResource, FilesResource, SocketResource]
});

httpServer.run();

console.log(`HTTP server listening on ${httpServer.address}`);