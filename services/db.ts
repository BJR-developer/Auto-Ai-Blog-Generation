import { neon } from '@neondatabase/serverless';
import { BlogPost } from '../types';

// NOTE: In a production environment, connection strings should not be exposed on the client.
const CONNECTION_STRING = "postgresql://admin:npg_R6EfhvsBHQ4W@ep-rough-night-a5sy2bdi-pooler.us-east-2.aws.neon.tech/autoblog?sslmode=require&channel_binding=require";

// Use the neon HTTP driver which is stateless and robust for browser environments
const sql = neon(CONNECTION_STRING);

// Ensure table exists
export const initDb = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT,
        author TEXT,
        date TEXT,
        read_time TEXT,
        tags TEXT[],
        image_url TEXT,
        image_prompt TEXT
      );
    `;
  } catch (err) {
    console.error("Failed to initialize DB table:", err);
    throw err;
  }
};

export const getPosts = async (): Promise<BlogPost[]> => {
  try {
    // neon returns the rows directly as an array of objects
    const rows = await sql`SELECT * FROM posts ORDER BY date DESC`;
    
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      author: row.author,
      date: row.date,
      readTime: row.read_time,
      tags: row.tags,
      imageUrl: row.image_url,
      imagePrompt: row.image_prompt
    }));
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    throw err;
  }
};

export const createPost = async (post: BlogPost) => {
  try {
    await sql`
      INSERT INTO posts (id, title, excerpt, content, author, date, read_time, tags, image_url, image_prompt)
      VALUES (${post.id}, ${post.title}, ${post.excerpt}, ${post.content}, ${post.author}, ${post.date}, ${post.readTime}, ${post.tags}, ${post.imageUrl ?? null}, ${post.imagePrompt ?? null})
    `;
  } catch (err) {
    console.error("Failed to create post:", err);
    throw err;
  }
};