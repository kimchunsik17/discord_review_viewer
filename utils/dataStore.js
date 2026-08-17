import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ reviews: [] }), 'utf-8');
}

export const getReviews = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data).reviews;
  } catch (err) {
    return [];
  }
};

export const saveReview = (review) => {
  const data = getReviews();
  const newReview = {
    id: Date.now().toString(),
    ...review,
    post_date: new Date().toISOString()
  };
  data.push(newReview);
  fs.writeFileSync(dbPath, JSON.stringify({ reviews: data }, null, 2), 'utf-8');
  return newReview;
};

export const getUserReviews = (username) => {
  const data = getReviews();
  return data.filter(r => r.username.toLowerCase() === username.toLowerCase());
};
