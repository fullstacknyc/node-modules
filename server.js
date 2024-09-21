const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Load todos from file at startup
let todos = [];
const todosFilePath = path.join(__dirname, 'data', 'todos.json');

fs.readFile(todosFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading todos file:', err);
        todos = [];
    } else {
        try {
            todos = JSON.parse(data);
        } catch (e) {
            console.error('Error parsing todos file:', e);
            todos = [];
        }
    }
});

// Serve todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

// Save todos
app.post('/save-todos', (req, res) => {
    todos = req.body;
    fs.writeFile(todosFilePath, JSON.stringify(todos), (err) => {
        if (err) {
            console.error('Error writing todos file:', err);
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
    });
});
const journalFilePath = path.join(__dirname, 'data', 'journal.json');

// Load journal entries from file at startup
let journalEntries = [];
fs.readFile(journalFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading journal file:', err);
        journalEntries = [];
    } else {
        try {
            journalEntries = JSON.parse(data);
        } catch (e) {
            console.error('Error parsing journal file:', e);
            journalEntries = [];
        }
    }
});

// Serve journal entries
app.get('/journal', (req, res) => {
    res.json(journalEntries);
});

// Save journal entries
app.post('/save-journal', (req, res) => {
    journalEntries = req.body;
    fs.writeFile(journalFilePath, JSON.stringify(journalEntries), (err) => {
        if (err) {
            console.error('Error writing journal file:', err);
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
