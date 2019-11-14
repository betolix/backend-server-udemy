var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// POSTGRES
const pool = require('../db');

// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// Rutas

//==================================================
// Obtener todos los usuarios
//==================================================
/*
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, 'nombre email img role google ')
  .skip(desde)
  .limit(5)
  .exec(  
    
    (err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando usuario',
        errors: err
      });
    }

    Usuario.count({}, (err, conteo) => {

      res.status(200).json({
        ok: true,
        usuarios: usuarios,
        total: conteo
      });

    } )

    

  });
});
*/

//==================================================
// Obtener todos los usuarios POSTGRES OK
//==================================================
app.get("/", (req, res, next) => {

  // console.log('Weeeee');
  pool.query('select _id, nombre, email  , password, img, role, google from usuario ORDER BY _id ASC', (error, response) => {
    if (error ) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando usuario',
        errors: error
      });
    }
    // console.log(response.rows);
    res.status(200).json({
      ok: true,
      usuarios: response.rows,
      total: response.rowCount
    });

  });

});




// //==================================================
// // Actualizar usuario
// //==================================================
// app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario ] ,(req, res) => {

//   var id = req.params.id;
//   var body = req.body;

//   Usuario.findById( id, (err, usuario) => {
//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: "Error al buscar usuario",
//         errors: err
//       });
//     }

//     if ( !usuario ) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'El usuari con el id ' + id + 'no existe',
//         errors: { message: 'No existe un usuario con ese ID' }
//       });
//     }

//     usuario.nombre = body.nombre;
//     usuario.email = body.email;
//     usuario.role = body.role;

//     usuario.save( (err, usuarioGuardado) => {
//       if (err) {
//         return res.status(400).json({
//           ok: false,
//           mensaje: "Error al actualizar usuario",
//           errors: err
//         });
//       }

//       usuarioGuardado.password = ':)';

//       res.status(200).json({
//         ok: true,
//         usuario: usuarioGuardado
//       });


//     } );


//   } );

// } );

//==================================================
// Actualizar usuario POSTGRES OK
//==================================================
app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario ], (req, res) => {
 
  var id = req.params.id;
  var body = req.body;

  //Usuario.findById( id, (err, usuario) => {
  pool.query('select _id, nombre, email, password, img, role, google  from usuario WHERE _id= $1 ORDER BY _id ASC', [id], (err, usuario) => {
    if (err) {
      // console.log('Weeerr: ', err);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if ( usuario.rowCount == 0 ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id ' + id + ' no existe',
        errors: { message: 'No existe un usuario con ese ID' }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    // usuario.save( (err, usuarioGuardado) => {
      pool.query('UPDATE usuario SET nombre=$1, role=$2 WHERE _id= $3 RETURNING *', [body.nombre, body.role, id], (error, usuarioGuardado) => {
      if (error) {
        // console.log(error);
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err
        });
      }

      usuarioGuardado.rows[0].password = ':)';

      //console.log(usuarioGuardado.rows[0].password);
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado.rows
      });


    } );


  } );

} );

// //==================================================
// // Crear un nuevo usuario
// //==================================================
// app.post('/', /* mdAutenticacion.verificaToken ,*/ (req, res) => {

//     var body = req.body;

//     var usuario = new Usuario({
//         nombre: body.nombre,
//         email: body.email,
//         password: bcrypt.hashSync( body.password, 10),
//         img: body.img,
//         role: body.role
//     });

//     usuario.save( (err, usuarioGuardado ) => {

//         if (err) {
//             return res.status(400).json({
//               ok: false,
//               mensaje: "Error al crear usuario",
//               errors: err
//             });
//           }

//           res.status(201).json({
//             ok: true,
//             usuario: usuarioGuardado,
//             usuariotoken: req.usuario
//           });

//     }  );

// } )


//==================================================
// Crear un nuevo usuario POSTGRES OK
//==================================================
app.post('/',  mdAutenticacion.verificaToken , (req, res) => {

  var body = req.body;

  var usuario = new Usuario({
      nombre: body.nombre,
      email: body.email,
      password: bcrypt.hashSync( body.password, 10),
      img: body.img,
      role: body.role
  });

  // usuario.save( (err, usuarioGuardado ) => {
  pool.query('INSERT INTO public.usuario( nombre, email, password, role, img, google) VALUES ($1,$2,$3,$4,$5, $6) returning *', [usuario.nombre, usuario.email, usuario.password, usuario.role, usuario.img, false ], (error, usuarioGuardado) => {

      if (error) {
        console.log(error);
          return res.status(400).json({
            ok: false,
            mensaje: "Error al crear usuario",
            errors: error
          });
        }

        res.status(201).json({
          ok: true,
          usuario: usuarioGuardado.rows,
          usuariotoken: req.usuario
        });

  }  );

} )




// //==================================================
// // Borrar un usuario por el id
// //==================================================

// app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE] , (req, res) => {

//   var id = req.params.id;
//   Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: "Error al borrar usuario",
//         errors: err
//       });
//     }

//     if ( !usuarioBorrado ) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'No existe un usuario con ese id',
//         errors: { message: 'No existe un usuario con ese id' }
//       });
//     }




//     res.status(200).json({
//       ok: true,
//       usuario: usuarioBorrado
//     });

//   });


// })

//==================================================
// Borrar un usuario por el id POSTGRES
//==================================================

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE], (req, res) => {

  var id = req.params.id;
  // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
  pool.query( 'DELETE FROM usuario WHERE _id=($1) RETURNING *', [id], (err, response) => { // res
    
    
    if (err) {
      console.log('err', err);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: err
      });
    }

    if ( response.rowCount == 0  ) {
      // console.log('usuarioBorrado.usuario === null');
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese id',
        errors: { message: 'No existe un usuario con ese id' }
      });
    }

    response.rows[0].password = ':)';

    return res.status(200).json({
      ok: true,
      usuario: response.rows
    });

  });


})



module.exports = app;
