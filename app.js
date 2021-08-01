const debugInicio = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express = require('express');
const logger = require('./logger');
const morgan = require('morgan');
const config = require('config');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Middleware propio
app.use(logger.logeo);

//Autentificacion
app.use((req, res, next) => {
    console.log("Autentificando...");
    next();
});

//configuracion de entornos, Para cambiar la configuracion de Desarrollo a produccion es set NODE_ENV=production y desarrollo es set NODE_ENV=development
console.log(`La aplicacion ${config.get('nombre')}\nBD Server: ${config.get('configDB.Host')}`)

//Middleware de tercero (morgan)
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    //console.log("morgan habilidado");
    debugInicio("morgan habilidado");
}

//Trabajos con BD
dbDebug("Debug con BD");

app.get('/', (req, res) => {
    res.send("Hi desde express");
    res.end();
});

app.get('/api/user', (req, res) => {
    res.send(users);
});

app.get('/api/user/:y/:m/:d', (req, res) => { //http://localhost:5000/api/user/50
    res.send(`Params: ${valores(req.params)} \nQuerys: ${valores(req.query)}`);
});

let valores = (parametro) => {
    let s = '';
    let obj = Object.keys(parametro);
    for (let i = 0; i < obj.length; i++) {
        s += ` ${obj[i]}: ${parametro[obj[i]]}`;
    }
    return s;
}

const users = [
    { id: 1, name: 'Chriss' },
    { id: 2, name: 'Ana' },
    { id: 3, name: 'Rosa' }
];

app.get('/api/user/:id', (req, res) => {
    let user = existeUser(req.params.id);
    res.status((!user) ? 404 : 200).send((!user) ? "User not found" : user);
});

const Joi = require('@hapi/joi');

app.post('/api/user', (req, res) => {

    const { error, value } = validarUsuario(req.body.name);

    if (!error) {
        const user = {
            id: users.length + 1,
            name: value.name
        };
        users.push(user);
        return res.send(`Regitro existoso: ${valores(user)}`);
    } else {
        return res.status(400).send(errorMsj(error));
    }
});

app.put('/api/user/:id', (req, res) => { //Put sirve para modificar
    //Encontrar si existe
    let usuario = existeUser(req.params.id);

    if (!usuario) return res.status(404).send("User not found");

    const { error, value } = validarUsuario(req.body.name);
    if (error) {
        return res.status(400).send(errorMsj(error));
    }

    usuario.name = value.name;
    res.send(`Modificado ${valores(users[(parseInt(req.params.id)-1)])}`);
});

const existeUser = id => users.find(u => u.id === parseInt(id));

const validarUsuario = (nombre) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate({ name: nombre });
};

let errorMsj = error => error.details[0].message;

app.delete('/api/user/:id', (req, res) => { //Para borrar
    //Encontrar si existe
    let usuario = existeUser(req.params.id);
    if (!usuario) return res.status(404).send("User not found");

    let index = users.indexOf(usuario);
    users.splice(index, 1);
    res.send(users);
});

const port = process.env.PORT || 3000; //Se pone como set PORT=Valor
app.listen(port, () => console.log(`Escuchando en el port: ${port}`));