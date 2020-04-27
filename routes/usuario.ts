import { Router, Request, Response } from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import Token from '../classes/token';
import { validateToken } from '../middlewares/tokenValidation';

/** Controller definition */
const userRoutes = Router();

/** Operations */

/**
 * Crea un usuario en la base de datos
 */
userRoutes.post('/create', (req: Request, res: Response) => {
  const user = {
    nombre: req.body.nombre,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    avatar: req.body.avatar
  };
  Usuario.create(user)
    .then(
      userDB => {
        const userToken = Token.getJwtToken({
          _id : userDB._id,
          nombre: userDB.nombre,
          mail: userDB.email,
          avatar: userDB.avatar
        });
        res.json({ok: true, user: userDB, token: userToken});
      }
    ).catch(
      error => {
        res.json({ok: false, error});
      }
    );
});

userRoutes.post('/update', validateToken, (req: any, res: Response) => {
  const userUpdate = {
    nombre: req.body.nombre || req.usuario.nombre,
    email: req.body.email || req.usuario.email,
    avatar: req.body.avatar || req.usuario.avatar
  }
  Usuario.findByIdAndUpdate(req.usuario._id, userUpdate, { new: true })
    .then(
      userDB => {
        if (!userDB) { return res.json({ ok: false, mensaje: 'No existe un usuario con ese ID' })}
        const userToken = Token.getJwtToken({
          _id : userDB._id,
          userName: userDB.nombre,
          mail: userDB.email
        });
        res.json({ok: true, user: userDB, token: userToken});
      }
    )
    .catch(
      error => { res.json({ok: false, error}); }
    );
});

/**
 * Consulta a los usuarios de la base de datos o a un usuario especifico
 */
userRoutes.get('/getUser', (req: Request, res: Response) => {
  const userId = req.query.userId;

  if (!!userId) {
    // Opcion 1
    /* 
    Usuario.findById(userId, (err, userDB) => {
      if (!!err) { return res.json({ok: false, err}); }
      if (!userDB) { return res.json({ok: false, errorMsg: 'No existe en la base de datos'}); }
      return res.json({ok: true, user: userDB});
    });
    */
    // Opcion 2
    Usuario.findById(userId)
      .then(userDB => { res.json({ok: true, user: userDB}); })
      .catch(error => { res.json({ok: false, error}); });

  } else {
    // Opcion 1
    /* 
    Usuario.find((err, userDB) => {
      if (!!err) { return res.json({ok: false, err}); }
      if (!userDB) { return res.json({ok: false, errorMsg: 'No existen registros en la base de datos'}); }
      return res.json({ok: true, user: userDB});
    });
    */
    // Opcion 2
    Usuario.find()
      .then(userDB => { res.json({ok: true, user: userDB}); })
      .catch(error => { res.json({ok: false, error}); });
  }
});


userRoutes.get('/', [validateToken], (req: any, res: Response) => {
  const tokenData = req.usuario;
  return res.json({ ok: true, user: tokenData });
});

/** Controller export to express instance */
export default userRoutes;