const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const auth = require('../middleware/auth');

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!task) { return res.status(404).send(); }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) { return res.status(400).send({ error: 'Invalid updates' }); }
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!task) { return res.status(404).send(); }
    updates.forEach(update => task[update] = req.body[update]);
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) match.completed = req.query.completed === 'true';
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (e) {
    console.log(e);

    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, ownerId: req.user._id });
    if (!task) { return res.status(404).send(); }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    ownerId: req.user._id
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;