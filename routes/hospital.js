var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// POSTGRES
const pool = require('../db');

// Rutas



/*
//==================================================
// Obtener todos los hospitales MONGODB
//==================================================
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)   // SI SE DESEA OBTENER TODOS LOS HOSPITALES COMENTAR ESTA LINEA
    .populate('usuario', 'nombre email')
    .exec(

      (err, hospitales) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando hospital',
            errors: err
          });
        }

        Hospital.count({}, (err, conteo) => {

          res.status(200).json({
            ok: true,
            hospitales: hospitales,
            total: conteo
          });

        });



      });
});
*/

//==================================================
// Obtener todos los hospitales POSTGRES OK
//==================================================
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;   // VIENE EN EL REQUEST
  //var desde = req.body.desde || 0;  // VIENE EN EL BODY  
  desde = Number(desde);
  lim = Number(5); //ESTE VALOR ES EL LIMITE DE RESPUESTAS DEL QUERY A LA BD

  //console.log('desde ', desde);

  // Hospital.find({})
  //   .skip(desde)
  //   .limit(5)   // SI SE DESEA OBTENER TODOS LOS HOSPITALES COMENTAR ESTA LINEA
  //   .populate('usuario', 'nombre email')
  //   .exec(


  pool.query('select hospital._id, hospital.nombre_hospital, hospital.fk_id_usuario, usuario._id, usuario.nombre_usuario from hospital INNER JOIN usuario ON hospital.fk_id_usuario = usuario._id ORDER BY hospital._id ASC OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY', [desde, lim], // (err, hospitales) => {

      
      (err, hospitales) => {
        // console.log('err ', err);
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando hospital',
            errors: err
          });
        }

        // Hospital.count({}, (err, conteo) => {

        // console.log('hospitales ',hospitales)
        res.status(200).json({
          ok: true,
          hospitales: hospitales.rows,
          total: hospitales.rowCount
          });

        });

});






/*

// ========================================== 
// Obtener Hospital por ID MONGODB
// ========================================== 
app.get('/:id', (req, res) => {
  var id = req.params.id;
  Hospital.findById(id)
    .populate('usuario', 'nombre img email').exec((err, hospital) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar hospital',
          errors: err
        });
      }
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El hospital con el id ' + id + ' no existe ',
          errors: { message: 'No existe un hospital con es ID' }
          });
      }
      res.status(200).json({
        ok: true,
        hospital: hospital
      });
    })

})

*/



// ========================================== 
// Obtener Hospital por ID POSTGRES OK
// ========================================== 
app.get('/:id', (req, res) => {
  var id = req.params.id;

  //Hospital.findById(id)
  //  .populate('usuario', 'nombre img email').exec((err, hospital) => {
  
  pool.query('select hospital._id, nombre_hospital, fk_id_usuario, usuario.nombre_usuario from hospital INNER JOIN usuario ON hospital.fk_id_usuario = usuario._id WHERE hospital._id= $1 ORDER BY _id ASC', [id], (err, hospital) => {
      if (err) {
        console.log('err ', err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar hospital',
          errors: err
        });
      }
      if (hospital.rowCount == 0 ) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El hospital con el id ' + id + ' no existe ',
          errors: { message: 'No existe un hospital con es ID' }
          });
      }
      console.log('hospital.rows ', hospital.rows);
      res.status(200).json({
        ok: true,
        hospital: hospital.rows
      });
    })

})




/*
//==================================================
// Actualizar hospital MONGODB
//==================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        errors: err
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El hospital con el id ' + id + 'no existe',
        errors: { message: 'No existe un hospital con ese ID' }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;


    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err
        });
      }


      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });


    });


  });

});

*/


//==================================================
// Actualizar hospital POSTGRES OK
//==================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  // Hospital.findById(id, (err, hospital) => {
  pool.query('SELECT hospital._id, nombre_hospital, fk_id_usuario FROM hospital WHERE hospital._id= $1 ORDER BY _id ASC', [id], (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        errors: err
      });
    }

    if (hospital.rowCount == 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El hospital con el id ' + id + 'no existe',
        errors: { message: 'No existe un hospital con ese ID' }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;


    //hospital.save((err, hospitalGuardado) => {
    pool.query('UPDATE hospital SET nombre_hospital=$1, fk_id_usuario=$2 WHERE _id= $3 RETURNING *', [hospital.nombre, hospital.usuario, id], (err, hospitalGuardado) => {
      
      // console.log('err ', err);
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err
        });
      }


      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado.rows
      });


    });


  });

});






/*
//==================================================
// Crear un nuevo hospital MONGODB
//==================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear hospital",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });

  });

})
*/

//==================================================
// Crear un nuevo hospital POSTGRES OK
//==================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  // console.log('req ', req);
  console.log('req.usuario._id ', req.usuario._id);
  var body = req.body;

  var hospital = new Hospital({
    nombre_hospital: body.nombre_hospital,
    usuario: req.usuario._id
  });

  //hospital.save((err, hospitalGuardado) => {
  pool.query('INSERT INTO public.hospital( img, nombre_hospital, fk_id_usuario) VALUES ($1,$2,$3) returning *', [null, hospital.nombre_hospital, req.usuario._id ], (err, hospitalGuardado) => {

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear hospital",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado.rows[0]
    });

  });

});


/*
//==================================================
// Borrar un hospital por el id  MONGODB
//==================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: err
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con ese id',
        errors: { message: 'No existe un hospital con ese id' }
      });
    }




    res.status(200).json({
      ok: true,
      usuario: hospitalBorrado
    });

  });


})


*/

//==================================================
// Borrar un hospital por el id POSTGRES OK
//==================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  // Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
  pool.query( 'DELETE FROM hospital WHERE _id=($1) RETURNING *', [id], (err, hospitalBorrado) => {
    
    // console.log('err ', err);
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: err
      });
    }

    if (hospitalBorrado.rows == 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con ese id',
        errors: { message: 'No existe un hospital con ese id' }
      });
    }

    res.status(200).json({
      ok: true,
      usuario: hospitalBorrado.rows
    });

  });


})





module.exports = app;
