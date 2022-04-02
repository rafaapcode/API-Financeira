const express = require('express');
const app = express();

app.listen(3333, (err) => {
    if(err){throw err;}

    console.log("Server Running on Port: 3333");
});