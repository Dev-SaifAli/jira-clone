import mongoose from 'mongoose'

// Blueprint (Schema) of user

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      unique: true,
      trim:true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    }
  },

  {
    timestamps: true
  }
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
