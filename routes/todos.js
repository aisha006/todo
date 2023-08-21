const express = require("express");
const router = express.Router()
const database = require('../database');

const createTodo = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        res.status(400);
        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify({
            code: "error",
            message: "Title field is missing",
        }));
        res.end();
    } else {
        try {
            var userId = req.session.user_id;
            const insertQuery = `INSERT INTO tasks (title, user_id) VALUES ('${title}', ${userId})`;
            database.query(insertQuery, function (err, result) {
                if (!err) {
                    res.status(201);
                    res.setHeader('content-type', 'application/json');
                    res.send(JSON.stringify({
                        code: "success",
                        id: result['insertId'],
                        message: "Todo created",
                    }));
                } else {
                    res.status(500);
                    res.type('json');
                    res.send(JSON.stringify({
                        code: "error",
                        message: "Internal server error",
                    }));
                }
            });


        } catch (error) {
            console.log(error);
            res.status(500);
            res.setHeader('content-type', 'application/json');
            res.send(JSON.stringify({
                code: "error",
                message: "Internal server error",
            }));
        }
    }
};

const getAllTodos = async (req, res) => {
    try {
        const getQuery = `SELECT * FROM tasks`;
        const [data, _] = await database.execute(getQuery);

        res.status(200).json({
            code: "success",
            data: data,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: "error",
            message: "Internal server error",
        });
    }
};

const deleteTodoById = async (req, res) => {
    const id = req.params.id;
    const deleteQuery = `DELETE FROM tasks WHERE id = ${Number(id)}`;
    const [response] = await database.execute(deleteQuery);

    try {
        if (response.affectedRows) {
            res.status(200).json({
                code: "success",
                message: "Todo removed successfully!",
            });
        } else {
            res.status(404).json({
                code: "success",
                message: "Resource not found.",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: "error",
            message: "Internal server error",
        });
    }
};

const updateTodoById = async (req, res) => {
    const id = Number(req.params.id);
    const { title } = req.body;
    console.log(req.body);
    console.log(id);

    if (!title) {
        res.status(500);
        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify({
            code: "error",
            message: "Title field is missing",
        }));
        res.end();
    } else {
        try {
            const updateQuery = `UPDATE tasks SET title = '${title}' WHERE id = ${id}`;
            database.query(updateQuery, (err, result) => {
                if (result.affectedRows) {
                    res.status(200);
                    res.setHeader('content-type', 'application/json');
                    res.send(JSON.stringify({
                        code: "success",
                        message: "Todo updated successfully!",
                    }));
                } else {
                    res.status(404);
                    res.setHeader('content-type', 'application/json');
                    res.send(JSON.stringify({
                        code: "success",
                        message: "Resource not found.",
                    }));
                }
            });
            
        } catch (error) {
            console.log(error);
            res.status(500);
            res.setHeader('content-type', 'application/json');
            res.send(JSON.stringify({
                code: "error",
                message: "Internal server error",
            }));
            res.end();
        }
    }
};

const getTodoById = async (req, res) => {
    const id = Number(req.params.id);

    try {
        // find data from cache
        const cacheKey = `data:${id}`;
        const cacheData = await getCache(cacheKey);

        if (cacheData) {
            const result = JSON.parse(cacheData);
            res.status(200).json({
                code: "success",
                ...result,
            });
            return;
        }
        const getQuery = `SELECT * FROM tasks WHERE id = ${id}`;
        const sqlDatabase = await mysql.createdatabase(dbConfig);
        const [data, _] = (await sqlDatabase.execute(getQuery))[0];

        if (data) {
            const cacheKey = `data:${id}`;
            await setCache(cacheKey, data);

            res.status(200).json({
                code: "success",
                isCached: false,
                data: data,
            });
        } else {
            res.status(404).json({
                code: "success",
                message: "Resource not found.",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: "error",
            message: "Internal server error",
        });
    }
};

router.post("/todo", createTodo)
router.get("/todos", getAllTodos)
router.delete("/todo/:id", deleteTodoById)
router.put("/todo/:id", updateTodoById)
router.get("/todo/:id", getTodoById)

module.exports = router;