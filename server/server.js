const express = require('express');
const bodyParser = require('body-parser');
const foodRecipeRoute = require('../router/foodRecipe.router');
const path = require('path');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use("/foodRecipe", foodRecipeRoute);

const port = 8080 || 8000;

// Connecting port
app.listen(port, () => {
    console.log('Port connected to: ' + port)
});

// Find 404 and hand over to error handler
app.use((req, res, next) => {
    next(console.log("Error occurred"));
});

// Index Route
app.get('/', (req, res) => {
    res.send('invalid endpoint');
});

// error handler
app.use(function(err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});

// Static build location
app.use(express.static(path.join(__dirname, 'dist')));