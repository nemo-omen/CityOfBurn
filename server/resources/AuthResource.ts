import { Drash, authenticationService } from '../deps.ts';

export class AuthResource extends Drash.Resource {
  public paths = ['/auth'];

  GET(request: Drash.Request, response: Drash.Response): void {

  }
}