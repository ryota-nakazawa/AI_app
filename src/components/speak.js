// Chat GPTの応答を音声で読み上げる関数
import axios from 'axios';

export const speak = async (
  text,
  isSpeaking,
  isVoiceEnabled,
  setIsSpeaking,
  audio,
  setIsAnimating
) => {
  if (isVoiceEnabled) {
    try {
      await setIsSpeaking(true);
      await createAudio(text, audio);
      await setIsAnimating(true);

      async function createAudio(text, audio) {
        const data = await createVoice(text);
        audio.current.src = URL.createObjectURL(data); // Audioオブジェクトに音声データを設定
        // console.log("音声再生のfunction呼び出し中");
        audio.current.play();
        // 音声の再生が終了したらアニメーション状態をfalseに設定
        audio.current.onended = () => {
          setIsAnimating(false);
          setIsSpeaking(false); // ここで再生が終了したことを示す
        };
      }

      async function createQuery(text) {
        const response = await axios.post(
          `http://localhost:50021/audio_query?speaker=3&text=${text}`
        );
        return response.data;
      }
      async function createVoice(text) {
        const query = await createQuery(text);
        const response = await axios.post(
          "http://localhost:50021/synthesis?speaker=3",
          query,
          { responseType: "blob" }
        );
        return response.data;
      }

    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    setIsSpeaking(false);
    setIsAnimating(false);
  }
};

export default speak;
