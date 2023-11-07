const express = require("express");
const productRouter = express.Router();
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");
const { Recommender } = require("../models/recommender");
const { trainTestSplit } = require("scikit-learn");
const { precisionScore, recallScore, f1Score } = require("scikit-learn");
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

// productRouter.get("/api/deal-of-day", async (req, res) => {
//   try {
//     let products = await Product.find({});

//     const usersCollab = [];
//     const itemsCollab = [];
//     const ratingsCollab = [];

//     products.forEach((product) => {
//       const item = product._id;
//       const data = product.ratings.map((rating) => rating);

//       if (!itemsCollab.includes(item)) {
//         itemsCollab.push(item);
//       }
//       data.forEach((element) => {
//         if (!usersCollab.includes(element.userId)) {
//           usersCollab.push(element.userId);
//         }
//         ratingsCollab.push([
//           usersCollab.indexOf(element.userId),
//           itemsCollab.indexOf(item),
//           element.rating,
//         ]);
//       });
//     });

//     console.log(ratingsCollab)

//     const similarityMatrixCollab = [];
//     for (let i = 0; i < usersCollab.length; i++) {
//       const row = [];
//       for (let j = 0; j < usersCollab.length; j++) {
//         const similarities = [];
//         for (let k = 0; k < itemsCollab.length; k++) {
//           if (ratingsCollab[i][k] && ratingsCollab[j][k]) {
//             similarities.push(ratingsCollab[i][k] - ratingsCollab[j][k]);
//           }
//         }
//         if (similarities.length > 0) {
//           const similarity =
//             similarities.reduce((acc, cur) => acc + cur) / similarities.length;
//           row.push(similarity);
//         } else {
//           row.push(0);
//         }
//       }
//       similarityMatrixCollab.push(row);
//     }

//     // Lọc dựa trên nội dung
//     const usersContent = [];
//     const itemsContent = [];
//     const ratingsContent = [];

//     products.forEach((product) => {
//       const item = product._id;
//       const data = product.ratings.map((rating) => rating);

//       const description = product.description;
//       const category = product.category;
//       if (!itemsContent.includes(item)) {
//         itemsContent.push(item);
//       }
//       data.forEach((element) => {
//         if (!usersContent.includes(element.userId)) {
//           usersContent.push(element.userId);
//         }
//         ratingsContent.push([
//           usersContent.indexOf(element.userId),
//           itemsContent.indexOf(item),
//           element.rating,
//         ]);
//       });
//     });

//     const userRatings = [];

//     for (let i = 0; i < usersContent.length; i++) {
//       const userRatingsRow = [];
//       for (let j = 0; j < itemsContent.length; j++) {
//         userRatingsRow.push(0);
//       }
//       userRatings.push(userRatingsRow);
//     }

//     ratingsContent.forEach((rating) => {
//       const user = rating[0];
//       const item = rating[1];
//       const ratingValue = rating[2];
//       userRatings[user][item] = ratingValue;
//     });

//     const itemFeatures = [];
//     for (const item of itemsContent) {
//       let itemData = await Product.findById(item);
//       const description = itemData.description;
//       const category = itemData.category;
//       const features = [];
//       features.push(description);
//       features.push(category);
//       itemFeatures.push(features);
//     }

//     const userFeatures = [];
//     usersContent.forEach((user) => {
//       const userRatingsRow = userRatings[usersContent.indexOf(user)];
//       const features = [];
//       for (let i = 0; i < itemsContent.length; i++) {
//         const rating = userRatingsRow[i];
//         if (rating > 0) {
//           const itemFeaturesRow = itemFeatures[i];
//           itemFeaturesRow.forEach((feature) => features.push(feature));
//         }
//       }
//       userFeatures.push(features);
//     });

//     const similarityMatrixContent = [];

//     for (let i = 0; i < usersContent.length; i++) {
//       const row = [];
//       for (let j = 0; j < usersContent.length; j++) {
//         const user1Features = userFeatures[i];
//         const user2Features = userFeatures[j];
//         const intersection = user1Features.filter((feature) =>
//           user2Features.includes(feature)
//         );
//         const similarity =
//           intersection.length /
//           (user1Features.length + user2Features.length - intersection.length);
//         row.push(similarity);
//       }
//       similarityMatrixContent.push(row);
//     }

//     const combinedRecommendations = [];

//     for (let i = 0; i < usersContent.length; i++) {
//       const recommendations = [];

//       for (let j = 0; j < itemsContent.length; j++) {
//         const item = itemsContent[j];
//         let combinedScore = 0;

//         // Kết hợp theo trọng số
//         const weightCollab = 0.7; // Trọng số cho lọc cộng tác
//         const weightContent = 0.3; // Trọng số cho lọc dựa trên nội dung

//         for (let k = 0; k < usersCollab.length; k++) {
//           const similarityCollab = similarityMatrixCollab[i][k];
//           const similarityContent = similarityMatrixContent[i][k];

//           // Kết hợp theo trọng số
//           const combinedSimilarity =
//             weightCollab * similarityCollab + weightContent * similarityContent;

//           // Tính điểm dựa trên ma trận tương đồng và điểm của người dùng
//           const userRating = userRatings[k][j]; // Điểm của người dùng k cho sản phẩm j
//           combinedScore += combinedSimilarity * userRating;
//         }

//         recommendations.push({ item, score: combinedScore });
//       }

//       // Sắp xếp các khuyến nghị theo điểm số giảm dần
//       recommendations.sort((a, b) => b.score - a.score);

//       combinedRecommendations.push({ user: usersContent[i], recommendations });
//     }

//     combinedRecommendations.forEach((recommendation) => {
//       const { user, recommendations } = recommendation;
//       const doc = new Recommender({
//         user: user,
//         recommendations: recommendations,
//       });
//       doc.save();
//     });
//     res.json(combinedRecommendations);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// productRouter.get("/api/training", async (req, res) => {
//   try {
//     const recommenders = await Recommender.find({});

//     const data = [];
//     await recommenders.forEach((recommend) => {
//       const user = recommend.user;
//       recommend.recommendations.forEach((doc) => {
//         const item = doc.item;
//         const score = doc.score;
//         data.push([user, item, score]);
//       });
//     });

//     const [trainData, testData] = trainTestSplit(data, { test_size: 0.2 });
//     const recommendationMatrix = buildRecommendationMatrix(trainData);
//     const trueValues = [];
//     const predictedValues = [];
//     for (let i = 0; i < testData.length; i++) {
//       const user = testData[i][0];
//       const item = testData[i][1];
//       const score = testData[i][2];
//       trueValues.push(score);
//       predictedValues.push(recommendationMatrix[user][item]);
//     }
//     const precision = precisionScore(trueValues, predictedValues);
//     const recall = recallScore(trueValues, predictedValues);
//     const f1 = f1Score(trueValues, predictedValues);
//     res.json(trainData);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

module.exports = productRouter;
