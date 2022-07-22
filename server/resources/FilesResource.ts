import { Drash } from '../deps.ts';

export class FilesResource extends Drash.Resource {
  paths = ["/favicon.(ico|png|svg)", "/.*\.(jpg|png|svg|css|js)"];

  public GET(request: Drash.Request, response: Drash.Response) {
    const path = new URL(request.url).pathname;
    return response.file(`./public/${path}`);
  }
}