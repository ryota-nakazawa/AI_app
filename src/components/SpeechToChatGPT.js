import React, { useState, useRef, useEffect } from "react";
import "../css/main.css";
import CharacterImg from "../images/test.png";
import { sendToChatGPT } from "./SendingAPI"; // SendingAPIをインポート
import { startRecognition } from "./SpeechRecognition"; // SpeechRecognitionをインポート
import ChatMessage from "./ChatMessage"; // ChatMessageコンポーネントをインポート

import {
  BsFillSendFill,
  BsStopCircle,
  BsMic,
  BsFillMicFill,
  BsFillVolumeUpFill,
  BsFillVolumeMuteFill,
} from "react-icons/bs";

const SpeechToChatGPT = () => {
  const [history, setHistory] = useState([]); // 会話の履歴を保持する状態
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const textareaRef = useRef(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isIMEActive, setIsIMEActive] = useState(false);
  const audioRef = useRef(new Audio());

  //アニメーションを実現するためのパラメータ
  const [currentFrame, setCurrentFrame] = useState(0);
  const framePositions = ['0px', '-369px', '-723px', '-1080px']; // 各フレームの位置
  const frameDuration = 250; // フレームの切り替わり間隔（ミリ秒）
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setCurrentFrame((currentFrame) => (currentFrame + 1) % framePositions.length);
      }, frameDuration);
    }
    return () => clearInterval(interval);
  }, [isAnimating, framePositions.length, frameDuration]);

  // const toggleAnimation = () => {
  //   setIsAnimating(!isAnimating);
  // };

  // chatの一番下に自動でスクロールする
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [history]); // historyが更新されるたびに実行

  //テキストの入力が編集中がどうかを判断する
  useEffect(() => {
    document.addEventListener('compositionstart', handleCompositionStart);
    document.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      document.removeEventListener('compositionstart', handleCompositionStart);
      document.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, []);

  // テキスト入力反映
  const handleChange = (event) => {
    setTranscript(event.target.value); // テキスト入力の変更をtranscriptに設定
  };

  const handleCompositionStart = () => {
    setIsIMEActive(true);
  };

  const handleCompositionEnd = () => {
    setIsIMEActive(false);
  };

  // テキストエリアをリサイズする関数
  const resizeTextarea = (event) => {
    const textarea = event.target;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    const minRows = 1;
    const maxRows = 6;

    textarea.style.height = "auto";
    const rows = Math.min(
      Math.max(textarea.scrollHeight / lineHeight, minRows),
      maxRows
    );

    textarea.style.height = `${Math.max(rows, minRows) * lineHeight - 10}px`;
  };

  // 音声入力停止
  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // 音声読み上げのオン/オフを切り替える関数
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  // エンターキーが押され、Shiftキーが押されていない場合に送信する
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !isIMEActive) {
      event.preventDefault(); // デフォルトのエンターキーの動作（改行）を防止
      handleSendToChatGPT(); // チャット送信関数を呼び出す
    }
  };

  // Chat GPTに送信する関数
  const handleSendToChatGPT = () => {
    if (isSendingMessage === true) {
      return;
    }
    setIsSendingMessage(true); // メッセージ送信中の状態をtrueに設定
    stopRecognition(); // レコーディング停止

    sendToChatGPT(
      transcript,
      isSpeaking,
      isVoiceEnabled,
      audioRef,
      setHistory,
      setTranscript,
      setIsSpeaking,
      setError,
      setIsAnimating
    )
      .then(() => {
        setIsSendingMessage(false); // メッセージ送信が完了したら状態をfalseに設定
      })
      .catch((error) => {
        setError(error);
        setIsSendingMessage(false); // エラーが発生した場合も状態をfalseに設定
      });
  };

  // 入力を消去する関数
  const clearTranscript = () => {
    setTranscript("");
    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight - 10
        }px`;
    }
  };

  // GPTの返答を停止する関数
  const stopSpeaking = () => {
    setIsSpeaking(false);
    setIsAnimating(false);
  };

  return (
    <div className="container">
      {/* <button onClick={toggleAnimation}>{isAnimating ? '停止' : 'アニメーション'}</button> */}
      <div className="video-container">
        {isVoiceEnabled ? (
          <BsFillVolumeUpFill className="icon video-icon" onClick={toggleVoice} />
        ) : (
          <BsFillVolumeMuteFill className="icon video-icon" onClick={toggleVoice} />
        )}
        <div
          style={{
            width: '357px', // スプライトの1フレームの幅
            height: '1080px', // スプライトの高さ
            backgroundImage: `url(${CharacterImg})`,
            backgroundPosition: framePositions[currentFrame],
            imageRendering: 'pixelated', // 画像がぼやけないように（必要に応じて）
          }}
        ></div>
      </div>

      <div className="chat-container">
        <div className="chat-history-container" ref={chatHistoryRef}>
          {history.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
        </div>

        <div className="transcript-and-send-container">
          <div className="textarea-with-icon">
            <div className="textarea-container">
              <textarea
                ref={textareaRef}
                rows="1"
                value={transcript}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onInput={resizeTextarea}
              />
            </div>
            <button className="clear-btn" onClick={clearTranscript}>
              ×
            </button>
            {!isRecording && (
              <button
                disabled={isSendingMessage || isSpeaking}
                className="Recording-btn start-btn"
                onClick={() =>
                  startRecognition(
                    setIsRecording,
                    setTranscript,
                    recognitionRef
                  )
                }
              >
                <BsMic className="icon Recording-icon" />
              </button>
            )}
            {isRecording && (
              <button
                disabled={isSendingMessage || isSpeaking}
                className="Recording-btn stop-btn"
                onClick={stopRecognition}
              >
                <BsFillMicFill className="icon Recording-icon" />
              </button>
            )}
          </div>

          {isSpeaking ? (
            <button className="stop-speak-btn" onClick={stopSpeaking}>
              <BsStopCircle className="icon" />
            </button>
          ) : (
            <button
              className="send-btn"
              onClick={handleSendToChatGPT}
              disabled={isSendingMessage}
            >
              <BsFillSendFill className="icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechToChatGPT;
