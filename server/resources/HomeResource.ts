import { Drash } from '../deps.ts';

export class HomeResource extends Drash.Resource {
  paths = ['/'];

  public GET(request: Drash.Request, response: Drash.Response): void {
    const html = Deno.readFileSync('public/index.html');

    return response.html(html);
  }
}