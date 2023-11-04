const db = require('../config/connection');
const { User, Thought } = require('../models');
const goose = require('mongoose');
const moment = require('moment');

// Seed data
const userData = [
  // ...
];

const thoughtData = [
  // ...
];

const reactionData = [
  // ...
];

db.once('open', async () => {
  try {
    await User.deleteMany({});
    const users = await User.create(userData);

    await Thought.deleteMany({});
    const thoughts = await Thought.create(thoughtData);

    // Add friends to users
    for (let user of users) {
      const friendIds = users.filter(friend => friend._id !== user._id).map(friend => friend._id);
      await User.findByIdAndUpdate(user._id, { $push: { friends: { $each: friendIds } } });
    }

    // Add reactions to thoughts
    for (let thought of thoughts) {
      const reactions = reactionData.map(reaction => ({ ...reaction, username: users[0].username }));
      await Thought.findByIdAndUpdate(thought._id, { $push: { reactions: { $each: reactions } } });
    }

    console.log('Database seeded!');
    process.exit(0);
  } catch (err) {
    throw err;
  }
});