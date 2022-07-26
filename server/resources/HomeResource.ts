import { Drash } from '../deps.ts';

export class HomeResource extends Drash.Resource {
  paths = ['/'];

  public async GET(request: Drash.Request, response: Drash.Response): void {
    // console.log({ request });
    const templateVars = {
      url: request.url
    };
    // return response.html(html);
    const html = await response.render('index', templateVars) as string;

    response.html(html);
  }
}