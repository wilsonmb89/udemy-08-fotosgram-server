import jwt from 'jsonwebtoken';

export default class Token {

  private static seed: string = 'semilla-para-jwt-esto-debe-ser-secreto';
  private static caducidad: string = '1d';

  constructor() {}

  static getJwtToken(payload: any): string {
    return jwt.sign(
      {
        usuario: payload
      },
      this.seed,
      {
        expiresIn: this.caducidad
      }
    );
  }

  static validateJwt(userJWT: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(userJWT, this.seed, (error, decoded) => {
        if (!!error) {
          reject(error);
        } else {
          resolve(decoded);
        }
      });
    });
  }
}
