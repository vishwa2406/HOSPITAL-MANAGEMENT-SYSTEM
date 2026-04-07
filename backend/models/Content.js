import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Stethoscope' },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const Service = mongoose.model('Service', serviceSchema);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  author: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

export const Blog = mongoose.model('Blog', blogSchema);

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const FAQ = mongoose.model('FAQ', faqSchema);
