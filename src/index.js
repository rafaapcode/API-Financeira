const express = require('express');
const app = express();

const { v4: uuiddv4 } = require("uuid");

const customers = [];


// falando para o Express que vamos receber um JSON
app.use(express.json());

// Criando o cadastro de compras
app.post("/account", (req, res) => {

    // Sempre que estamos tratando de inserção de dados, recebemos REQUEST.BODY.
    const { cpf, name } = req.body;

    // Estamos usando o SOME, pois ele nos retorna um resultado BOOLEANO.
    const customerAlreadyExist = customers.some(costumer => costumer.cpf === cpf);

    if (customerAlreadyExist) {
        return res.status(400).json({ error: "Customer already exists!" });
    }


    customers.push({
        cpf,
        name,
        id: uuiddv4(),
        statement: []
    });

    return res.status(201).send();

})


app.get("/statement", (req, res) => {
    const { cpf } = req.headers;

    const costumer = customers.find(customer => customer.cpf === cpf);

    if (!costumer) {
        return res.status(400).json({ error: "Customer not found." })
    }

    return res.json(costumer.statement);

})




app.listen(3333, (err) => {
    if (err) { throw err; }

    console.log("Server Running on Port: 3333");
});