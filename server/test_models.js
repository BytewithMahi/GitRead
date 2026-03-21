import 'dotenv/config';
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    fs.writeFileSync('server/models_list.json', JSON.stringify(data, null, 2));
    console.log('Saved to models_list.json');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
