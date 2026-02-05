const { Schema, model, Types } = require('mongoose');

const sectionSchema = new Schema(
  {
    key: {
      type: String,
      enum: ['course', 'continue', 'freeVideos', 'banner'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    order: { type: Number, required: true },
    bannerId: { type: Types.ObjectId, ref: 'CtoBanner', default: null },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const dashboardConfigSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, unique: true },
    sections: {
      type: [sectionSchema],
      default: () => [
        { key: 'course', title: 'Most Popular Courses', subtitle: 'Discover our most popular courses', order: 1, isActive: true },
        { key: 'course', title: 'Recommended Courses', subtitle: 'Discover our recommended courses', order: 2, isActive: true },
        { key: 'banner', title: 'Banner', subtitle: '', order: 3, isActive: true },
        { key: 'continue', title: 'Continue Courses', subtitle: 'Continue your learning', order: 4, isActive: true },
        { key: 'freeVideos', title: 'Free Videos', subtitle: 'Discover our free videos', order: 5, isActive: true },
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
