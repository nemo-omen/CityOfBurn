import { Drash } from '../deps.ts';

export class RegisterResource extends Drash.Resource {
  public paths = ['/register'];

  public async GET(request: Drash.Request, response: Drash.Response): void {
    const templateVars = {
      url: request.url
    };
    // return response.html(html);
    const html = await response.render('register', templateVars) as string;

    response.html(html);
  }

  public POST(request: Request, response: Response): void {
    console.log({ request });
  }
}