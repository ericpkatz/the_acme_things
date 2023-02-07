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

app.use('/things', require('./routers/things'));




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
