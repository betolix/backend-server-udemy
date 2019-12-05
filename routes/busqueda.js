var express = require("express");

var app = express();

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// POSTGRES
const pool = require("../db");

// Rutas

//==================================================
// Busqueda por Colección
//==================================================
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  var busqueda = req.params.busqueda;
  busqueda = "%".concat(busqueda, "%");
  var tabla = req.params.tabla;
  var regex = new RegExp(busqueda, "i");

  var promesa;

  switch (tabla) {
    case "usuarios":
      promesa = buscarUsuarios(busqueda, regex);
      break;

    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;

    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;

    default:
      return res.status(400).json({
        ok: false,
        mensaje:
          "Los tipos de búsqueda sólo son: usuarios, medicos y hospitales",
        error: { message: "Tipo de tabla/colección no válido" }
      });
  }

  promesa.then(data => {
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  });
});

//==================================================
// Busqueda General
//==================================================
app.get("/todo/:busqueda", (req, res, next) => {
  var busqueda = req.params.busqueda;
  busqueda = "%".concat(busqueda, "%");
  console.log("busqueda ", busqueda);
  var regex = new RegExp(busqueda, "i");
  // console.log("regex ", regex);

  Promise.all( [
          buscarHospitales(busqueda, regex),
          buscarMedicos(busqueda, regex),
          buscarUsuarios(busqueda, regex)
      ]  )
      .then( respuestas => {

          res.status(200).json({
              ok: true,
              hospitales: respuestas[0],
              medicos: respuestas[1],
              usuarios: respuestas[2]
          })

      } );
});

function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM hospital WHERE nombre_hospital LIKE ($1)",
      [busqueda],
      (err, hospitales) => {
        if (err) {
          console.log("err", err);
          reject("Error al cargar hospitales", err);
        } else {
            console.log('hospitales ', hospitales.rows );
          
          resolve(hospitales.rows);
        }
      }
    );
  });
}

function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM medico WHERE nombre LIKE ($1)",
      [busqueda],
      (err, medicos) => {
        if (err) {
          console.log("err", err);
          reject("Error al cargar medicos", err);
        } else {
          resolve(medicos.rows);
        }
      }
    );
  });
}

function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM usuario WHERE nombre_usuario LIKE ($1) OR email LIKE ($1) OR role LIKE ($1)",
      [busqueda],
      (err, usuarios) => {
        if (err) {
          console.log("err", err);
          reject("Error al cargar hospitales", err);
        } else {
          usuarios.rows.password = ":)";
          resolve(usuarios.rows);
        }
      }
    );
  });
}

module.exports = app;
