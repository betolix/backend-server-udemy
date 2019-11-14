var mongoose = require ('mongoose');

var uniqueValidator = require ('mongoose-unique-validator');

var Schema = mongoose.Schema;

// ESTA VALIDACION SOLO SIRVA PARA MONGOOSE CREAR UNA VALIDACION EN POSTGRES
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }
});

// ESA LINEA SE DEBE IR XQ YA NO SE DEBE USAR MONGOOSSE
usuarioSchema.plugin( uniqueValidator, { message: ' {PATH} debe ser unico' } );

module.exports = mongoose.model('Usuario', usuarioSchema);