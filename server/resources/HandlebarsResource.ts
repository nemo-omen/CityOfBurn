import { Drash } from '../deps.ts';

export class HandlebarsResource extends Drash.Resource {
  paths = ['/handlebars'];
  public async GET(request: Drash.Request, response: Drash.Response): void {
    const templateVars = {
      name: 'Jeff'
    };

    const html = await response.render('index', templateVars) as string;

    response.html(html);
  }
}