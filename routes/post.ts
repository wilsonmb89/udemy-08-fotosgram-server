import { Router, Request, Response } from 'express';
import { validateToken } from '../middlewares/tokenValidation';
import { Post } from '../models/post.model';
import { PostImage } from '../models/post-image.model';
import { FileUpload } from '../interfaces/file-upload';
import FileSystem from '../classes/file-system';

/** Dependencies */
const fileSystem = new FileSystem();

/**
 * Controller Definition
 */
const postRoutes = Router();

/**
 * Operations
 */

 /**
  * Crear Post
  */
postRoutes.post('/create', validateToken, (req: any, res: Response) => {
  const postCreate = req.body;
  postCreate.usuario = req.usuario._id;
  Post.create(postCreate)
    .then(
      async postDB => {
        await postDB.populate('usuario', '-password').execPopulate();
        res.json({ ok: true, post: postDB });
      }
    )
    .catch( error => { res.json({ ok: true, error }); });
});

/**
 * Obtener los post almacenados en la base de datos
 */
postRoutes.get('/getPosts', validateToken, (req: any, res: Response) => {
  const page = Number(req.query.page) || 1;
  const resultsPerPage = Number(req.query.resultsPerPage) || 10;
  const skip = (page - 1) * resultsPerPage;
  Post.find()
    .populate('usuario', '-password')
    .populate('img')
    .sort({ _id: -1 }) // Ordenamiento por _id de forma descendente
    .skip(skip) // Registros a saltar
    .limit(resultsPerPage) // Solo obtiene los 10 primeros
    .then(
      postResults => {
        res.json({ ok: true, page, resultsPerPage, posts: postResults });
      }
    )
    .catch(error => { res.status(500).json({ ok: false, error }); });
});

/**
 * Obtener un post almacenado en la base de datos
 */
postRoutes.get('/getPost', validateToken, (req: any, res: Response) => {
  const postId = req.query.postId;
  if (!!postId) {
    Post.findById(req.query.postId)
      .then(
        async postDB => { 
          if (!!postDB) {
            await postDB.populate('usuario').execPopulate();
            await postDB.populate('img').execPopulate();
            return res.json({ ok: true, post: postDB});
          }
          return res.status(404).json({ ok: false, mensaje: 'No existe ningun post con el id'});
        }
      )
      .catch(
        error => { res.status(500).json({ ok: false, error }); }
      );
  }
  res.status(404).json({ ok: false, mensaje: 'No se encontró ningún id'});
});

/**
 * Almacena una imagen el un post definido
 */
postRoutes.post('/uploadPostImage', [validateToken], (req: any, res: Response) => {
  const postId = req.body.postId;
  if (!postId) {
    return res.status(400).json({ ok: false, mensaje: 'Es necesario el id del post'});
  }
  if (!req.files) {
    return res.status(400).json({ ok: false, mensaje: 'No se subió ningún archivo'});
  }
  const file: FileUpload = req.files.image;
  if (!file) {
    return res.status(400).json({ ok: false, mensaje: 'No se subió ningún archivo - image'});
  }
  if (!file.mimetype.includes('image')) {
    return res.status(400).json({ ok: false, mensaje: 'Lo que se subió no fué una imagen'});
  }
  Post.findById(postId)
    .then(
      async postBD => {
        let systemFileName = '';
        let imageFile = null;
        if (!!postBD && !!postBD.img && postBD.img.length > 0) {
          await postBD.populate('img').execPopulate();
          const fileName = file.name.split('.')[0];
          imageFile = postBD.img.find((savedImg) => savedImg.fileName === fileName);
          if (!!imageFile) {
            systemFileName = `${imageFile.fileSystemName}.${imageFile.extension}`;
          }
        }
        const fileSaved = fileSystem.storePostImage(file, req.usuario._id, postId, systemFileName);
        if (!!fileSaved && !(!!systemFileName)) {
          PostImage.create(fileSaved)
            .then(
              async postImgSave => {
                const postBD = await Post.findById(postId);
                if (!!postBD) {
                  const postImages = postBD.img;
                  postImages.push(postImgSave);
                  const postUpdate = await Post.findById(postId).update({ img: postImages });
                  if (!!postUpdate) {
                    return res.json({ ok: true, fileSaved: postImgSave });
                  }
                }
                res.status(404).json({ ok: false, error: 'No existe un post con el id ingresado' });
              }
            )
            .catch(error => { res.status(400).json({ ok: false, error }); });
        } else if (!!fileSaved && !!systemFileName) {
          return res.json({ ok: true, fileSaved: imageFile });
        } else {
          res.status(500).json({ ok: false, error: 'No fue posible guardar la imagen en el servidor' });
        }
      }
    )
    .catch(error => { res.status(500).json({ ok: false, error }); });
});

postRoutes.get('/getImage/:userId/:postId/:imageName', (req: any, res: Response) => {
  const userId = req.params.userId;
  const postId = req.params.postId;
  const imageName = req.params.imageName;
  const imageUrl = fileSystem.resolveSystemImageURL(userId, postId, imageName);
  res.sendFile(imageUrl);
});

export default postRoutes;