// Short Videos – MongoDB shell: insert 30 docs (rotate 4 YouTube Shorts links)
// Replace YOUR_DB_NAME, ORGANIZATION_OBJECT_ID, CREATED_BY_USER_OBJECT_ID before running.
// cURL examples: see docs/SHORT_VIDEOS_CURL_AND_MONGO.md

use YOUR_DB_NAME;

var orgId = ObjectId("6972184e424ea4761fff6655");
var createdBy = ObjectId("64f0bbbb2222222222222222");

// 4 videos – rotate through these for 30 shorts
var videos = [
  { url: "https://www.youtube.com/shorts/MpRenFR0jJk", thumb: "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg", title: "Short tip #1" },
  { url: "https://www.youtube.com/shorts/MpRenFR0jJk", thumb: "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg", title: "Short tip #2" },
  { url: "http://youtube.com/shorts/tkMV0U42Qa4", thumb: "https://img.youtube.com/vi/tkMV0U42Qa4/hqdefault.jpg", title: "Short tip #3" },
  { url: "https://www.youtube.com/shorts/ZPE39TK46-A", thumb: "https://img.youtube.com/vi/ZPE39TK46-A/hqdefault.jpg", title: "Short tip #4" }
];

var docs = [];
for (var i = 0; i < 30; i++) {
  var v = videos[i % 4];
  docs.push({
    organizationId: orgId,
    title: v.title + " – " + (i + 1),
    description: "Short video " + (i + 1),
    videoUrl: v.url,
    thumbnailUrl: v.thumb,
    durationSeconds: 45,
    order: i + 1,
    isActive: true,
    createdBy: createdBy,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

db.shortvideos.insertMany(docs);
print("Inserted " + docs.length + " short videos.");
