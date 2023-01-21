let express = require('express');
let tasks = require('../tasks/foodDb.tasks');

let foodRecipeRoute = express.Router();

foodRecipeRoute.get("/", (req, res) => {
    res.status(200).json({hasData: "has data"});
});

foodRecipeRoute.post("/checkUser", tasks.hasAppUser);
foodRecipeRoute.post("/signIn", tasks.signInUser);
foodRecipeRoute.post("/signUp", tasks.signUpUser);

foodRecipeRoute.post("/getRecipies", tasks.getUserRecipies);
foodRecipeRoute.post("/getRecipeDetails", tasks.getUserRecipeDetails);
foodRecipeRoute.post("/createRecipe", tasks.createRecipe);
foodRecipeRoute.post("/addIngredient", tasks.addIngredientToRecipe);

foodRecipeRoute.put("/ingredientNewname", tasks.updateUserRecipeIngredientName);
foodRecipeRoute.put("/ingredientNewAmount", tasks.updateUserRecipeIngredientAmount);
foodRecipeRoute.put("/recipeNewname", tasks.updateUserRecipeName);

foodRecipeRoute.delete("/deleteIngredient", tasks.deleteUserRecipeIngredient);
foodRecipeRoute.delete("/deleteRecipe", tasks.deleteUserRecipeName);
foodRecipeRoute.delete("/deleteRecipies", tasks.deleteUserAllRecipies);
foodRecipeRoute.delete("/deleteUser", tasks.deleteUser);

module.exports = foodRecipeRoute;