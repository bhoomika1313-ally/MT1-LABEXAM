import express from 'express';

const app = express();
const PORT = 4000;

// Parse JSON request bodies
app.use(express.json());

// In-memory data (no database)
let tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed', priority: 'Low' },
];

// GET /tasks - all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id - one task
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }
  res.json(task);
});

// POST /tasks - add a task
app.post('/tasks', (req, res) => {
  const { id, taskName, assignedTo, status, priority } = req.body ?? {};

  if (!id || !taskName || !assignedTo || !status || !priority) {
    return res.status(400).json({
      error: 'Missing required fields: id, taskName, assignedTo, status and priority are all required',
    });
  }

  if (tasks.some((t) => t.id === id)) {
    return res.status(409).json({ error: `Task with id ${id} already exists` });
  }

  const task = { id, taskName, assignedTo, status, priority };
  tasks.push(task);
  res.status(201).json({ message: 'Task added successfully', task });
});

// PUT /tasks/:id - update a task
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  const { taskName, assignedTo, status, priority } = req.body ?? {};

  if (!taskName || !assignedTo || !status || !priority) {
    return res.status(400).json({
      error: 'Missing required fields: taskName, assignedTo, status and priority are all required',
    });
  }

  task.taskName = taskName;
  task.assignedTo = assignedTo;
  task.status = status;
  task.priority = priority;

  res.json({ message: 'Task updated successfully', task });
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  const [deletedTask] = tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully', task: deletedTask });
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (catches invalid JSON bodies)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});