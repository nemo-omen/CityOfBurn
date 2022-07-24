import { Drash } from '../deps.ts';

export class AuthService extends Drash.Service {
  #users = new Map<string, string>([
    ['user-1', 'token-1'],
    ['user-2', 'token-2']
  ]);

  public runBeforeResource(request: Drash.Request, response: Drash.Response): void {
    const username = request.queryParam('username');
    if (!username) {
      throw new Drash.Errors.HttpError(
        401,
        "No username provided"
      );
    }

    const providedToken = request.queryParam('token');
    if (!providedToken) {
      throw new Drash.Errors.HttpError(
        401,
        'Token not provided.'
      );
    }

    const token = this.#users.get(username);

    if (token !== providedToken) {
      throw new Drash.Errors.HttpError(
        401,
        'Invalid credentials.'
      );
    }
  }
}

export const authService = new AuthService();