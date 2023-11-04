const router = require('express').Router();
const { User, Thought } = require('../../models')

router.get('/', async (req, res) => {
  try {
    const userData = await User.find();
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const oneUser = await User.findById(req.params.userId)
      .populate('thoughts')
      .populate('friends');
    res.status(200).json(oneUser);
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:userId', async (req, res) => {
  try {
    const updateUser = await User.findOneAndUpdate(req.params.userId);
    res.status(200).json(updateUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    await Thought.deleteMany({ username: user.username });
    const destroyUser = await User.findOneAndDelete(req.params.userId);
    res.status(200).json(destroyUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/:userId/friends/:friendId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { friends: req.params.friendId } },
      { new: true }
    );
    const friend = await User.findById(req.params.friendId);

    if (!user) {
      return res.status(404).json({ message: 'No user found with this id!' });
    }
    if (!friend) {
      return res.status(404).json({ message: 'No friend found with this id!' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:userId/friends/:friendId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { friends: req.params.friendId } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'No user found with this id!' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router