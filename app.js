const express = require('express');
const pg = require('pg');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 8080; // Adjust port number as needed

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Import the schema definition from a separate file
const schema = require('./schema'); // Assuming schema.js is in the same directory

// Function to create table if it doesn't exist (using a separate function)
const createTable = async () => {
  const client = await pool.connect();
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${schema.your_table.id.name} (
        ${Object.entries(schema.your_table)
          .map(([columnName, columnProps]) => {
            let columnDef = `${columnName} ${columnProps.type}`;
            if (columnProps.primary) {
              columnDef += ' PRIMARY KEY';
            }
            return columnDef;
          })
          .join(', ')}
    );
  `;
    await client.query(createTableQuery);
    console.log("Table 'your_table' is created or already exists.");
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1); // Exit process if table creation fails
  } finally {
    client.release();
  }
};

// Ensure table creation happens before starting the server (improved logic)
(async () => {
  try {
    await createTable();  // Attempt to create the table
  } catch (error) {
    console.error('Error creating table:', error);
  }

  await app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
  });
})();



// api Middlewares
app.use(express.json()); // for accepting data in JSON format

app.use(express.urlencoded()); // for decoding data from HTML forms



//API routes

app.post('/submit-data', async (req, res) => {
  console.log(req.body);

  try {
    const client = await pool.connect();

    const { name, age } = req.body; // Extract data from request body

    // Basic data validation (replace with more comprehensive validation)
    if (!name || !age) {
      return res.status(400).json({ message: 'Missing required fields: name and age' });
    }

    const insertQuery = 'INSERT INTO your_table (name, age) VALUES ($1, $2)'; // Parameterized query
    const values = [name, age];

    await client.query(insertQuery, values);

    res.json({ message: 'Data submitted successfully!' }); // Success response

  } catch (error) {
    console.error(error);
    // Consider more specific error handling here
    res.status(500).json({ message: 'Error submitting data' }); // Error response

  } finally {
    client.release(); // Release connection back to the pool
  }
});
