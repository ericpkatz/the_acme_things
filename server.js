const express = require('express');
const app = express();
const db = require('./db');
const client = db.client;

app.use('/public', express.static('assets'));
app.use(express.urlencoded({ extended: false}));
app.use((req, res, next)=> {
  if(req.query.method){
    req.method = req.query.method;
  }
  next();
});

app.get('/', async(req, res, next)=> {
  try {
    const response = await client.query(`
      SELECT id, name
      FROM things
    `);
    const things = response.rows;

    res.send(`
    <html>
      <head>
        <title>The Acme Things</title>
        <link rel='stylesheet' href='/public/styles.css' />
      </head>
      <body>
        <h1>The Acme Things</h1>
        <a href='/things/add'>Add Thing</a>
        <ul>
          ${
            things.map( thing => {
              return `
                <li>
                  <a href='/things/${thing.id}'>${ thing.name }</a>
                </li>
              `;
            }).join('')
          }
        </ul>
      </body>
    </html>
    `);
  }
  catch(ex){
    console.log(ex);
    next(ex);
  }
});

app.delete('/things/:id', async(req, res, next)=> {
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

app.post('/things', async(req, res, next)=> {
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

app.get('/things/add', (req, res, next)=> {
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

app.get('/things/:id', async(req, res, next)=> {
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



const port = process.env.PORT || 3000;

app.listen(port, async()=> {
  try {
    console.log(`listening on port ${port}`);
    await client.connect();
    const SQL = `
    DROP TABLE IF EXISTS things;
    CREATE TABLE things(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE,
      description TEXT
    );
    INSERT INTO things(name, description) VALUES('foo', 'FOO!!');
    INSERT INTO things(name, description) VALUES('bar', 'BAR!!');
    INSERT INTO things(name, description) VALUES('bazz', 'BAZZ!!');
    `;
    await client.query(SQL);
  }
  catch(ex){
    console.log(ex);
  }
});
