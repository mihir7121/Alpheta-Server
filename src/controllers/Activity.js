import mongoose from "mongoose"
import Activity from "../models/Activity.js"

export const logActivity = async (type, user, extras) => {
  if (user == null) return
  try {
    const activity = new Activity({
      _id: new mongoose.Types.ObjectId(),
      activity_type: type,
      date: Date.now(),
      user_id: user._id,
      user_address: user.address,
      target_user_address: extras.target_user_address,
      target_user_id: extras.target_user_id,
      target_project_id: extras.target_project_id,
      target_project_slug: extras.target_project_slug,
      target_project_name: extras.target_project_name,
      imageURL: extras.imageURL,
    }) 
    await activity.save()
  } catch (error) {
    console.error(error)
  }
}