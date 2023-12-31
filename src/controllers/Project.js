import axios from "axios";
import Project from "../models/Project.js";
import { logActivity } from "./Activity.js";

export const explore = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20
    const page = req.query.page ? parseInt(req.query.page) : 1
    const query = req.query.q || ''

    let projects, count
    
    if (query.trim() == '') {
      projects = await Project.find({}, {
        slug: 1,
        imageURL: 1,
        score: 1,
        name: 1,
        description: 1,
        discord: 1,
        twitter: 1,
        _id: 1
      }).skip((page - 1) * limit).limit(limit)

      count = await Project.count({})
    } else {
      projects = await Project.aggregate([
          { '$search': { 
            'index': 'NFT_Project', 
            'text': { 
              'query': query, 
              'path': { 'wildcard': '*' } 
            } 
          }},
          { "$sort": { "score": { "$meta": "textScore" } } },
          { "$project": {
            slug: 1,
            imageURL: 1,
            score: 1,
            name: 1,
            description: 1,
            discord: 1,
            twitter: 1,
            _id: 1
          }},
          { "$skip": (page - 1) * limit },
          { "$limit": limit },
      ])

      const data = (await Project.aggregate([
        { '$search': { 
          'index': 'NFT_Project', 
          'text': { 
            'query': query, 
            'path': { 'wildcard': '*' } 
          } 
        }},
        { '$count': 'count' }
      ]))

      if (data.length == 0) count = 0
      else count = data[0].count
    }

    const page_count = Math.ceil(count / limit)

    res.status(200).send({
      success: true,
      projects,
      page_count
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const leaderboard = async (req, res) => {
  try {
    const projects = await Project.find({}, {
      slug: 1,
      imageURL: 1,
      score: 1,
      name: 1,
      description: 1,
      discord: 1,
      twitter: 1,
      _id: 1
    })
    .sort({
      score: -1
    })
    .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    res.status(200).send({
      success: true,
      projects
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const view = async (req, res) => {
  try {
    const slug = req.params.slug
    const project = await Project.findOne({slug}).populate({
      path: 'reviews.user',
      select: 'address isAlpha _id username'
    })

    const response = await axios.get(
      `https://api.opensea.io/api/v1/collection/${project.slug}`,
      {
        headers: { 'X-API-KEY': process.env.OPENSEA_API_KEY }
      }
    );

    const openseaData = response.data;

    if (
      !project.social_fetched ||
      project.discord != openseaData.collection['discord_url'] ||
      project.twitter != openseaData.collection['twitter_username']
    ) {
      project.discord = openseaData.collection['discord_url']
      project.twitter = openseaData.collection['twitter_username']
      project.social_fetched = true
      project.save()
    }

    res.status(200).json({
      success: true,
      id: project._id,
      slug: project.slug,
      imageURL: project.imageURL,
      score: project.score,
      vote_count_alpha: project.vote_count_alpha,
      vote_count_user: project.vote_count_user,
      reviews: project.reviews,
      name: openseaData.collection['name'],
      externalURL: openseaData.collection['external_url'],
      description: openseaData.collection['description'],
      discord: openseaData.collection['discord_url'],
      twitter: openseaData.collection['twitter_username'],
      volume: openseaData.collection.stats['total_volume'],
      floorPrice: openseaData.collection.stats['floor_price'],
      count: openseaData.collection.stats['count'],
      owners: openseaData.collection.stats['num_owners'],
      marketCap: openseaData.collection.stats['market_cap'],
      avgPrice: openseaData.collection.stats['average_price'],
      sales: openseaData.collection.stats['total_sales']
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const addReview = async (req, res) => {
  try {
    const user = req.user
    const slug = req.body.slug
    let project = await Project.findOne({ slug })

    const review = {
      user: user.id,
      text: req.body.text,
      score: req.body.score,
      date: new Date()
    };

    if (project.reviews) {
      let oldReview = null
      // If user has already written a review, update it
      for (let i = 0; i < project.reviews.length; i++) {
        if (user._id.equals(project.reviews[i].user)) {
          oldReview = project.reviews[i]

          if ((new Date() - new Date(oldReview.date)) < 1000 * 60 * 10) {
            return res.status(403).send({
              success: false,
              message: 'You have to wait for a while in order to update your review.'
            })
          }

          oldReview.score = review.score
          oldReview.date = review.date
          oldReview.text = review.text
          break
        }
      }

      // Else, add the new review
      if (!oldReview)
        project.reviews.unshift(review);
    }
    else project.reviews = [review];

    await project.save();

    project = await Project.findOne({ slug }).populate({
      path: 'reviews.user',
      select: 'address isAlpha _id username'
    });

    let alphaCount = 0;
    let normalCount = 0;

    let alphaSum = 0;
    let normalSum = 0;

    project.reviews.map((review) => {
      if (review.user.isAlpha) {
        alphaCount++;
        alphaSum += review.score;
      } else {
        normalCount++;
        normalSum += review.score;
      }
    });

    /*let newAlpha = 0;
    let newNormal = 0;

    if (alphaCount !== 0) newAlpha = (0.6 * alphaSum) / alphaCount;
    if (normalCount !== 0) newNormal = (0.4 * normalSum) / normalCount;
    let newScore = newAlpha + newNormal;*/

    let newScore = (normalSum + alphaSum) / (normalCount + alphaCount)
    project.score = newScore;
    project.vote_count_alpha = alphaCount;
    project.vote_count_user = normalCount;

    await project.save();

    user.review_count += 1
    await user.save()

    res.status(200).json({
      success: true,
      score: project.score,
      vote_count_alpha: project.vote_count_alpha,
      vote_count_user: project.vote_count_user,
      reviews: project.reviews
    });

    logActivity('review', user, {
      target_project_id: project._id,
      target_project_name: project.name,
      target_project_slug: project.slug,
      imageURL: project.imageURL
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const favourite = async (req, res) => {
  try {
    const user = req.user
    const slug = req.body.slug
    const project = await Project.findOne({ slug })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'That project was not found'
      })
    }

    if (!req.params.remove && !user.favourites.includes(project._id)) {
      user.favourites.push(project._id)
    }

    if (req.params.remove && user.favourites.includes(project._id)) {
      user.favourites = user.favourites.filter(x => !x.equals(project._id))
    }

    await user.save()

    res.status(200).json({
      success: true,
      favourites: user.favourites
    });

    if (!req.params.remove)
    logActivity('favourite', user, {
      target_project_id: project._id,
      target_project_slug: project.slug,
      target_project_name: project.name,
      imageURL: project.imageURL
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An unknown error occurred'
    })
  }
}

export const unfavourite = async (req, res) => {
  req.params.remove = true
  return await favourite(req, res)
}