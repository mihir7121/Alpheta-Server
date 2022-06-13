import axios from "axios";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import { logActivity } from "./Activity.js";

export const authenticate = async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findOne({ address: address });

    if (!user) {
      user = new User({
        address,
        nonce: Math.floor(Math.random() * 10000000),
        isAlpha: false
      });

      await user.save();
    } else {
      const nonce = Math.floor(Math.random() * 10000000);
      user.nonce = nonce;
      await user.save();
    }

    res.status(200).send({
      success: true,
      address: user.address, 
      nonce: user.nonce
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const verify = async (req, res) => {
  try {
    const { address, signature } = req.body;

    let user = await User.findOne({
      address
    });

    const decodedAddress = ethers.utils.verifyMessage(
      user.nonce.toString(),
      signature
    );

    if (address.toLowerCase() === decodedAddress.toLowerCase()) {
      const payload = {
        user: {
          id: user._id.toString()
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
        (err, token) => {
          if (err) {
            return console.error(err)
          }

          res.status(200).json({
            isAuthenticated: true,
            success: true,
            isAlpha: user.isAlpha,
            address,
            token
          })
        }
      )
    } else {
      console.log('Address did not match');

      res.status(400).json({ 
        success: false,
        message: 'Address did not match'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const feedback = async (req, res) => {
  try {
    const feedback = new Feedback({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      feedback: req.body.feedback,
      date: Date.now()
    })

    await feedback.save()

    res.status(200).json({ 
      success: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const test = async (req, res) => {
  try {

    res.status(200).send({
      success: true,
      users: await User.find({}),
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const leaderboard = async (req, res) => {
  try {
    const users = await User.find({}, {
      address: 1,
      review_count: 1,
      isAlpha: 1
    }).sort({
      review_count: -1
    })

    res.status(200).send({
      success: true,
      leaderboard: users,
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const profile = async (req, res) => {
  try {
    const user = await User.findOne({address: req.params.address}, {
      _id: 1,
      address: 1,
      review_count: 1,
      isAlpha: 1,
      followers: 1,
      following: 1
    }).lean()

    if (user == null) {
      return res.status(404).json({
        success: false,
        message: 'That user was not found'
      })
    }

    user.followers = user.followers.length
    user.following = user.following.length

    res.status(200).send({
      success: true,
      profile: user,
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const viewFavourites = async (req, res) => {
  try {
    const user = await User.findOne({address: req.params.address}, {
      favourites: 1
    }).populate({
      path: 'favourites',
      select: 'slug _id imageURL score name description'
    })

    res.status(200).send({
      success: true,
      favourites: user.favourites,
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const viewActivities = async (req, res) => {
  try {
    const activities = await Activity.find({user_address: req.params.address})
    .sort({
      date: -1
    })
    .limit(10)

    res.status(200).send({
      success: true,
      activities: activities,
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const getInteractions = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      favourites: req.user.favourites,
      followers: req.user.followers,
      following: req.user.following,
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const follow = async (req, res) => {
  try {
    const user = req.user
    const address = req.body.address
    const otherUser = await User.findOne({ address })

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'That user was not found'
      })
    }

    if (!req.params.remove) {
      if (!user.following.includes(otherUser._id)) {
        user.following.push(otherUser._id)
      }

      if (!otherUser.followers.includes(user._id)) {
        otherUser.followers.push(user._id)
      }
    } else {
      user.following = user.following.filter(x => !x.equals(otherUser._id))
      otherUser.followers = otherUser.followers.filter(x => !x.equals(user._id))
    }

    await user.save()
    await otherUser.save()

    res.status(200).json({
      success: true,
      following: user.following
    });

    if (!req.params.remove)
    logActivity('follow', user, {
      target_user_id: otherUser._id,
      target_user_address: otherUser.address
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const unfollow = async (req, res) => {
  req.params.remove = true
  return await follow(req, res)
}