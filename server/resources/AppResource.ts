import { Drash } from '../deps.ts';

export class AppResource extends Drash.Resource {
  paths = ['/app'];

  public async GET(request: Drash.Request, response: Drash.Response): void {
    const templateVars = {
      url: request.url
    };

    const html = await response.render('app', templateVars) as string;

    response.html(html);
  }
}