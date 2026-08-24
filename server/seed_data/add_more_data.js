const fs = require('fs');
const path = require('path');

const staysPath = path.join(__dirname, 'stays.json');
const activitiesPath = path.join(__dirname, 'activities.json');

let stays = JSON.parse(fs.readFileSync(staysPath, 'utf-8'));
let activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'));

const newStays = [
  {
    "name": "Valmiki Jungle Camp",
    "location": "Valmiki Tiger Reserve",
    "city": "West Champaran",
    "latitude": 27.420,
    "longitude": 83.920,
    "price_per_night_inr": 3500,
    "vibe_tags": ["nature", "wildlife", "adventure"],
    "type": "Eco Camp",
    "description": "Stay amidst nature in the dense forests of Valmiki Tiger Reserve. Perfect for wildlife enthusiasts.",
    "amenities": ["guided safaris", "campfires", "basic meals"],
    "best_for": ["adventure", "solo", "couples"]
  },
  {
    "name": "Hotel Minakshi International",
    "location": "Club Road",
    "city": "Muzaffarpur",
    "latitude": 26.120,
    "longitude": 85.390,
    "price_per_night_inr": 4000,
    "vibe_tags": ["business", "comfortable", "city"],
    "type": "Hotel",
    "description": "A comfortable stay in the 'Litchi Kingdom' of India with modern amenities and great service.",
    "amenities": ["wifi", "restaurant", "AC"],
    "best_for": ["business", "family"]
  },
  {
    "name": "Hotel Rajhans International",
    "location": "Kachhari Chowk",
    "city": "Bhagalpur",
    "latitude": 25.242,
    "longitude": 86.974,
    "price_per_night_inr": 3200,
    "vibe_tags": ["silk city", "convenient", "budget"],
    "type": "Hotel",
    "description": "Centrally located hotel in Bhagalpur, ideal for exploring the ancient Vikramshila ruins and silk markets.",
    "amenities": ["wifi", "restaurant", "parking"],
    "best_for": ["business", "solo", "family"]
  },
  {
    "name": "Kaimur Hill Resort",
    "location": "Kaimur Range",
    "city": "Kaimur",
    "latitude": 25.033,
    "longitude": 83.616,
    "price_per_night_inr": 4500,
    "vibe_tags": ["scenic", "nature", "peaceful"],
    "type": "Resort",
    "description": "Scenic resort offering panoramic views of the Kaimur hills and easy access to the wildlife sanctuary.",
    "amenities": ["pool", "restaurant", "hiking trails"],
    "best_for": ["couples", "nature lovers"]
  },
  {
    "name": "Hotel Gargee Grand",
    "location": "Exhibition Road",
    "city": "Patna",
    "latitude": 25.613,
    "longitude": 85.139,
    "price_per_night_inr": 7000,
    "vibe_tags": ["luxury", "modern", "premium"],
    "type": "Luxury Hotel",
    "description": "A premium luxury hotel in Patna known for its excellent hospitality, rooftop pool, and fine dining.",
    "amenities": ["rooftop pool", "spa", "wifi", "gym", "fine dining"],
    "best_for": ["business", "luxury travelers", "couples"]
  },
  {
    "name": "Darbhanga Heritage Palace",
    "location": "Raj Darbhanga",
    "city": "Darbhanga",
    "latitude": 26.154,
    "longitude": 85.897,
    "price_per_night_inr": 6500,
    "vibe_tags": ["heritage", "royal", "culture"],
    "type": "Heritage Hotel",
    "description": "Experience royalty by staying in a restored wing of the historical Darbhanga Raj palace.",
    "amenities": ["vintage decor", "traditional dining", "gardens"],
    "best_for": ["history buffs", "couples"]
  },
  {
    "name": "Munger Fort View Guest House",
    "location": "Near Munger Fort",
    "city": "Munger",
    "latitude": 25.378,
    "longitude": 86.474,
    "price_per_night_inr": 2500,
    "vibe_tags": ["history", "budget", "scenic"],
    "type": "Guest House",
    "description": "Overlooking the majestic Ganges and the historic Munger Fort, offering simple and clean rooms.",
    "amenities": ["river view", "wifi", "basic breakfast"],
    "best_for": ["solo", "backpackers"]
  },
  {
    "name": "Sita Kund Resort",
    "location": "Sitamarhi",
    "city": "Sitamarhi",
    "latitude": 26.598,
    "longitude": 85.490,
    "price_per_night_inr": 3000,
    "vibe_tags": ["spiritual", "peaceful", "family"],
    "type": "Resort",
    "description": "A peaceful resort located near the mythological birthplace of Goddess Sita.",
    "amenities": ["vegetarian food", "garden", "wifi"],
    "best_for": ["pilgrims", "family"]
  },
  {
    "name": "Vikramshila Tourist Lodge",
    "location": "Antichak",
    "city": "Bhagalpur",
    "latitude": 25.318,
    "longitude": 87.279,
    "price_per_night_inr": 1500,
    "vibe_tags": ["budget", "history", "simple"],
    "type": "Lodge",
    "description": "State-run tourist lodge located right next to the Vikramshila University excavation site.",
    "amenities": ["parking", "canteen", "AC"],
    "best_for": ["history buffs", "budget", "students"]
  }
];

