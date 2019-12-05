var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options MIDDLEWARE
app.use(fileUpload());

// POSTGRES
const pool = require('../db');



// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // TIPOS DE COLECCION
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if ( tiposValidos.indexOf( tipo ) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: {message: 'Tipo de colección no es válida'}
          });

    }

    if (!req.files) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No selecciono nada',
          errors: {message: 'Debe seleccionar una imagen'}
        });
      }

      // OBTENER NOMBRE DEL ARCHIVO
      var archivo = req.files.imagen;
      var nombreCortado = archivo.name.split('.');
      var extensionArchivo = nombreCortado[ nombreCortado.length -1 ];

      // SOLO ACEPTAMOS ESTAS EXTENSIONES
      var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

      if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ){

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ')}
        });
      }


      // NOMBRE DE ARCHIVO PERSONALIZADO
      //123123123332-123.png
      var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo }`;
      //console.log('nombreArchivo ',nombreArchivo);

      // MOVER EL ARCHIVO DEL TEMPORAL A UN PATH ESPECIFICO
      var path = `./uploads/${ tipo }/${ nombreArchivo }`;

      archivo.mv( path, err => {

        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // })


      } );

} );



function subirPorTipo( tipo, id, nombreArchivo, res) {

    if ( tipo === 'usuarios') {

        // Usuario.findById(id, (err, usuario) => {
        pool.query('select _id, nombre, email, password, img, role, google  from usuario WHERE _id= $1 ', [id], (err, usuario) => {

            if( usuario.rowCount == 0 ){

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe', err}
                })

            }
            
            var pathViejo = './uploads/usuarios/' + usuario.rows[0].img;
            console.log('pathViejo ', pathViejo);
            

            // Si existe, elimina la imagen anterior
            if (fs.existsSync( pathViejo ) ){
                fs.unlink( pathViejo, (err) => {

                    console.log('unlinking...');
                    if (err) {
                        console.log('Error en unlinking...');
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'No se pudo eliminar la imagen',
                            errors: err
                        });
                    }
                    
                } );
            }

            usuario.img = nombreArchivo;
            console.log('nombreArchivo ', nombreArchivo);

            //usuario.save( (err, usuarioActualizado) => {

            // *** IMPORTANTE: FALTA DEFINIR SI SE GUARDARA EN LA BD EL NOMBRE DE LA IMAGEN O LA IMAGEN MISMA
            // *** IMPORTANTE: FALTA DEFINIR SI SE GUARDARA EN LA BD EL NOMBRE DE LA IMAGEN O LA IMAGEN MISMA
            // *** IMPORTANTE: FALTA DEFINIR SI SE GUARDARA EN LA BD EL NOMBRE DE LA IMAGEN O LA IMAGEN MISMA
            // *** IMPORTANTE: FALTA DEFINIR SI SE GUARDARA EN LA BD EL NOMBRE DE LA IMAGEN O LA IMAGEN MISMA

            pool.query('UPDATE usuario SET img=$1 WHERE _id=($2) RETURNING *', [nombreArchivo, id], (error, usuarioActualizado) => {
                // console.log('error ', error);
                usuarioActualizado.rows[0].password = ':)';
                // console.log('usuarioActualizado ', usuarioActualizado.rows);
                

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado.rows[0]
                })

            } );


        });
        
    }



    if ( tipo === 'medicos') {

        // Medico.findById(id, (err, medico) => {
        pool.query('select _id, nombre, img  FROM medico WHERE _id= $1 ', [id], (err, medico) => {

            if( medico.rowCount == 0 ){

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                })

            }
            
            var pathViejo = './uploads/medicos/' + medico.rows[0].img;           

            // Si existe, elimina la imagen anterior
            if (fs.existsSync( pathViejo ) ){
                fs.unlink( pathViejo, (err) => {

                    // console.log('unlinking...');
                    if (err) {
                        // console.log('Error en unlinking...');
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'No se pudo eliminar la imagen',
                            errors: err
                        });
                    }
                    
                } );
            }

            medico.img = nombreArchivo;

            // medico.save( (err, medicoActualizado) => {
            pool.query('UPDATE medico SET img=$1 WHERE _id=($2) RETURNING *', [nombreArchivo, id], (error, medicoActualizado) => {

                // medicoActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado.rows
                })

            } );

            
        });

        
        
    }

    if ( tipo === 'hospitales') {

        // Hospital.findById(id, (err, hospital) => {
        pool.query('select _id, img, nombre_hospital FROM hospital WHERE _id= ($1) ', [id], (err, hospital) => {

            console.log('hospital ', hospital);
            console.log('err ', err);

            if( hospital.rowCount == 0 ){

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'Hospital no existe'}
                })

            }
            
            var pathViejo = './uploads/hospitales/' + hospital.rows[0].img;
            

            // Si existe, elimina la imagen anterior
            if (fs.existsSync( pathViejo ) ){
                fs.unlink( pathViejo, (err) => {

                    // console.log('unlinking...');
                    if (err) {
                        // console.log('Error en unlinking...');
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'No se pudo eliminar la imagen',
                            errors: err
                        });
                    }
                    
                } );
            }

            hospital.img = nombreArchivo;

            // hospital.save( (err, hospitalActualizado) => {
            pool.query('UPDATE hospital SET img=$1 WHERE _id=($2) RETURNING *', [nombreArchivo, id], (error, hospitalActualizado) => {

                // hospitalActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado.rows
                })

            } );

            
        });


    }
       
        
}


module.exports = app;