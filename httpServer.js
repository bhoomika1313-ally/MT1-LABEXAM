import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed' },
];

// Helpers to keep the code short
const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  const { url, method } = req;

  // ---------- GET routes ----------
  if (url === '/' && method === 'GET') {
    sendHtml(res, 200, '<h1>Welcome to the Employee Task Management System</h1>');

  } else if (url === '/tasks' && method === 'GET') {
    sendJson(res, 200, tasks);

  } else if (url === '/about' && method === 'GET') {
    sendHtml(res, 200, '<h1>About</h1><p>This application manages employee tasks. It is built with the Node.js HTTP module.</p>');

  } else if (url === '/home' && method === 'GET') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        sendHtml(res, 500, '<h1>500 - Could not read the HTML file</h1>');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });

  // ---------- POST /add-task ----------
  } else if (url === '/add-task' && method === 'POST') {
    let body = '';

    // The body arrives in chunks
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // When all chunks have arrived
    req.on('end', () => {
      let newTask;

      // Handle invalid JSON
      try {
        newTask = JSON.parse(body);
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid JSON format' });
        return;
      }

      // Validate required fields
      const { id, taskName, assignedTo, status } = newTask;
      if (!id || !taskName || !assignedTo || !status) {
        sendJson(res, 400, {
          error: 'Missing required fields: id, taskName, assignedTo and status are all required',
        });
        return;
      }

      // Reject duplicate IDs
      if (tasks.some((task) => task.id === id)) {
        sendJson(res, 409, { error: `Task with id ${id} already exists` });
        return;
      }

      const task = { id, taskName, assignedTo, status };
      tasks.push(task);
      sendJson(res, 201, { message: 'Task added successfully', task });
    });

  // ---------- Known route, wrong method ----------
  } else if (['/', '/tasks', '/about', '/home', '/add-task'].includes(url)) {
    sendJson(res, 405, { error: `Method ${method} not allowed on ${url}` });

  // ---------- Invalid route ----------
  } else {
    sendHtml(res, 404, '<h1>404 - Page Not Found</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});