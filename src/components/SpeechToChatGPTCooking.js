import React, { useState, useRef, useEffect } from "react";
import "../css/cook.css";
import CharacterImg1 from "../images/cook.png";
import CharacterImg2 from "../images/cookBoy.png";
import { sendMenuSuggestionRequest } from "./SendingAPICooking"; // 関数のインポート

const SpeechToChatGPTCooking = () => {
  const [ingredients, setIngredients] = useState(Array(5).fill(''));
  const [seasonings, setSeasonings] = useState(Array(5).fill(''));
  const [menuSuggestion, setMenuSuggestion] = useState("");
  const [currentCharacter, setCurrentCharacter] = useState(CharacterImg1);
  const [isLoading, setIsLoading] = useState(false);
  const menuSuggestionRef = useRef(null);

  // useEffectを使用して献立が更新されたらスクロール
  useEffect(() => {
    if (menuSuggestion) {
      scrollToMenuSuggestion();
    }
  }, [menuSuggestion]);

  // 材料のインプットを追加する関数
  const addIngredientInput = () => {
    setIngredients(prev => [...prev, '']);
  };

  // 調味料のインプットを追加する関数
  const addSeasoningInput = () => {
    setSeasonings(prev => [...prev, '']);
  };

  const scrollToMenuSuggestion = () => {
    menuSuggestionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (setter) => (e, index) => {
    // ここでsetterを直接呼び出す際に、新しい値の配列を正しく設定します。
    setter(prevValues => {
      const newValues = [...prevValues]; // 既存の値のコピーを作成
      newValues[index] = e.target.value; // 指定されたインデックスの値を更新
      return newValues; // 更新された配列を返す
    });
  };

  const switchCharacter = () => {
    setCurrentCharacter(currentCharacter === CharacterImg1 ? CharacterImg2 : CharacterImg1);
  };

  const handleSuggestMenu = async () => {
    setIsLoading(true);

    const filteredIngredients = ingredients.filter(item => item.trim() !== '');
    const filteredSeasonings = seasonings.filter(item => item.trim() !== '');

    if (filteredIngredients.length === 0 && filteredSeasonings.length === 0) {
      alert("材料または調味料を少なくとも一つ入力してください。");
      return; // 早期リターンで以降のAPI呼び出しを避ける
    }

    try {
      // APIを呼び出して献立の提案を取得
      const suggestion = await sendMenuSuggestionRequest(ingredients, seasonings);
      // 提案を表示（ここでは例としてアラートを使用）
      setMenuSuggestion(suggestion);
      setIsLoading(false); // ローディング状態をfalseに
      scrollToMenuSuggestion(); // 献立提案のセクションまでスクロール
    } catch (error) {
      // エラー処理
      alert('献立の提案取得中にエラーが発生しました。');
      setIsLoading(false);
    }
  };

  return (
    <div className="container-cook">
      {/* 画像切り替えボタン */}
      <div className="character-container">
        {/* 現在のキャラクター画像を表示 */}
        <img src={currentCharacter} alt="Cook Character" />
      </div>
      {/* アプリの使い方を説明するテキスト */}
      <div className="app-instructions">
        <p>使い方:</p>
        <ol>
          <li>必要な材料と調味料を入力してください。</li>
          <li>材料を追加するには「+」ボタンを押してください。</li>
          <li>献立を提案するボタンを押して、提案を得てください。</li>
        </ol>
      </div>
      {/* ローディングポップアップと背景 */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-popup">献立を考案中です。もう少々お待ちください。</div>
        </div>
      )}
      {/* 献立提案のセクションを参照するために ref を設定 */}
      <button onClick={switchCharacter} className="switch-character-button">キャラクターを切り替える</button>
      <div className="input-sections-container">
        <div className="ingredients-container">
          <h2>材料</h2>
          {ingredients.map((ingredient, index) => (
            <input
              key={`ingredient-${index}`}
              value={ingredient}
              onChange={(e) => handleInputChange(setIngredients)(e, index)}
              placeholder={`材料 ${index + 1}`}
            />
          ))}
          <button onClick={addIngredientInput} className="input-add-button">+</button>
        </div>
        <div className="seasonings-container">
          <h2>調味料</h2>
          {seasonings.map((seasoning, index) => (
            <input
              key={`seasoning-${index}`}
              value={seasoning}
              onChange={(e) => handleInputChange(setSeasonings)(e, index)}
              placeholder={`調味料 ${index + 1}`}
            />
          ))}
          <button onClick={addSeasoningInput} className="input-add-button">+</button>
        </div>
      </div>
      <button className="switch-character-button" onClick={handleSuggestMenu}>献立を提案する</button>
      {/* 献立の提案を表示 */}
      {menuSuggestion && (
        <div className="menu-suggestion-container" ref={menuSuggestionRef}>
          <h3>献立の提案</h3>
          <p>{menuSuggestion}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechToChatGPTCooking;
