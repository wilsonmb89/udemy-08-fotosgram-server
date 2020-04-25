import { Router, Request, Response } from 'express';
import { Usuario } from '../models/usuario.model';
import Token from '../classes/token';

/** Controller Definition */
const securityRoutes = Router();

/** Operations */

/**
 * Metodo que realiza la verificacion de la contraseña del
 * usuario y la generacion del token
 */
securityRoutes.post('/login', (req: Request, res: Response) => {
  Usuario.findOne({email: req.body.email})
    .then(
      userDB => {
        if (!userDB) { return res.json({ok: false, mensaje: 'Usuario/Contraseña no son correctos'}); }
        if (userDB.checkPassword(req.body.password)) {
          const userToken = Token.getJwtToken({
            _id : userDB._id,
            nombre: userDB.nombre,
            mail: userDB.email,
            avatar: userDB.avatar
          });
          return res.json({ ok: true, user: userDB, token: userToken });
        }
        return res.json({ok: false, mensaje: 'Usuario/Contraseña no son correctos'});
      }
    )
    .catch(err => { res.json({of: false, error: err}) });
});

export default securityRoutes;