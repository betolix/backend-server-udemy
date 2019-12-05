var express = require("express");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require("../models/usuario");

// POSTGRES
const pool = require('../db');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require('../middlewares/autenticacion');

//==================================================
// Autenticación de Google
//==================================================
app.get('/renuevatoken', mdAutenticacion.verificaToken , ( req, res ) => {

  var token = jwt.sign( { usuario: req.usuario }, SEED, { expiresIn: 14400 } ); // 4 HORAS

  res.status(200).json({
    ok: true,
    token: token
  });


});


//==================================================
// Autenticación de Google
//==================================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();
  //  const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture, //Image URL
    google: true
  }
}


app.post('/google', async (req, res) => {

  var token = req.body.token;

  var googleUser = await verify( token )
      .catch( e => {
        return res.status(403).json({
          ok: false,
          mensaje: 'Token no válido'
        });
      })

      console.log('googleUser ', googleUser.body);


      // Usuario.findOne( { email: googleUser.email}, ( err, usuarioDB ) => {
      pool.query('select _id, nombre, email, password, img, role, google from usuario WHERE email = $1 ORDER BY _id ASC', [googleUser.email], (err, usuarioDB) => {

        console.log('err ', err);
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario',
            errors: err
          });
        }

        if (usuarioDB.rowCount > 0) {
          if ( usuarioDB.rows.google === false ){

            return res.status(400).json({
              ok: false,
              mensaje: 'Debe usar su autenticación normal'
            });
          } else {

            console.log('usuarioDB.rows[0] ',usuarioDB.rows[0]);
            var token = jwt.sign( { usuario: usuarioDB.rows[0] }, SEED, { expiresIn: 14400 } ); // 4 HORAS

            res.status(200).json({
                ok: true,
                usuario: usuarioDB.rows[0],
                token: token,
                id: usuarioDB.rows[0]._id,
                menu: obtenerMenu( usuarioDB.rows[0].role )
              });

          }
        } else {
          // EL USUARIO NO EXISTE, HAY QUE CREARLO
          var usuario = new Usuario();

          usuario.nombre = googleUser.nombre;
          usuario.email = googleUser.email;
          usuario.img = googleUser.img;
          usuario.google = true;
          usuario.password = ':)';

          console.log('googleUser.nombre ', googleUser.nombre);
          

          // usuario.save( (err, usuarioDB) => {
          pool.query('INSERT INTO public.usuario( nombre, email, password, role, img, google) VALUES ($1,$2,$3,$4,$5,$6) returning *', [usuario.nombre, usuario.email, usuario.password, usuario.role, usuario.img, false ], (error, usuarioDB) => {

            console.log('error ', error);
            console.log('usuarioDB.rows  ', usuarioDB.rows );

            var token = jwt.sign( { usuario: usuarioDB.rows[0] }, SEED, { expiresIn: 14400 } ); // 4 HORAS

            res.status(200).json({
                ok: true,
                usuario: usuarioDB.rows[0],
                token: token,
                id: usuarioDB.rows._id,
                menu: obtenerMenu( usuarioDB.role )
              });
            



          } );
        }





      } )




  // return res.status(200).json({
  //   ok: true,
  //   mensaje: 'OK!!!',
  //   googleUser: googleUser
  // });


});




//==================================================
// Autenticación Normal
//==================================================
app.post('/', ( req, res) => {

  var id = req.params.id;
  var body = req.body;
  // console.log('body ', req.body);

    // Usuario.findOne({ email: body.email }, (err, usuarioDB ) => {
    pool.query('select _id, nombre, email, password, img, role from usuario WHERE email= $1 ', [body.email], (err, usuarioDB) => {


        // console.log('usuarioDB.rows ', usuarioDB.rows);
        // console.log('err ', err);

        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al buscar usuario',
              errors: err
            });
        }

        if ( usuarioDB.rowCount == 0 ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
              });

        }

        if( !bcrypt.compareSync( body.password, usuarioDB.rows[0].password ) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
              });

        }
        usuarioDB.rows[0].password=':)';

        // Crear un token!!!
        console.log('// Crear un token!!!');
        console.log('usuarioDB.rows[0] ', usuarioDB.rows[0]);
        var token = jwt.sign( { usuario: usuarioDB.rows[0] }, SEED, { expiresIn: 14400 } ); // 4 HORAS
        

        res.status(200).json({
            ok: true,
            usuario: usuarioDB.rows[0],
            token: token,
            id: usuarioDB.rows[0]._id,
            menu: obtenerMenu( usuarioDB.rows[0].role )
          });

    })

} );



function obtenerMenu( ROLE ) {

  var menu = [
    {
      titulo: 'Principal',
      icono: 'mdi mdi-gauge',
      submenu: [
        { titulo: 'Dashboard', url: '/dashboard'},
        { titulo: 'ProgressBar', url: '/progress'},
        { titulo: 'Gráficas', url: '/graficas1'},
        { titulo: 'Promesas', url: '/promesas'},
        { titulo: 'RxJs', url: '/rxjs'}
      ]
    },
    {
      titulo: 'Mantenimientos',
      icono: 'mdi mdi-folder-lock-open',
      submenu: [
        // { titulo: 'Usuarios', url: '/usuarios' },
        { titulo: 'Hospitales',  url: '/hospitales' },
        { titulo: 'Médicos', url: '/medicos' }
      ]
    }
  ];

  console.log( 'ROLE: ',ROLE );

  if( ROLE === 'ADMIN_ROLE' ){
    menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );
  }

  return menu;
}


module.exports = app;