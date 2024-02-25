import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "./state/store";
import { setDarkMode } from "./state/darkMode";
import { useSelector } from "react-redux";

export default function Navbar() {
  const darkMode = useSelector((state: RootState) => state.darkMode.value);
  const dispatch = useDispatch<AppDispatch>();

  const toggleDarkMode = () => {
    //setDarkMode(!darkMode);
    dispatch(setDarkMode(!darkMode));
  };

  useEffect(() => {
    window.localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }
  , [darkMode]);

  return (
    // <nav className={`my-3 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
    <nav className={`my-3 flex place-content-between`}>
      <h1 className="h1 font-bold text-left">Video Annotation Platform</h1>
      <div>
      <button onClick={toggleDarkMode} className="size-12 bg-[--btn-darkmode-bg] hover:bg-[--btn-darkmode-border-color] text-[--btn-darkmode-color] font-bold p-2 rounded-full">
        {darkMode ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
      </button>
      </div>
    </nav>
  );
}