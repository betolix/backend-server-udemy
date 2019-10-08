var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options MIDDLEWARE
app.use(fileUpload());



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

        Usuario.findById(id, (err, usuario) => {

            if( !usuario ){

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                })

            }
            
            var pathViejo = './uploads/usuarios/' + usuario.img;
            

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

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                })

            } );


        });
        
    }



    if ( tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if( !medico ){

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                })

            }
            
            var pathViejo = './uploads/medicos/' + medico.img;
            

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

            medico.save( (err, medicoActualizado) => {

                // medicoActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                })

            } );

            
        });

        
        
    }

    if ( tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if( !hospital ){

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'Hospital no existe'}
                })

            }
            
            var pathViejo = './uploads/hospitales/' + hospital.img;
            

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

            hospital.save( (err, hospitalActualizado) => {

                // hospitalActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                })

            } );

            
        });


    }
       
        
}


module.exports = app;