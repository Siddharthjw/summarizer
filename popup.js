// Dark mode toggle with icon swap
const darkModeBtn = document.getElementById("dark-mode-btn");

chrome.storage.local.get({ darkMode: false }, ({ darkMode }) => {
  if (darkMode) {
    document.body.classList.add("dark");
    darkModeBtn.textContent = "☀️";
  } else {
    darkModeBtn.textContent = "🌙";
  }
});

darkModeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  darkModeBtn.textContent = isDark ? "☀️" : "🌙";
  chrome.storage.local.set({ darkMode: isDark });
});

// Summarize
document.getElementById("summarize").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading"><div class="loader"></div></div>';
  const summaryType = document.getElementById("summary-type").value;

  chrome.storage.sync.get(["geminiApiKey"], async (result) => {
    if (!result.geminiApiKey) {
      resultDiv.innerHTML = "API key not found. Please set it in options.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (res) => {
        if (!res || !res.text) {
          resultDiv.innerText = "Could not extract article text from this page.";
          return;
        }
        try {
          const summary = await getGeminiSummary(res.text, summaryType, result.geminiApiKey);
          resultDiv.innerText = summary;

          // Save to history with title
          chrome.storage.local.get({ history: [] }, ({ history }) => {
            history.unshift({
              title: tab.title,
              date: new Date().toLocaleString(),
              type: summaryType,
              summary: summary
            });
            if (history.length > 10) history.pop(); // keep last 10
            chrome.storage.local.set({ history });
          });

        } catch (error) {
          resultDiv.innerText = `Error: ${error.message || "Failed to generate summary."}`;
        }
      });
    });
  });
});

// Copy
document.getElementById("copy-btn").addEventListener("click", () => {
  const summaryText = document.getElementById("result").innerText;
  if (summaryText.trim()) {
    navigator.clipboard.writeText(summaryText).then(() => {
      const copyBtn = document.getElementById("copy-btn");
      const originalText = copyBtn.innerText;
      copyBtn.innerText = "Copied!";
      setTimeout(() => copyBtn.innerText = originalText, 2000);
    });
  }
});

// History
document.getElementById("history-btn").addEventListener("click", () => {
  chrome.storage.local.get({ history: [] }, ({ history }) => {
    const resultDiv = document.getElementById("result");
    if (history.length === 0) {
      resultDiv.innerText = "No history yet.";
    } else {
      resultDiv.innerHTML = history
        .map(h => `
          <strong>${h.title}</strong><br>
          ${h.date} (${h.type})<br>
          ${h.summary}
          <hr>
        `)
        .join("");
    }
  });
});

// Gemini API
async function getGeminiSummary(text, summaryType, apiKey) {
  const maxLength = 20000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  switch (summaryType) {
    case "brief":
      prompt = `Provide a brief summary in 2-3 sentences:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary covering all main points:\n\n${truncatedText}`;
      break;

    default:
      prompt = `Summarize the following:\n\n${truncatedText}`;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "API request failed");
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";
}
