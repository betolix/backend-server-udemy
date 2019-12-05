var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// POSTGRES
const pool = require('../db');

// Rutas


/*
//==================================================
// Obtener todos los medicos MONGODB
//==================================================
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
  .exec(  
    
    (err, medicos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando medico',
        errors: err
      });
    }

    Medico.count({}, (err, conteo) =>  {

      res.status(200).json({
        ok: true,
        medicos: medicos,
        total: conteo
      });

    });    

  });
});
*/

//==================================================
// Obtener todos los medicos POSTGRES OK
//==================================================
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  //   Medico.find({})
  //   .skip(desde)
  //   .limit(5)
  //   .populate('usuario', 'nombre email')
  //   .populate('hospital')
  // .exec(  


  pool.query('select medico._id, medico.nombre AS "NOMBRE MEDICO", medico.img, usuario.nombre_usuario as "USUARIO CREADOR", hospital.nombre_hospital FROM medico INNER JOIN usuario ON medico.fk_id_usuario_creador = usuario._id INNER JOIN hospital ON medico.fk_id_hospital = hospital._id', // (err, hospitales) => {
  
    (err, medicos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando medico',
        errors: err
      });
    }

    // Medico.count({}, (err, conteo) =>  {
    //   });

    res.status(200).json({
      ok: true,
      medicos: medicos.rows,
      total: medicos.rowCount

    });    

  });
});

// //==================================================
// // Obtener medico MONGODB
// //==================================================

// app.get('/:id', (req, res) => {

//   var id = req.params.id;

//   Medico.findById( id )
//     .populate( 'usuario', 'nombre email img' )
//     .populate( 'hospital' )
//     .exec( (err, medico) => {



//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: "Error al buscar medico",
//           errors: err
//         });
//       }
  
//       if ( !medico ) {
//         return res.status(400).json({
//           ok: false,
//           mensaje: 'El medico con el id ' + id + 'no existe',
//           errors: { message: 'No existe un medico con ese ID' }
//         });
//       }

//       res.status(200).json({
//         ok: true,
//         medico: medico
//       });



//     });

// });


//==================================================
// Obtener medico POSTGRES
//==================================================

app.get('/:id', (req, res) => {

  var id = req.params.id;
  console.log('req.params.id ', req);

  // Medico.findById( id )
  //   .populate( 'usuario', 'nombre email img' )
  //   .populate( 'hospital' )
  //   .exec( (err, medico) => {
  
  pool.query('select medico._id, medico.nombre AS "NOMBRE MEDICO", medico.img, usuario.nombre_usuario as "USUARIO CREADOR", hospital.nombre_hospital FROM medico INNER JOIN usuario ON medico.fk_id_usuario_creador = usuario._id INNER JOIN hospital ON medico.fk_id_hospital = hospital._id WHERE medico._id =($1)', [id], (err, medico) => {

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar medico",
          errors: err
        });
      }
  
      if ( medico.rowCount == 0 ) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El medico con el id ' + id + 'no existe',
          errors: { message: 'No existe un medico con ese ID' }
        });
      }

      res.status(200).json({
        ok: true,
        medico: medico.rows
      });



    });

});



// //==================================================
// // Actualizar medico MONGODB
// //==================================================
// app.put('/:id', mdAutenticacion.verificaToken ,(req, res) => {

//   var id = req.params.id;
//   var body = req.body;

//   Medico.findById( id, (err, medico) => {
//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: "Error al buscar medico",
//         errors: err
//       });
//     }

//     if ( !medico ) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'El medico con el id ' + id + 'no existe',
//         errors: { message: 'No existe un medico con ese ID' }
//       });
//     }

//     medico.nombre = body.nombre;
//     medico.usuario = req.usuario._id;
//     medico.hospital = body.hospital;
    

//     medico.save( (err, medicoGuardado) => {
//       if (err) {
//         return res.status(400).json({
//           ok: false,
//           mensaje: "Error al actualizar medico",
//           errors: err
//         });
//       }


//       res.status(200).json({
//         ok: true,
//         medico: medicoGuardado
//       });


//     } );


//   } );

// } );


//==================================================
// Actualizar medico POSTGRES OK
//==================================================
app.put('/:id', mdAutenticacion.verificaToken ,(req, res) => {

  var id = req.params.id;
  var body = req.body;

  // Medico.findById( id, (err, medico) => {
  pool.query('select medico._id, medico.nombre AS "NOMBRE MEDICO", medico.img, usuario.nombre_usuario as "USUARIO CREADOR", hospital.nombre_hospital FROM medico INNER JOIN usuario ON medico.fk_id_usuario_creador = usuario._id INNER JOIN hospital ON medico.fk_id_hospital = hospital._id WHERE hospital._id= $1 ORDER BY _id ASC', [id], (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar medico",
        errors: err
      });
    }

    if ( medico.rowCount == 0 ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El medico con el id ' + id + 'no existe',
        errors: { message: 'No existe un medico con ese ID' }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;
    

    //medico.save( (err, medicoGuardado) => {
    pool.query('UPDATE medico SET nombre=$1, fk_id_usuario_creador=$2, fk_id_hospital=$3 WHERE _id= $4 RETURNING *', [medico.nombre, medico.usuario, medico.hospital, id], (err, medicoGuardado) => {
      console.log('err ', err);
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar medico",
          errors: err
        });
      }


      res.status(200).json({
        ok: true,
        medico: medicoGuardado.rows
      });


    } );


  } );

} );





/*
//==================================================
// Crear un nuevo medico MONGODB
//==================================================
app.post('/', mdAutenticacion.verificaToken , (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado ) => {

        if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error al crear medico",
              errors: err
            });
          }

          res.status(201).json({
            ok: true,
            medico: medicoGuardado
          });

    }  );

} )

*/


//==================================================
// Crear un nuevo medico POSTGRES OK
//==================================================
app.post('/', mdAutenticacion.verificaToken , (req, res) => {

  var body = req.body;

  var medico = new Medico({
      nombre: body.nombre,
      usuario: req.usuario._id,
      hospital: body.hospital
  });

  console.log('medico.nombre ', medico.nombre);
  console.log('req.usuario._id', req.usuario._id);
  console.log('medico.usuario', medico.usuario);

  console.log('medico.hospital', medico.hospital);

  // medico.save( (err, medicoGuardado ) => {
  pool.query('INSERT INTO public.medico( nombre, img, fk_id_usuario_creador, fk_id_hospital) VALUES ($1,$2,$3,$4) returning *', [medico.nombre, null, req.usuario._id, body.hospital], (err, medicoGuardado) => {
      console.log('err ', err);
      if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al crear medico",
            errors: err
          });
        }

        res.status(201).json({
          ok: true,
          medico: medicoGuardado.rows
        });

  }  );

} );



//==================================================
// Borrar un medico por el id
//==================================================

app.delete('/:id', mdAutenticacion.verificaToken , (req, res) => {

  var id = req.params.id;
  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar medico",
        errors: err
      });
    }

    if ( !medicoBorrado ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con ese id',
        errors: { message: 'No existe un medico con ese id' }
      });
    }




    res.status(200).json({
      ok: true,
      usuario: medicoBorrado
    });

  });


})



module.exports = app;