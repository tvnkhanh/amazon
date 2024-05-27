const express = require("express");
const productRouter = express.Router();
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");
const { Recommender } = require("../models/recommender");
const { Feedback } = require("../models/feedback");

productRouter.get("/api/products", auth, async (req, res) => {
  try {
    const products = await Product.find({ category: req.query.category });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/products/search/:name", auth, async (req, res) => {
  try {
    let products = await Product.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, rating } = req.body;
    let product = await Product.findById(id);

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }

    const ratingSchema = {
      userId: req.user,
      rating,
    };

    product.ratings.push(ratingSchema);
    product = product.save();

    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/deal-of-day", auth, async (req, res) => {
  try {
    const recommender = await Recommender.find({ user: req.user });
    let max = 0;
    let result;

    if (recommender.length == 0) {
      let products = await Product.find({});

      products = products.sort((a, b) => {
        let aSum = 0;
        let bSum = 0;

        for (let i = 0; i < a.ratings.length; i++) {
          aSum += a.ratings[i].rating;
        }

        for (let i = 0; i < b.ratings.length; i++) {
          bSum += b.ratings[i].rating;
        }

        return aSum < bSum ? 1 : -1;
      });

      res.json(products[0]);
    } else {
      const feedback = await Feedback.find({ userId: req.user });
      const helpfulItems = feedback
        .filter((f) => f.helpful === true)
        .map((f) => f.itemId);
      const unhelpfulItems = feedback
        .filter((f) => f.helpful === false)
        .map((f) => f.itemId);
      
      recommender.forEach((item) => {
        if (helpfulItems.includes(item._id)) {
          item.score *= 1.1; 
        } else if (unhelpfulItems.includes(item._id)) {
          item.score *= 0.9; 
        }
      });
      
      recommender.sort((a, b) => b.score - a.score);
      
      const product = await Product.findById(recommender[0]['item']);
      res.json(product);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.post("/api/send-feedback", auth, async (req, res) => {
  try {
    const { userId, itemId, helpful } = req.body;
    await Feedback.findOneAndDelete({ userId: userId, itemId: itemId });

    let feedback = new Feedback({
      userId: userId,
      itemId: itemId,
      helpful: helpful,
    });

    feedback.save();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;
