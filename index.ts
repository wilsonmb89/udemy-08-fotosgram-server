import Server from './classes/server';
import userRoutes from './routes/usuario';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import securityRoutes from './routes/security';

const server = new Server();

/** Set conections */
mongoose.connect('mongodb://localhost:27017/fotosgram', 
                  { useNewUrlParser: true, useCreateIndex: true},
                  (err) => {
                    if (!!err) {
                      throw err;
                    } else {
                      console.log('Base de datos ONLINE');
                    }
                  });

/** Set bodyParser */
server.app.use(bodyParser.urlencoded({extended: true}));
server.app.use(bodyParser.json());

/** Set Controllers */
server.app.use('/user', userRoutes);
server.app.use('/security', securityRoutes);

// Server Init
server.start(
  () => {
    console.info(`Init server in ${server.port} port.`)
  }
);
