class Ollama {
  constructor(pet, mealHistory, diet, reports) {
    this.pet = pet;
    this.mealHistory = mealHistory;
    this.diet = diet;
    this.reports = reports;
  }

  ollamaPrompt(info) {
    return `
 You are a pet healthcare assistant.
 Respond neutrally, clearly, and politely.
 Base your responses on the following structured context.
 If unsure, say "I don't know currently."

 ---
 Pet Info:
 ${JSON.stringify(this.pet, null, 2)}

 Meal History (past month):
 ${JSON.stringify(this.mealHistory, null, 2)}

 Current Diet:
 ${JSON.stringify(this.diet, null, 2)}

 Health Reports (if available):
 ${this.reports ? JSON.stringify(this.reports, null, 2) : "No reports currently"}

 User Question:
 ${info}
 ---
 Guidelines:
 - Be concise (max 3 sentences).
 - Never generate unsafe or emotional content.
 - Use simple, factual language suitable for pet owners.
 `;
  }

  ollamaReccomendationPrompt(info) {
    return `
    You are a veterinary nutrition assistant.

    Your task:
    - Read ALL provided pet data and meal/supplement history.
    - Based on the user's request, generate **up to 4 short recommendations**.
    - Each recommendation must be a single sentence.
    - Format the final response as a **JSON array of strings**.
    - Keep recommendations practical, safe, and based only on the given info.

    ---
    Pet Info:
    ${JSON.stringify(this.pet, null, 2)}

    Meal History (past month):
    ${JSON.stringify(this.mealHistory, null, 2)}

    Current Diet:
    ${JSON.stringify(this.diet, null, 2)}

    Health Reports (if available):
    ${this.reports ? JSON.stringify(this.reports, null, 2) : "No reports currently"}

    User Question:
    ${info}
    ---
    Rules:
    1. Respond ONLY with a JSON array of strings.
    2. Maximum 4 items.
    3. No explanations, no extra text.

    Example:
    ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"]
    `;
  }

  extractJSONArray(text) {
    const match = text.match(/\[([\s\S]*?)\]/);
    if (!match) return [];
    try {
      return JSON.parse(match[0]);
    } catch (_) {
      return [];
    }
  }

  async ResponseReccomendations(info) {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5-coder:14b",
        prompt: this.ollamaReccomendationPrompt(info),
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const clean = this.extractJSONArray(data.response);
    return clean;
  }

  async Response(info) {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5-coder:14b",
        prompt: this.ollamaPrompt(info),
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response.trim();
  }
}

export default Ollama;
