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

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === "credit") {
            return acc + operation.amount
        } else {
            return acc - operation.amount
        }
    }, 0);

    return balance;
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

app.post("/withdraw", verifyExistAccountCPF, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return res.status(400).json({ error: "Insufficient funds!" })
    }

    const depositOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(depositOperation);

    return res.status(201).send();
})

// Buscando informações por DATA
app.get("/statement/date", verifyExistAccountCPF, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date);

    const statement = customer.statement.filter((statement) => {
        statement.created_at.toDateString() === new Date(dateFormat).toDateString();
    })


    return res.json(statement);
})


app.put("/account", verifyExistAccountCPF, (req, res) => {
    const { name } = req.body;
    const { customer } = req;

    customer.name = name;

    return res.status(201).send();
})

app.get("/account", verifyExistAccountCPF, (req, res) => {
    const {customer} = req;

    return res.json(customer);
})


app.delete("/account", verifyExistAccountCPF, (req, res) => {
    const { customer } = req;

    customers.splice(customer, 1);

    return res.status(200).json(customers);
})

app.get("/balance", verifyExistAccountCPF, (req, res) => {
    const { customer } = req;

    const balance = getBalance(customer.statement);

    return res.json(balance);
})


app.listen(3333, (err) => {
    if (err) { throw err; }

    console.log("Server Running on Port: 3333");
});