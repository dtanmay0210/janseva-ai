import { NextResponse } from 'next/server';
const fs = require('fs');
const path = require('path');

// Fixes the process.env warning in TypeScript
declare const process: { env: Record<string, string | undefined>; cwd: () => string };

export async function POST(req: Request) {
  try {
    const { query, language = 'English' } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Read schemes.json directly from disk to bypass TS import checks
    const filePath = path.join(process.cwd(), 'data', 'schemes.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const schemesData = JSON.parse(fileContents);

    const apiKey = process.env.GROQ_API_KEY || '';

    const systemPrompt = `You are JanSeva AI, an expert government scheme eligibility assistant.
User Query: "${query}"
Selected Language: ${language}
Available Schemes: ${JSON.stringify(schemesData)}

Match the 2-3 most relevant schemes for this user profile.
Return ONLY valid raw JSON matching this exact structure:
{
  "matches": [
    {
      "schemeName": "Scheme Name",
      "whyEligible": "1-2 concise sentences explaining why they qualify in ${language}",
      "keyBenefit": "Key benefit description",
      "applicationSteps": ["Step 1...", "Step 2...", "Step 3..."],
      "link": "https://official-link"
    }
  ]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate scheme recommendations" },
      { status: 500 }
    );
  }
}