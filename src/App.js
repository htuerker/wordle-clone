import React, { useReducer } from "react";
import { useEffect } from "react";
import "./App.css";

import words from "./words";

const wordsHash = words.reduce((hash, current) => {
  hash[current.toUpperCase()] = current;
  return hash;
}, {});

const isAlphabetic = (code) =>
  (code >= 97 && code <= 122) || (code >= 65 && code <= 90);

const isEnter = (code) => code === 13;
const isBackspace = (code) => code === 8;

const keyboard = {
  Q: null,
  W: null,
  E: null,
  R: null,
  T: null,
  Y: null,
  U: null,
  I: null,
  O: null,
  P: null,
  A: null,
  S: null,
  D: null,
  F: null,
  G: null,
  H: null,
  J: null,
  K: null,
  L: null,
  ENTER: null,
  Z: null,
  X: null,
  C: null,
  V: null,
  B: null,
  N: null,
  M: null,
  BACKSPACE: null,
};

const keyboardUI = [
  {
    Q: null,
    W: null,
    E: null,
    R: null,
    T: null,
    Y: null,
    U: null,
    I: null,
    O: null,
    P: null,
  },
  {
    A: null,
    S: null,
    D: null,
    F: null,
    G: null,
    H: null,
    J: null,
    K: null,
    L: null,
  },
  {
    ENTER: null,
    Z: null,
    X: null,
    C: null,
    V: null,
    B: null,
    N: null,
    M: null,
    BACKSPACE: null,
  },
];

const generateClassName = (solution, currentChar, index) => {
  if (!currentChar) {
    return;
  }
  let className = "";
  if (solution[index] === currentChar) {
    className += "green";
  } else {
    if (solution.split("").some((char) => char === currentChar)) {
      className += "yellow";
    } else {
      className += "black";
    }
  }
  return className;
};

const generateInitialState = () => {
  return {
    board: Array(6).fill(Array(5).fill(null)),
    currentRowIndex: 0,
    currentRowInput: "",
    isOver: false,
    isWin: false,
    solution: words[Math.floor(Math.random() * words.length)].toUpperCase(),
    keyboard: { ...keyboard },
    shake: false,
  };
};

const gameReducer = (state = generateInitialState(), action) => {
  const newState = { ...state };
  switch (action.type) {
    case "TYPE_CHAR":
      if (state.currentRowInput.length >= 5) {
        return state;
      }
      return {
        ...newState,
        currentRowInput: state.currentRowInput + action.char.toUpperCase(),
      };
    case "REMOVE_CHAR":
      return { ...state, currentRowInput: state.currentRowInput.slice(0, -1) };
    case "SUBMIT_ROW":
      if (state.currentRowInput.length < 5) {
        return { ...newState, shake: true };
      }
      if (!wordsHash[state.currentRowInput]) {
        return { ...newState, shake: true };
      }
      state.currentRowInput.split("").forEach((char, index) => {
        newState.keyboard[char] = generateClassName(
          state.solution,
          char,
          index
        );
      });
      newState.board[state.currentRowIndex] = state.currentRowInput.split("");

      return {
        ...newState,
        isOver:
          state.currentRowIndex === 5 ||
          state.solution === state.currentRowInput,
        isWin: state.solution === state.currentRowInput,
        currentRowIndex: state.currentRowIndex + 1,
        currentRowInput: "",
      };
    case "CLEAR_SHAKE":
      return { ...newState, shake: false };
    case "RESTART":
      return { ...generateInitialState() };
    default:
      throw new Error(`Unsupported action type: ${action.type}`);
  }
};

const nullRow = Array(5).fill(null);

const App = () => {
  const [gameState, dispatch] = useReducer(gameReducer, generateInitialState());
  const {
    board,
    currentRowIndex,
    currentRowInput,
    isOver,
    isWin,
    solution,
    keyboard,
    shake,
  } = gameState;
  const currentRow = [...currentRowInput.split(""), ...nullRow].slice(0, 5);

  useEffect(() => {
    if (shake) {
      setTimeout(() => dispatch({ type: "CLEAR_SHAKE" }), 500);
    }
  }, [shake]);

  useEffect(() => {
    const listener = (event) => {
      if (gameState.isOver) {
        return;
      }
      if (isEnter(event.keyCode)) {
        dispatch({ type: "SUBMIT_ROW" });
      }
      if (isAlphabetic(event.keyCode)) {
        dispatch({ type: "TYPE_CHAR", char: event.key });
      } else if (isBackspace(event.keyCode)) {
        dispatch({ type: "REMOVE_CHAR" });
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [gameState, dispatch]);

  const handleClick = (key) => {
    switch (key) {
      case "ENTER":
        dispatch({ type: "SUBMIT_ROW" });
        break;
      case "BACKSPACE":
        dispatch({ type: "REMOVE_CHAR" });
        break;
      default:
        dispatch({ type: "TYPE_CHAR", char: key });
        break;
    }
  };

  return (
    <div className="container">
      <div className="board">
        {board.map((word, wordIdx) => (
          <div
            key={wordIdx}
            className={`row ${
              wordIdx === currentRowIndex && shake ? "shake" : ""
            }`}
          >
            {wordIdx === currentRowIndex
              ? currentRow.map((char, charIdx) => (
                  <span key={charIdx} className="col">
                    {char}
                  </span>
                ))
              : word.map((char, charIdx) => (
                  <span
                    key={charIdx}
                    className={`col ${generateClassName(
                      solution,
                      char,
                      charIdx
                    )} ${wordIdx === currentRowIndex - 1 ? "completed" : ""}`}
                    style={{
                      animationDelay: `${charIdx * 100}ms`,
                      transitionDelay: `${charIdx * 100}ms`,
                    }}
                  >
                    {char && char.toUpperCase()}
                  </span>
                ))}
          </div>
        ))}
      </div>
      {shake && <span style={{ fontSize: "1.5rem" }}>Not a word!</span>}
      <div className="modal" style={{ height: isOver ? "auto" : 0 }}>
        {isOver && (
          <div className="modal--content">
            <div>Game Over!</div>
            {isWin ? (
              <div>You found!</div>
            ) : (
              <div className="row">
                {solution
                  .toUpperCase()
                  .split("")
                  .map((char, index) => (
                    <div key={index} className="col green">
                      {char}
                    </div>
                  ))}
              </div>
            )}
            <button onClick={() => dispatch({ type: "RESTART" })}>
              RESTART
            </button>
          </div>
        )}
      </div>
      <div className="keyboard">
        {keyboardUI.map((keyboardRow) => (
          <div className="keyboard-row">
            {Object.keys(keyboardRow).map((key) => (
              <button
                onClick={() => handleClick(key)}
                className={`key ${keyboard[key] ?? ""}`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
