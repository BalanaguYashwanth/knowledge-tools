import json

with open("/Users/yashwanth/other-projects/AI/youtube-chatbot/backend/data/ideas.json", "r") as f:
    datas = json.load(f)
latest_json = []

for data in datas:
    field = data.get("fields")
    idea_title = field.get("Idea Title")
    problem = field.get("Problem to Solve")
    solution = field.get("Possible Solution")
    category = field.get("Idea Category")
    resources = field.get("Resources")
    name = field.get("Name (from Whitelisted Author)")
    rating = field.get("Rating")
    article_content = field.get("Article Content")
    difficulty = field.get("Difficulty")
    difficulty_score = field.get("Difficulty score")
    published = field.get("Published")

    latest_json.append({
        "title": idea_title,
        "description": article_content,
        "problem": problem,
        "solution": solution,
        "categories": category,
        "resources": resources,
        "author_names": name,
        "difficulty_level": difficulty,
        "difficulty_score": difficulty_score,
        "published": published
    })

with open("ideas_v2.json", "w") as f:
    json.dump(latest_json, f, indent=4)

