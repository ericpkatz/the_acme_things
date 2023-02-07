const express = require('express');
const app = express.Router();
const db = require('../db');
const client = db.client;

app.delete('/:id', async(req, res, next)=> {
  try{
    const SQL = `
    DELETE FROM things
    WHERE id = $1
    `;
    await client.query(SQL, [ req.params.id ]);
    res.redirect('/');
  }
  catch(ex){
    next(ex);
  }

});

app.post('/', async(req, res, next)=> {
  try{
    const SQL = `
  INSERT INTO things(name, description)
  VALUES ($1, $2)
  RETURNING *
    `;
    const response = await client.query(SQL, [ req.body.name, req.body.description]);
    const thing = response.rows[0];
    res.redirect(`/things/${thing.id}`);
  }
  catch(ex){
    next(ex);
  }

});

app.get('/add', (req, res, next)=> {
    res.send(`
    <html>
      <head>
        <title>The Acme Things</title>
        <link rel='stylesheet' href='/public/styles.css' />
      </head>
      <body>
        <h1>The Acme Things</h1>
        <a href='/'>Show All Things</a>
        <form method='POST' action='/things'>
          <input name='name' placeholder='insert name' />
          <input name='description' placeholder='insert desc.' />
          <button>Create</button>
        </form>
      </body>
    </html>
    `);
});

app.get('/:id', async(req, res, next)=> {
  try {
    const response = await client.query(`
      SELECT id, name, description
      FROM things
      WHERE id = $1
    `, [ req.params.id ]);
    const thing = response.rows[0];

    res.send(`
    <html>
      <head>
        <title>The Acme Things</title>
        <link rel='stylesheet' href='/public/styles.css' />
      </head>
      <body>
        <h1>The Acme Things</h1>
        <a href='/'>Show All Things</a>
        <h2>${ thing.name }</h2>
        <p>
          ${ thing.description}
        </p>
        <a href='/things/${thing.id}?method=delete'>Delete</a>
      </body>
    </html>
    `);
  }
  catch(ex){
    console.log(ex);
    next(ex);
  }
});

module.exports = app;
