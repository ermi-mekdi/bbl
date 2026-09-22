const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('.')); // Serve admin page locally

const DATA_FILE = path.join(__dirname, 'data', 'books.json');
const PUBLISH_FILE = path.join(__dirname, 'public', 'books.json');

// Helper functions
const readData = async () => JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
const saveData = async (data) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  // Automatically copy updated JSON to public folder for deployment
  await fs.writeFile(PUBLISH_FILE, JSON.stringify(data, null, 2));
};

// GET all books
app.get('/api/admin/books', async (req, res) => {
  const books = await readData();
  res.json(books);
});

// POST create a new book
app.post('/api/admin/books', async (req, res) => {
  const books = await readData();
  const newBook = { id: Date.now(), ...req.body };
  books.push(newBook);
  await saveData(books);
  res.status(201).json(newBook);
});

// DELETE a book by ID
app.delete('/api/admin/books/:id', async (req, res) => {
  let books = await readData();
  books = books.filter(b => b.id !== Number(req.params.id));
  await saveData(books);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Local Admin running on http://localhost:3000'));