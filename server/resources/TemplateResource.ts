import { Drash } from '../deps.ts';

export class TemplateResource extends Drash.Resource {
  paths = ['/template'];
  public GET(request: Drash.Request, response: Drash.Response): void {
    const templateVars = {
      name: 'Jeff'
    };

    const html = response.render('/index.html', templateVars) as string;
    response.html(html);
  }
}