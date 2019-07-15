const express = require("express");
const next = require("next");
const proxy = require("http-proxy-middleware");
const parseIngredients = require("./utils/parseIngredients");
const fetch = require("isomorphic-unfetch");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get("/recipe/:id", (req, res) => {
      const actualPage = "/recipe";
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get("/tag/:id", (req, res) => {
      const actualPage = "/tag";
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get("/api/recipes/:id", (req, res) => {
      const id = req.params.id;
      fetch(`http://recipes.peek.ws/api/recipes/${id}`)
        .then(res => res.json())
        .then(recipe => {
          recipe.parsedIngredients = parseIngredients(recipe.ingredients);
          res.setHeader("Content-Type", "application/json");
          res.send(recipe);
        })
        .catch(error => {
          res.status(404).send(error);
        });
    });

    server.use(
      "/api",
      proxy({ target: "http://recipes.peek.ws", changeOrigin: true })
    );

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:3000");
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
