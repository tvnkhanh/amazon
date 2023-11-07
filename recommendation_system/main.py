from pymongo import MongoClient
from dotenv import dotenv_values
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split

config = dotenv_values(".env")
client = MongoClient(config['ATLAS_URI'])
db = client['test']
collection = db['products']
collection2 = db['recommenders']


# Function to find products in the collection
def find_products():
    products = list(collection.find({}))
    return products


# Function to calculate similarity between users for collaborative filtering
def calculate_similarity_matrix_collab(users_collab, ratings_collab, items_collab):
    similarity_matrix_collab = []

    for i in range(len(users_collab)):
        row = []
        for j in range(len(users_collab)):
            similarities = []
            for k in range(len(items_collab)):
                if i < len(ratings_collab) and j < len(ratings_collab) and k < len(ratings_collab[i]) and k < len(
                        ratings_collab[j]):
                    if ratings_collab[i][k] is not None and ratings_collab[j][k] is not None:
                        similarities.append(ratings_collab[i][k] - ratings_collab[j][k])
            if len(similarities) > 0:
                similarity = sum(similarities) / len(similarities)
                row.append(similarity)
            else:
                row.append(0)
        similarity_matrix_collab.append(row)

    return similarity_matrix_collab


# Function to calculate similarity between users for content-based filtering
def calculate_similarity_matrix_content(users_content, user_features):
    similarity_matrix_content = []

    for i in range(len(users_content)):
        row = []
        for j in range(len(users_content)):
            user1_features = user_features[i]
            user2_features = user_features[j]
            intersection = len(set(user1_features) & set(user2_features))

            # Check if the denominator is zero
            if len(user1_features) + len(user2_features) - intersection == 0:
                similarity = 0
            else:
                similarity = intersection / (len(user1_features) + len(user2_features) - intersection)

            row.append(similarity)
        similarity_matrix_content.append(row)

    return similarity_matrix_content


# Function to generate combined recommendations
def generate_combined_recommendations(users_collab, users_content, items_content, user_ratings,
                                      similarity_matrix_collab, similarity_matrix_content, weight_collab,
                                      weight_content):
    combined_recommendations = []

    for i in range(len(users_content)):
        user_recommendations = []

        for j in range(len(items_content)):
            item = items_content[j]

            if user_ratings[i][j] == 0:
                combined_score = 0

                for k in range(len(users_collab)):
                    similarity_collab = similarity_matrix_collab[i][k]
                    similarity_content = similarity_matrix_content[i][k]

                    combined_similarity = weight_collab * similarity_collab + weight_content * similarity_content
                    user_rating = user_ratings[k][j]

                    combined_score += combined_similarity * user_rating

                user_recommendations.append({'user': users_content[i], 'item': item, 'score': combined_score})

        combined_recommendations.extend(user_recommendations)

    return combined_recommendations


def test_and_evaluate_recommendations(testData, recommendation_matrix):
    true_values = []
    predicted_values = []

    rated_items = set((user, item) for user, item, _ in testData)

    for user, item, _ in testData:
        true_values.append(1 if (user, item) in rated_items else 0)

        predicted_values.append(1 if (user, item) in recommendation_matrix else 0)

    precision = precision_score(true_values, predicted_values, zero_division=1)
    recall = recall_score(true_values, predicted_values, zero_division=1)
    f1 = f1_score(true_values, predicted_values)

    return precision, recall, f1



def genarate_matrix_recommendation(trainData):
    users_collab = []
    items_collab = []
    ratings_collab = []

    for data_point in trainData:
        user = data_point[0]
        item = data_point[1]
        score = data_point[2]

        if item not in items_collab:
            items_collab.append(item)

        if user not in users_collab:
            users_collab.append(user)

        ratings_collab.append([users_collab.index(user), items_collab.index(item), score])

    similarity_matrix_collab = calculate_similarity_matrix_collab(users_collab, ratings_collab, items_collab)

    users_content = []
    items_content = []
    ratings_content = []

    for data_point in trainData:
        user = data_point[0]
        item = data_point[1]
        score = data_point[2]
        description = collection.find_one({'_id': item})['description']
        category = collection.find_one({'_id': item})['category']

        if item not in items_content:
            items_content.append(item)

        if user not in users_content:
            users_content.append(user)

        ratings_content.append([users_content.index(user), items_content.index(item), score])

    user_ratings = [[0] * len(items_content) for _ in range(len(users_content))]

    for rating in ratings_content:
        user = rating[0]
        item = rating[1]
        rating_value = rating[2]
        user_ratings[user][item] = rating_value

    item_features = []

    for item in items_content:
        item_data = collection.find_one({'_id': item})
        description = item_data['description']
        category = item_data['category']
        features = [description, category]
        item_features.append(features)

    user_features = []

    for user in users_content:
        user_ratings_row = user_ratings[users_content.index(user)]
        features = []

        for i in range(len(items_content)):
            rating = user_ratings_row[i]
            if rating > 0:
                item_features_row = item_features[i]
                features.extend(item_features_row)

        user_features.append(features)

    similarity_matrix_content = calculate_similarity_matrix_content(users_content, user_features)

    weight_collab = 0.7
    weight_content = 0.3

    combined_recommendations = generate_combined_recommendations(users_collab, users_content, items_content,
                                                                 user_ratings, similarity_matrix_collab,
                                                                 similarity_matrix_content, weight_collab,
                                                                 weight_content)

    # You can save the recommendations to your database or return them as needed
    collection2.delete_many({})
    collection2.insert_many(combined_recommendations)

    result = []
    for combined_recommend in combined_recommendations:
        result.append([combined_recommend['user'], combined_recommend['item'], combined_recommend['score']])
    return result


def main():
    users_gl = []
    items_gl = []
    scores_gl = []
    products = list(collection.find({}))

    for product in products:
        item = product['_id']
        ratings = product['ratings']

        if item not in items_gl:
            items_gl.append(item)

        for rating in ratings:
            user = rating['userId']
            rating_value = rating['rating']
            if user not in users_gl:
                users_gl.append(user)
            scores_gl.append([user, item, rating_value])

    for user in users_gl:
        for item in items_gl:
            found = False
            for score_entry in scores_gl:
                if score_entry[0] == user and score_entry[1] == item:
                    found = True
                    break
            if not found:
                scores_gl.append([user, item, 0])

    trainData, testData = train_test_split(scores_gl, test_size=0.2, random_state=42)

    recommendation_matrix = genarate_matrix_recommendation(trainData)

    precision, recall, f1 = test_and_evaluate_recommendations(testData, recommendation_matrix)

    print("Precision:", precision)
    print("Recall:", recall)
    print("F1 Score:", f1)


if __name__ == "__main__":
    main()
