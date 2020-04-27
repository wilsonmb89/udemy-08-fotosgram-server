import { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';

/** Propiedades */
const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es necesario']
  },
  avatar: {
    type: String,
    default: 'av-1.png'
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'El correo es necesario']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es necesaria']
  }
});

/** Metodos */
usuarioSchema.method('checkPassword', function(password: string): boolean {
  return bcrypt.compareSync(password, this.password); // Si sale error por el this ajustar a "noImplicitThis": false en tsconfig.json
});

interface IUsuario extends Document {
  nombre: string;
  avatar: string;
  email: string;
  password: string;

  checkPassword(password: string): boolean;
}

export const Usuario = model<IUsuario>('Usuario', usuarioSchema);