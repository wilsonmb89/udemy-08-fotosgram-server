import { Schema, Document, model } from 'mongoose';

const postImageSchema = new Schema({
  fileSystemName: {
    type: String,
    required: [true, 'Debe tener un id unico del filesystem']
  },
  fileName: {
    type: String,
    required: [true, 'Debe tener un nombre de archivo']
  },
  extension: {
    type: String,
    required: [true, 'Debe tener una extension']
  }
});

interface IPostImage extends Document {
  fileSystemName: string;
  fileName: string;
  extension: string;
}

export const PostImage = model<IPostImage>('PostImage', postImageSchema);