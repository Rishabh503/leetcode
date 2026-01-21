// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Database helper functions
export async function getDatabase() {
  const client = await clientPromise;
  return client.db('leetcode_tracker');
}

export async function getQuestionsCollection() {
  const db = await getDatabase();
  return db.collection('questions');
}

export async function getSubmissionsCollection() {
  const db = await getDatabase();
  return db.collection('submissions');
}

export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection('users');
}