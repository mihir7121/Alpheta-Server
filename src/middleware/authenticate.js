import jwt from "jsonwebtoken"
import User from "./../models/User.js";

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded.user;

    const user = await User.findOne({_id: req.userData.id})
  
    if(!user) {
      return res.status(400).json({
        success: false,
        message: 'Could not find user'
      })
    }

    req.user = user;

    next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({
      status: false,
      message: 'Missing or invalid authentication token'
    });
  }
}