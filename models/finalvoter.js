const mongoose = require('mongoose');

const finalupdated38kSchema = new mongoose.Schema(
  {
    corporation: {
      type: String,
      trim: true,
    },

    wardNumber: {
      type: Number,
    },

    boothNumber: {
      type: Number,
    },

    srn: {
      type: Number,
    },

    finalSrno: {
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

    assemblyNo: {
      type: String,
    },

    village: {
      type: String,
    },

    colorCode: {
      type: String,
    },
      mobileOne: {
      type: String,
    },
      mobileTwo: {
      type: String,
    },

    PartNo: {
      type: String,
    },

    houseNo: {
      type: String,
    },
     boothName: {
      type: String,
      trim: true,
    },

    ExtraCheck1: {
      type: String,
      trim: true,
    },
    ExtraCheck2: {
      type: String,
      trim: true,
    },
ExtraInfo1: {
      type: String,
      trim: true,
    },
    ExtraInfo2: {
      type: String,
      trim: true,
    },

ExtraInfo3: {
      type: String,
      trim: true,
    },

    ExtraInfo4: {
      type: String,
      trim: true,
    },

ExtraInfo5: {
      type: String,
      trim: true,
    },
    
Dead: {
      type: String,
      trim: true,
    },

  },
 {
    timestamps: true,
    collection: 'finalupdated38ks', // 🔥 EXACT collection name
  }
);

module.exports = mongoose.model('Finalupdated38k', finalupdated38kSchema);
