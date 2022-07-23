import { Drash } from '../deps.ts';

export class AboutResource extends Drash.Resource {
  paths = ['/about'];

  public async GET(request: Drash.Request, response: Drash.Response): void {
    // console.log({ request });
    const templateVars = {
      url: request.url
    };
    // return response.html(html);
    const html = await response.render('about', templateVars) as string;

    response.html(html);
  }
}