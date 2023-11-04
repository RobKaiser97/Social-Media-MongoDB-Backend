const db = require('../config/connection');
const { User, Thought, Reaction } = require('../models');
const mongoose = require('mongoose');
const moment = require('moment');

// Helper function to generate a random date within the last week
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Seed data generation
const userData = [
  { username: 'userOne', email: 'userone@example.com' },
  { username: 'userTwo', email: 'usertwo@example.com' },
  { username: 'userThree', email: 'userthree@example.com' },
  { username: 'userFour', email: 'userfour@example.com' },
  { username: 'userFive', email: 'userfive@example.com' },
];

const thoughtData = [
  { thoughtText: 'Thought 1', username: 'userOne' },
  { thoughtText: 'Thought 2', username: 'userTwo' },
  { thoughtText: 'Thought 3', username: 'userThree' },
  { thoughtText: 'Thought 4', username: 'userFour' },
  { thoughtText: 'Thought 5', username: 'userFive' },
];

const reactionData = [
  { reactionBody: 'Great thought!', username: 'userOne' },
  { reactionBody: 'Really made me think.', username: 'userTwo' },
  { reactionBody: 'I disagree with this.', username: 'userThree' },
  { reactionBody: 'Could you explain more?', username: 'userFour' },
  { reactionBody: 'What an insight!', username: 'userFive' },
];

db.once('open', async () => {
  try {
    await User.deleteMany({});
    const users = await User.create(userData);

    await Thought.deleteMany({});
    // Link thoughts to their creators and add random creation dates
    const thoughts = await Thought.create(thoughtData.map(thought => ({
      ...thought,
      createdAt: randomDate(moment().subtract(1, 'week').toDate(), new Date())
    })));

    // Assign the thoughts to the corresponding users
    for (let thought of thoughts) {
      const user = users.find(u => u.username === thought.username);
      user.thoughts.push(thought._id);
      await user.save();
    }

    // Create reactions linked to thoughts and random creation dates
    for (let reaction of reactionData) {
      const thought = thoughts[Math.floor(Math.random() * thoughts.length)]; // Random thought for each reaction
      thought.reactions.push({
        reactionBody: reaction.reactionBody,
        username: reaction.username,
        createdAt: randomDate(moment().subtract(1, 'week').toDate(), new Date())
      });
      await thought.save();
    }

    // Make friends association
    for (let i = 0; i < users.length; i++) {
      const friendIds = users.filter((_, index) => index !== i).map(friend => friend._id);
      users[i].friends = friendIds;
      await users[i].save();
    }

    console.log('Database seeded!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
