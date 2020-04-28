import { Response, NextFunction } from 'express';
import Token from '../classes/token';

export const validateToken = (req: any, res: Response, next: NextFunction) => {
  const userToken = req.get('x-token') || '';
  Token.validateJwt(userToken)
    .then(
      (decoded: any) => {
        req.usuario = decoded.usuario;
        next();
      }
    )
    .catch(
      error => {
        res.status(401).json({ok: false, mensaje:'Token invalido', error});
      }
    );
};