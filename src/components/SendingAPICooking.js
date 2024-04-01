// SendingAPICooking.js
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

// ChatGPTに献立提案をリクエストする関数
export const sendMenuSuggestionRequest = async (ingredients, seasonings) => {
  // 空でない材料と調味料のみをフィルタリング
  const filteredIngredients = ingredients.filter(item => item.trim() !== '');
  const filteredSeasonings = seasonings.filter(item => item.trim() !== '');

  let systemMessage = "あなたは優秀な料理アドバイザーです。ユーザのスクリプトに応じて適切に献立を提案してください";

  let transcript = `以下の材料と調味料を使って、簡単で美味しい料理の献立を提案してください。材料の一部または全部を使った、2～3の料理を考えてもらえると嬉しいです。もし特定の調味料を使うアイデアがあれば、それも教えてください。なお、この献立は夕食用として考えています。\n\n材料: ${filteredIngredients.join(', ')}\n調味料: ${filteredSeasonings.join(', ')}\n\n具体的な調理方法や、必要であれば追加で必要な材料についても教えてください。また、可能であれば、この献立で特に推奨する料理があれば、その理由も含めて教えてください。`;

  const requestData = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: transcript,
      },
    ],
  };

  try {
    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const data = await response.json();
      const responseText = data.choices[0].message.content;
      // console.log(responseText);
      return responseText; // 応答テキストを返す
    } else {
      console.error("Error sending to ChatGPT:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending to ChatGPT:", error);
  }
};
