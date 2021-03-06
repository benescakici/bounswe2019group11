const User = require('../models/user');
const errors = require('../helpers/errors');
const ArticleVote = require('../models/articleVote');
const Article = require('../models/article');

module.exports.getNearbyUsers = async (userId) => {
    let location = await User
        .findOne({_id: userId})
        .select({'location.displayName': 1})
        .exec();

    if (!location) {
        throw errors.USER_NOT_FOUND();
    }
    location = location.location.displayName;

    return await User
        .find({'location.displayName': location})
        .select({name: 1, surname: 1})
        .exec();
};

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


module.exports.getRecommendedArticles = async (userId) => {
    const upvotedArticles = await ArticleVote
        .find({userId});
    if (upvotedArticles.length === 0) {
        return [];
    }
    const ind = randomInt(0, upvotedArticles.length - 1);
    const selectedArticleVote = upvotedArticles[ind];
    const selectCondition = {tags: 1, title: 1, body: 1, imgUri: 1};
    const article = await Article
        .findOne({_id: selectedArticleVote.articleId})
        .select(selectCondition)
        .exec();
    if (!article.tags) {
        return [];
    }
    const recommendedArticles = [];
    for (let i = 0; i < article.tags.length; i++) {
        const articles = await Article
            .find({
                $and:
                    [
                        {_id: {$ne: article._id}},
                        {tags: article.tags[i]},
                    ]
            })
            .select(selectCondition)
            .exec();
        recommendedArticles.push(...articles);
    }
    return {
        because: article,
        articles: recommendedArticles
    };
};
