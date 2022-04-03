const express = require('express');
const app = express();

const { v4: uuiddv4 } = require("uuid");

const customers = [];


// Middleware
function verifyExistAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: "Customer not found." })
    }

    // Repassando a informação CUSTOMER para as outras rotas que estão utilizando o nosso MIDDLEWARE.
    req.customer = customer;

    return next();

}


// falando para o Express que vamos receber um JSON
app.use(express.json());

// Criando o cadastro de compras
app.post("/account", (req, res) => {

    // Sempre que estamos tratando de inserção de dados, recebemos REQUEST.BODY.
    const { cpf, name } = req.body;

    // Estamos usando o SOME, pois ele nos retorna um resultado BOOLEANO.
    const customerAlreadyExist = customers.some(customer => customer.cpf === cpf);

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

// Buscando informações
app.get("/statement", verifyExistAccountCPF, (req, res) => {

    const { customer } = req;

    return res.json(customer.statement);
})


app.post("/deposit", verifyExistAccountCPF, (req, res) => {

    const { description, amount } = req.body;

    const { customer } = req;

    const depositOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(depositOperation);

    return res.status(201).send()
})



app.listen(3333, (err) => {
    if (err) { throw err; }

    console.log("Server Running on Port: 3333");
});