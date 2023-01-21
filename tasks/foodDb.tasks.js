let PostgreSQL = require('pg');
const Pool = PostgreSQL.Pool;

let pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '6equj5*243',
    port: 5432,
});

/**
 * @param {Request} req
 * @param {Response} res
 */
const hasAppUser = (req, res) => {
    const { appusername, userpassword } = req.body;
    pool.query("select exists(select from appuser where appusername = $1 and userpassword = $2);",
        [appusername, userpassword],
        (error, result) => {
            if (error) throw error;
            res.status(200).json(result.rows[0]);
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const signInUser = (req, res) => {
    const { appusername, userpassword } = req.body;
    pool.query(
        "select username, appusername" +
        " from appuser" +
        " where appusername = $1" +
        " and userpassword = $2;",
        [appusername, userpassword],
        (error, result) => {
            if (error) {
                throw error;
            }
            if (result.rows.length == 0) {
                res.status(404).json({signedIn: false});
            }
            res.status(200).json(result.rows[0]);
        }
    );
};

/**
 * @param {Request} req
 * @param {Response} res
 */
const signUpUser = (req, res) => {
    const { username, appusername, userpassword } = req.body;
    pool.query(
        "insert into appuser (" +
        "  userId," +
        "  username," +
        "  userpassword," +
        "  appusername" +
        ") values (" +
        "   uuid_generate_v4()," +
        "   $1," +
        "   $2," +
        "   $3" +
        ");",
        [username, userpassword, appusername],
        (error, _) => {
            if (error) {
                res.status(400).json({ err: error });
            }
            res.status(201).json({ message: `Created ${appusername} successfully` });
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const createRecipe = (req, res) => {
    const { recipename, ingredientnames, ingredientamounts, appusername } = req.body;

    for (let i = 0; i < ingredientnames.length; i += 1){
        pool.query(
            "insert into recipedetails(detailID, recipeid, ingredientid, ingredientamount, appusername)" +
            " values(uuid_generate_v4(), fetch_recipe_id($1), get_ingredient_id($2), $3, $4);",
            [recipename, ingredientnames[i], ingredientamounts[i], appusername],
            (error, _) => {
                if (error) throw error;
                res.status(201).send(
                    `Created ${recipename} with ${ingredientnames[ingredientnames.length - 1]}' +
                    'as last ingredient by ${appusername}`
                );
            }
        );
    }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const addIngredientToRecipe = (req, res) => {
    const { recipename, ingredientname, ingredientamount, appusername } = req.body;
    pool.query(
        "Insert into recipedetails(detailId, recipeid, ingredientid, ingredientamount, appusername)" +
        "values(uuid_generate_v4(), get_user_recipe_id($1, $4), get_ingredient_id($2), $3, $4);",
        [recipename, ingredientname, ingredientamount, appusername],
        (err, res) => {
            if (err) throw err;
            res.status(201).send("Insertion successful");
        }
    );
};


/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getUserRecipies = (req, res) => {
    const { appusername } = req.body;
    pool.query(
        "select recipename" +
        " from recipe" +
        " inner join (" +
        "   select recipeid" +
        "   from recipedetails" +
        "   where appusername = $1" +
        ") as userRecipies" +
        " on recipe.recipeid = userRecipies.recipeid" +
        " group by recipename",
        [appusername],
        (err, result) => {
            if (err) throw err;

            let userAllRecipies = [];
            for (let i = 0; i < result.rows.length; i += 1) {
                userAllRecipies.push(result.rows[i].recipename);
            }
            res.status(200).json({recipies: userAllRecipies});
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getUserRecipeDetails = (req, res) => {
    const { appusername, recipename } = req.body;
    pool.query(
        "select ingredientname, ingredientamount" +
        " from ingredient" +
        " inner join (" +
        "   select ingredientid, ingredientamount" +
        "   from recipedetailedview" +
        "   where recipedetailedview.appusername = $1" +
        "   and recipedetailedview.recipename = $2" +
        "   group by ingredientid, ingredientamount" +
        ") as userRecipeDetails " +
        "on ingredient.ingredientid = userRecipeDetails.ingredientid;",
        [appusername, recipename],
        (err, result) => {
            if (err) throw err;
            res.status(200).json({ recipeDetails: result.rows });
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const updateUserRecipeIngredientName = (req, res) => {
    const {
        appusername,
        oldingredientname,
        newingredientname,
        recipename
    } = req.body;

    pool.query(
        "update recipedetails" +
        " set ingredientid = get_ingredient_id($3)" +
        " where recipeid = get_user_recipe_id($1, $4)" +
        " and ingredientid = $2;",
        [appusername, oldingredientname, newingredientname, recipename],
        (err, _) => {
            if (err) throw err;
            res.status(201).send(`Updated with ${newingredientname}`);
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const updateUserRecipeIngredientAmount = (req, res) => {
    const {
        appusername,
        recipename,
        ingredientname,
        ingredientamount
    } = req.body;

    pool.query(
        "update recipedetails set ingredientamount = $4" +
        " where recipeid = get_user_recipe_id($1, $2)" +
        " and ingredientid = get_ingredient_id($3);",
        [appusername, recipename, ingredientname, ingredientamount],
        (err, _) => {
            if (err) throw err;
            res.status(201).send(`Updated ingredient amount with: ${ingredientamount}`);
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const updateUserRecipeName = (req, res) => {
    const { appusername, recipename, oldrecipename, newrecipename } = req.body;
    pool.query(
        "update recipedetails set recipeid = get_recipe_id($3)" +
        " where recipeid = get_user_recipe_id($1, $2) and appusername = $1;",
        [appusername, recipename, oldrecipename, newrecipename],
        (err, _) => {
            if (err) throw err;
            res.status(201).send("Updated user recipe name");
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const deleteUserRecipeIngredient = (req, res) => {
    const { appusername, recipename, ingredientname } = req.body;
    pool.query(
        "delete from recipedetails where recipeid = get_user_recipe_id($1, $2)" +
        " and ingredientid = get_ingredient_id($3);",
        [appusername, recipename, ingredientname],
        (err, _) => {
            if (err) throw err;
            res.status(201).send(`deleted ${recipename}'s ingredient ${ingredientname}`);
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const deleteUserRecipeName = (req, res) => {
    const { appusername, recipename } = req.body;
    pool.query(
        "delete from recipedetails where recipeid = fetch_recipe_id($2) and appusername = $1;",
        [appusername, recipename],
        (err, _) => {
            if (err) throw err;
            res.status(201).send(`deleted ${recipename} of appuser ${appusername}`);
        }
    );
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const deleteUserAllRecipies = (req, res) => {
    const { appusername } = req.body;
    pool.query("Delete from recipedetails where appusername = $1;",
    [appusername],
    (err, _) => {
        if (err) throw err;
        res.status(201).send(`Deleted ${appusername} recipies`);
    });
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const deleteUser = (req, res) => {
    const { appusername } = req.body;
    pool.query("Delete from appuser where appusername = $1;",
    [appusername],
    (err, _) => {
        if (err) throw err;
        res.status(201).send(`Deleted ${appusername}`);
    });
};

module.exports = {
    hasAppUser,
    signInUser,
    signUpUser,
    createRecipe,
    addIngredientToRecipe,
    getUserRecipies,
    getUserRecipeDetails,
    updateUserRecipeIngredientName,
    updateUserRecipeIngredientAmount,
    updateUserRecipeName,
    deleteUserRecipeIngredient,
    deleteUserRecipeName,
    deleteUserAllRecipies,
    deleteUser
};