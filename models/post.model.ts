import { Schema, Document, model} from 'mongoose';
import { FileUpload } from '../interfaces/file-upload';

const postSchema = new Schema({
  created: {
    type: Date
  },
  mensaje: {
    type: String
  },
  img: [{
    type: Schema.Types.ObjectId,
    ref: 'PostImage'
  }],
  coords: {
    type: String
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'Debe existir una referencia a un usuario']
  }
});

postSchema.pre<IPost>('save', function(next) {
  this.created = new Date(); // Si sale error por el this ajustar a "noImplicitThis": false en tsconfig.json
  next();
});

interface IPost extends Document {
  created: Date;
  mensaje: string;
  img: any[];
  coords: string;
  usuario: string;
}

export const Post = model<IPost>('Post', postSchema);