import { Drash, Handlebars } from '../deps.ts';

const config: HandlebarsConfig = {
  baseDir: 'server/hbviews',
  extname: '.hbs',
  layoutsDir: 'layouts/',
  partialsDir: 'partials/',
  cachePartials: false,
  defaultLayout: 'main',
  helpers: {
    pathMatches: (url, match) => {
      const path = new URL(url).pathname;
      return path === `/${match}`;
    }
  },
  compilerOptions: undefined,
};

export class HandlebarsService extends Drash.Service {
  handle: Handlebars = new Handlebars(config);
  constructor () {
    super();
  }

  runBeforeResource(request: Drash.Request, response: Drash.response) {
    response.headers.set('Content-Type', 'text/html');

    response.render = async (filename: string, data: unknown) => {
      try {
        const rendered = await this.handle.renderView(filename, data);
        return rendered;
      } catch (error) {
        console.error(error);
      }
    };
  }
}