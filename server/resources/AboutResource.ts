import { Drash } from '../deps.ts';

export class AboutResource extends Drash.Resource {
  paths = ['/about'];

  public async GET(request: Drash.Request, response: Drash.Response): void {

    const templateVars = {
      url: request.url
    };

    const html = await response.render('about', templateVars) as string;

    response.html(html);
  }
}