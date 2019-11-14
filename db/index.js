const { Pool } = require ('pg');

// LINEA IMPORTANTE
const {user, host, database, password, port} = require ('../secrets/db_configuration')

const pool = new Pool({user, host, database, password, port});

console.log('POSTGRES ON-LINE  ...Yeahh baby!!!');


module.exports = pool;