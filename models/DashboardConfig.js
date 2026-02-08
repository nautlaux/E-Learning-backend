const { Schema, model, Types } = require('mongoose');

const sectionSchema = new Schema(
  {
    key: {
      type: String,
      enum: ['course', 'continue', 'freeVideos', 'banner', 'shorts'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    // For key === 'course': 'popular' | 'recommended'. Backend uses this to pick data source and return in GET /dashboard.
    sectionType: { type: String, enum: ['popular', 'recommended'], default: null },
  },
  { _id: true }
);

const dashboardConfigSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, unique: true },
    sections: {
      type: [sectionSchema],
      default: () => [
        { key: 'course', title: 'Most Popular Courses', subtitle: 'Discover our most popular courses', order: 1, isActive: true, sectionType: 'popular' },
        { key: 'course', title: 'Recommended Courses', subtitle: 'Discover our recommended courses', order: 2, isActive: true, sectionType: 'recommended' },
        { key: 'banner', title: 'Banner', subtitle: '', order: 3, isActive: true },
        { key: 'continue', title: 'Continue Courses', subtitle: 'Continue your learning', order: 4, isActive: true },
        { key: 'freeVideos', title: 'Free Videos', subtitle: 'Discover our free videos', order: 5, isActive: true },
        { key: 'shorts', title: 'Shorts', subtitle: 'Short videos & reels', order: 6, isActive: true },
      ],
    },
    addons: {
      type: Schema.Types.Mixed,
      default: () => ({
        language: 'english,hindi,bhojpuri,telugu,kannada,malayalam,punjabi,urdu,sindhi,gujarati,odia,tamil,bengali,marathi',
        darkMode: true,
        theme: 'light,dark',
        font: 'Roboto,Arial,Helvetica,sans-serif',
        fontSize: '14px',
        fontWeight: '400',
        fontColor: '#000000',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
      }),
    },
  },
  { timestamps: true }
);

module.exports = model('DashboardConfig', dashboardConfigSchema);
