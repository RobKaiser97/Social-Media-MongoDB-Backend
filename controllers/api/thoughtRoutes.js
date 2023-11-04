const router = require('express').Router();
const { Thought, User } = require('../../models');

// GET all thoughts
router.get('/', async (req, res) => {
  try {
    const thoughtData = await Thought.find();
    res.status(200).json(thoughtData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single thought by its _id
router.get('/:thoughtId', async (req, res) => {
  try {
    const oneThought = await Thought.findById(req.params.thoughtId)
      .populate('reactions')
      .populate('thoughts');
    res.status(200).json(oneThought);
  } catch (err) {
    res.status(500).json(err)
  }
});

// POST a new thought and associate it with a user
router.post('/', async (req, res) => {
  try {
    const newThought = await Thought.create(req.body);
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      { $push: { thoughts: newThought._id } },
      { new: true }
    );
    res.status(200).json(newThought);
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT to update a thought by its _id
router.put('/:thoughtId', async (req, res) => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      req.body,
      { new: true }
    );
    if (!updatedThought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }
    res.json(updatedThought);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE to remove a thought by its _id
router.delete('/:thoughtId', async (req, res) => {
  try {
    const deletedThought = await Thought.findByIdAndDelete(req.params.thoughtId);
    if (!deletedThought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }
    await User.findByIdAndUpdate(
      deletedThought.userId,
      { $pull: { thoughts: deletedThought._id } },
      { new: true }
    );
    res.json(deletedThought);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST to create a reaction stored in a single thought's reactions array field
router.post('/:thoughtId/reactions', async (req, res) => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      { $push: { reactions: req.body } },
      { new: true }
    );
    if (!updatedThought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }
    res.json(updatedThought);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE to pull and remove a reaction by the reaction's reactionId value
router.delete('/:thoughtId/reactions/:reactionId', async (req, res) => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      { $pull: { reactions: { reactionId: req.params.reactionId } } },
      { new: true }
    );
    if (!updatedThought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }
    res.json(updatedThought);
  } catch (err) {
    res.status(500).json(err);
  }
});