const newActivities = [
  {
    "name": "Valmiki Tiger Reserve Safari",
    "location": "Valmiki National Park",
    "city": "West Champaran",
    "latitude": 27.425,
    "longitude": 83.925,
    "price_per_person_inr": 1200,
    "duration_hours": 4,
    "vibe_tags": ["wildlife", "adventure", "nature"],
    "type": "Safari",
    "best_time": "Early Morning",
    "description": "Embark on a jeep safari in Bihar's only national park to spot tigers, leopards, and diverse bird species."
  },
  {
    "name": "Shahi Litchi Farm Tour",
    "location": "Orchards",
    "city": "Muzaffarpur",
    "latitude": 26.130,
    "longitude": 85.395,
    "price_per_person_inr": 300,
    "duration_hours": 2,
    "vibe_tags": ["agritourism", "food", "relaxing"],
    "type": "Tour",
    "best_time": "Morning (May-June)",
    "description": "Walk through lush litchi orchards, learn about the cultivation of the famous Shahi Litchi, and taste fresh fruit."
  },
  {
    "name": "Vikramshila University Ruins Visit",
    "location": "Antichak",
    "city": "Bhagalpur",
    "latitude": 25.318,
    "longitude": 87.279,
    "price_per_person_inr": 100,
    "duration_hours": 3,
    "vibe_tags": ["history", "education", "architecture"],
    "type": "Heritage Tour",
    "best_time": "Morning",
    "description": "Explore the ruins of Vikramshila, one of the two most important centers of Buddhist learning in ancient India."
  },
  {
    "name": "Munger Fort & Bihar School of Yoga",
    "location": "Munger Fort",
    "city": "Munger",
    "latitude": 25.378,
    "longitude": 86.474,
    "price_per_person_inr": 50,
    "duration_hours": 4,
    "vibe_tags": ["history", "spiritual", "wellness"],
    "type": "Sightseeing",
    "best_time": "Morning",
    "description": "Visit the historic Munger Fort on the Ganges and the world-renowned Bihar School of Yoga located within its premises."
  },
  {
    "name": "Kaimur Wildlife Sanctuary Trek",
    "location": "Kaimur Range",
    "city": "Kaimur",
    "latitude": 25.033,
    "longitude": 83.616,
    "price_per_person_inr": 200,
    "duration_hours": 5,
    "vibe_tags": ["trekking", "nature", "wildlife"],
    "type": "Trek",
    "best_time": "Early Morning",
    "description": "Trek through the dense forests and waterfalls of Bihar's largest wildlife sanctuary."
  },
  {
    "name": "Darbhanga Palace Tour",
    "location": "Raj Darbhanga",
    "city": "Darbhanga",
    "latitude": 26.154,
    "longitude": 85.897,
    "price_per_person_inr": 150,
    "duration_hours": 2,
    "vibe_tags": ["culture", "history", "architecture"],
    "type": "Heritage Tour",
    "best_time": "Afternoon",
    "description": "Marvel at the architectural brilliance of the palaces built by the Khandavala dynasty of Darbhanga."
  },
  {
    "name": "Barabar Caves Exploration",
    "location": "Makhdumpur",
    "city": "Jehanabad",
    "latitude": 25.005,
    "longitude": 85.062,
    "price_per_person_inr": 100,
    "duration_hours": 3,
    "vibe_tags": ["history", "architecture", "mystery"],
    "type": "Heritage Tour",
    "best_time": "Morning",
    "description": "Visit the oldest surviving rock-cut caves in India, dating back to the Mauryan Empire (322–185 BCE)."
  },
  {
    "name": "Mandar Hill Climb",
    "location": "Bounsi",
    "city": "Banka",
    "latitude": 24.810,
    "longitude": 87.026,
    "price_per_person_inr": 0,
    "duration_hours": 4,
    "vibe_tags": ["trekking", "mythology", "scenic"],
    "type": "Trek",
    "best_time": "Early Morning",
    "description": "Climb the granite hill believed to be the mythical Mt. Mandara used during the churning of the ocean (Samudra Manthan)."
  },
  {
    "name": "Kanwar Lake Bird Watching",
    "location": "Kanwar Taal",
    "city": "Begusarai",
    "latitude": 25.626,
    "longitude": 86.138,
    "price_per_person_inr": 50,
    "duration_hours": 3,
    "vibe_tags": ["nature", "wildlife", "photography"],
    "type": "Nature Tour",
    "best_time": "Early Morning (Winter)",
    "description": "Watch thousands of migratory birds at Asia's largest freshwater oxbow lake."
  },
  {
    "name": "Kesaria Stupa Visit",
    "location": "Kesaria",
    "city": "East Champaran",
    "latitude": 26.335,
    "longitude": 84.877,
    "price_per_person_inr": 0,
    "duration_hours": 1.5,
    "vibe_tags": ["history", "spiritual", "architecture"],
    "type": "Sightseeing",
    "best_time": "Morning",
    "description": "Visit the tallest and largest Buddhist stupa in the world, built by Emperor Ashoka."
  }
];

stays = stays.concat(newStays);
activities = activities.concat(newActivities);

fs.writeFileSync(staysPath, JSON.stringify(stays, null, 2));
fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2));

console.log('Successfully appended new data!');
