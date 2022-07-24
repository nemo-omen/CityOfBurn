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
    // if success - send to /app
    // else, send back to register & populate the form with old data
    // or! handle it client-side and validate/check for user qualifications
    // using fetch
  }
}