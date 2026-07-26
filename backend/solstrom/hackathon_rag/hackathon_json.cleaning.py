import json

filtered_data = []
prize_names = set()
hackathon_names = set()
all_tracks = set()

with open('/Users/yashwanth/other-projects/AI_ML/solstrom_youtube-chatbot/backend/data/hackathons.json') as file_data:
    hackathons = json.load(file_data)
    hackathons = hackathons.get("hackathons")
    for hackathon_obj in hackathons:
        hackathon_name = hackathon_obj.get("hackathon", {}).get("name")
        hackathon_names.add(hackathon_name)
        prize_groups = hackathon_obj.get("prizeGroups", [])
        for prize_obj in prize_groups:
            prize_name = prize_obj.get("name")
            prize_names.add(prize_name)
            winners = prize_obj.get("winners")
            data_obj = {}
            for winner_obj in winners:
                data_obj['title'] = winner_obj.get("name")
                data_obj['description'] = winner_obj.get("description")
                data_obj['country'] = winner_obj.get("country")
                data_obj['repo_link'] = winner_obj.get("repoLink")
                data_obj['tracks'] = winner_obj.get("tracks")
                data_obj['prize_name'] = prize_name
                data_obj['hackathon_name'] = hackathon_name
                all_tracks.update(winner_obj.get("tracks"))
            filtered_data.append(data_obj)

with open("hackathon_v2.json", 'w') as f:
    json.dump(filtered_data, f, indent=4)