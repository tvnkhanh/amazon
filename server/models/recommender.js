const mongoose = require("mongoose");

const recommenderSchema = mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    item: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    }
});

const Recommender = mongoose.model("Recommender", recommenderSchema);
module.exports = { Recommender, recommenderSchema };
