const mongoose = require('mongoose');



const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Register model using lowercase name to match schema refs elsewhere
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;