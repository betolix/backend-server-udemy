var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');


// Rutas
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    console.log('req.params.tipo ', req.params.tipo);
    console.log('req.params.img ', req.params.img);

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    console.log('pathImagen ', pathImagen);

    if ( fs.existsSync( pathImagen ) ){

        res.sendFile( pathImagen );
    } else {
        var pathNoImagen = path.resolve( __dirname, '../assets/no-img.jpg' );
        res.sendFile( pathNoImagen );
    }

} );

module.exports = app;