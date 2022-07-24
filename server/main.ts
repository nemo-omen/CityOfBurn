import {
  Drash,
  SocketResource,
  HomeResource,
  AppResource,
  AboutResource,
  RegisterResource,
  FilesResource,
  TengineService,
  Handlebars,
  HandlebarsService
} from './deps.ts';

// const tengine = new TengineService({
// views_path: './server/hbViews'
//   views_path: './server/views'
// });

// const handlebars = new HandlebarsService(hbConfig);
const handlebars = new HandlebarsService();

const httpPort = 8080;

const httpServer = new Drash.Server({
  hostname: 'localhost',
  port: httpPort,
  protocol: 'http',
  resources: [
    AboutResource,
    AppResource,
    FilesResource,
    HomeResource,
    RegisterResource,
    SocketResource,
  ],
  // services: [tengine]
  services: [handlebars]
});

httpServer.run();

console.log(`HTTP server listening on ${httpServer.address}`);