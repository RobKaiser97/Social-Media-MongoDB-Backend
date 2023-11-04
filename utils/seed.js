const db = require('../config/connection');
const { User, Thought } = require('../models');
const { Types } = require('mongoose');
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
  { reactionBody: 'Great thought!', username: 'userOne', reactionId: new Types.ObjectId() },
  { reactionBody: 'Really made me think.', username: 'userTwo', reactionId: new Types.ObjectId() },
  { reactionBody: 'I disagree with this.', username: 'userThree', reactionId: new Types.ObjectId() },
  { reactionBody: 'Could you explain more?', username: 'userFour', reactionId: new Types.ObjectId() },
  { reactionBody: 'What an insight!', username: 'userFive', reactionId: new Types.ObjectId() },
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
        reactionId: reaction.reactionId,
        reactionBody: reaction.reactionBody,
        username: reaction.username,
        createdAt: randomDate(moment().subtract(1, 'week').toDate(), new Date())
      });
      await thought.save();
    }

    // Make friends association
    for (let i = 0; i < users.length; i++) {
      // Generate a random number of friends
      const numFriends = Math.floor(Math.random() * users.length);

      // Create a shuffled array of user indices
      const indices = [...Array(users.length).keys()].sort(() => Math.random() - 0.5);

      // Select the first numFriends indices, excluding the current user's index
      const friendIndices = indices.filter(index => index !== i).slice(0, numFriends);

      // Map the selected indices to their corresponding user IDs
      const friendIds = friendIndices.map(index => users[index]._id);

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
