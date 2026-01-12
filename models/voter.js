const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema(
  {
    mahanagarpalika: {
      type: String,
      trim: true,
    },

    wardNumber: {
      type: Number,
    },

    boothNumber: {
      type: Number,
    },

    unuKramank: {
      type: Number,
    },

    untimAnuKrmank: {
      type: Number,
    },

    name: {
      type: String,
      trim: true,
    },

    relativeName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    middleName: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
    },

    age: {
      type: Number,
    },

    voterId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    vidhanSabhaKramank: {
      type: String,
    },

    village: {
      type: String,
    },

    colorCode: {
      type: String,
    },
      mobileNumberOne: {
      type: String,
    },
      mobileNumberTwo: {
      type: String,
    },

    address: {
      type: String,
    },

    homeNumber: {
      type: String,
    },
     nameMarathi: {
      type: String,
      trim: true,
    },

    relativeNameMarathi: {
      type: String,
      trim: true,
    },

    lastNameMarathi: {
      type: String,
      trim: true,
    },

    firstNameMarathi: {
      type: String,
      trim: true,
    },

    middleNameMarathi: {
      type: String,
      trim: true,
    },

    villageMarathi: {
      type: String,
      trim: true,
    },

    addressMarathi: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voter', voterSchema);
