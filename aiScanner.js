const analyzeWithAI = async (base64Image, selectedCategory) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const pureBase64 = base64Image.split(",")[1];

    // Simple prompt: Focuses on matching the category and setting priority
    const prompt = `
      Act as an Urban Infrastructure Assistant. 
      The user has selected the category: "${selectedCategory}".
      
      INSTRUCTIONS:
      1. Verify if the image shows a real-world physical issue matching "${selectedCategory}".
      2. Set "matchesCategory" to false if the image is a screenshot, code, text, or a person's face.
      3. Set "priority" to "High" for dangerous/urgent things, "Medium" for standard repairs, or "Low" for minor issues.
      4. Provide a 1-sentence technical summary.

      IMPORTANT: Return ONLY a valid JSON object. No extra text.
      {
        "matchesCategory": true,
        "priority": "Medium",
        "summary": "Visible damage to the infrastructure in an urban setting."
      }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: pureBase64, mimeType: "image/jpeg" } },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // STRONGER JSON CLEANER: 
    // This finds the first '{' and last '}' to ignore any extra words the AI might say.
    const startJson = text.indexOf('{');
    const endJson = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(startJson, endJson);
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("AI Analysis Error:", error);
    // FALLBACK: If AI fails, we allow it but notify the admin via the summary
    return { 
      matchesCategory: true, 
      priority: "Medium", 
      summary: "AI Scanner offline. Manual verification required." 
    };
  }
};