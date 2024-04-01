// Chat GPTに送信する関数
import { useRef } from 'react';
import speak from "./speak"; // Speak.js をインポート

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export const sendToChatGPT = async (
  transcript,
  isSpeaking,
  isVoiceEnabled,
  audioRef,
  setHistory,
  setTranscript,
  setIsSpeaking,
  setError,
  setIsAnimating
) => {
  // if (!transcript.trim()) {
  //   setError("Please say something to send.");
  //   return;
  // }
  setHistory((prevHistory) => [
    ...prevHistory,
    { role: "user", content: transcript },
  ]);

  let systemMessage = "You are a helpful assistant.";
  // console.log(transcript);

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

      await speak(
        responseText,
        isSpeaking,
        isVoiceEnabled,
        setIsSpeaking,
        audioRef,
        setIsAnimating
      ); // GPTからの返答を読み上げる関数
      await setHistory((prevHistory) => [
        ...prevHistory,
        { role: "assistant", content: responseText },
      ]);
      setTranscript("");
      setIsSpeaking(true);

    } else {
      console.error("Error sending to ChatGPT:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending to ChatGPT:", error);
  }
};
