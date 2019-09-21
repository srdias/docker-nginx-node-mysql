const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const mysql = require('mysql');
var cors = require('cors');

function getConnection() {
    const connection = mysql.createConnection({
        host: 'db',
        port: 3306,
        user: 'root',
        password: 'example',
        database: 'db001'
    });
    return connection;
}

function execSQLQuery(sqlQry, res) {
    let connection = getConnection();
    connection.query(sqlQry, function (error, results, fields) {
        if (error) {
            res.json(error);
        } else {
            res.json(results);
        }
        connection.end();
        console.log('executou!');
    });
}

//--------------------------------
function createTable() {

    const sql = "CREATE TABLE IF NOT EXISTS Clientes (\n" +
        "ID int NOT NULL AUTO_INCREMENT,\n" +
        "Nome varchar(150) NOT NULL,\n" +
        "CPF char(11) NOT NULL,\n" +
        "PRIMARY KEY (ID)\n" +
        ");";

    let connection = getConnection();
    connection.query(sql, function (error, results, fields) {
        if (error) return console.log(error);
        console.log('Criou a tabela Clientes quando não existir!');
        connection.end();
        insereSeVazio();
    });
}

function insereSeVazio() {
    let connection = getConnection();
    connection.query("select count(1) qtde from Clientes", function (error, results, fields) {
        connection.end();
        console.log("Número de registros encontrado na tabela clientes: " + results[0].qtde);
        if (results[0].qtde < 10) {
            console.log("Inserindo linhas de testes");
            addRows();
        } else {
            console.log("Tabela já populada. Sem ações.");
        }
    });
}

function addRows() {
    const sql = "INSERT INTO Clientes(Nome,CPF) VALUES ?";
    const values = [
        ['teste1', '12345678901'],
        ['teste1', '09876543210'],
        ['teste3', '12312312399']
    ];
    let connection = getConnection();
    connection.query(sql, [values], function (error, results, fields) {
        if (error) return console.log(error);
        console.log('adicionou registros!');
        connection.end();//fecha a conexão
    });
}

createTable();

//--------------------------------
/*
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
*/
app.use(cors());

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);

router.get('/clientes', (req, res) => {
    execSQLQuery('SELECT * FROM Clientes', res);
})

router.get('/clientes2', (req, res) => {
    execSQLQuery('SELECT * FROM Clientes', res);
})

router.get('/clientes/:id?', (req, res) => {
    let filter = '';
    if (req.params.id) filter = ' WHERE ID=' + parseInt(req.params.id);
    execSQLQuery('SELECT * FROM Clientes' + filter, res);
})

router.delete('/clientes/:id', (req, res) => {
    execSQLQuery('DELETE FROM Clientes WHERE ID=' + parseInt(req.params.id), res);
})

router.post('/clientes', (req, res) => {
    const nome = req.body.nome.substring(0, 150);
    const cpf = req.body.cpf.substring(0, 11);
    execSQLQuery(`INSERT INTO Clientes(Nome, CPF) VALUES('${nome}','${cpf}')`, res);
});

router.patch('/clientes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const nome = req.body.nome.substring(0, 150);
    const cpf = req.body.cpf.substring(0, 11);
    execSQLQuery(`UPDATE Clientes SET Nome='${nome}', CPF='${cpf}' WHERE ID=${id}`, res);
})

//-- Inicia o servidor
app.listen(port);
console.log('API iniciada!');

/*
Testes:
curl -X GET http://localhost:3000/clientes
curl -X POST -d "nome=luiz&cpf=12345678901" http://localhost:3000/clientes
curl -X PATCH -d "nome=luiza&cpf=12345678901" http://localhost:3000/clientes/4

*/
