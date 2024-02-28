"use client"
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from 'next-themes';
import React from 'react'

export default function ButtonDarkMode() {
    const { theme, setTheme } = useTheme()
  
    const toggleDarkMode = () => {
      setTheme(theme === "light" ? "dark" : "light");
    };
  
  return (
    <button onClick={toggleDarkMode} className="size-12 bg-[--btn-darkmode-bg] hover:bg-[--btn-darkmode-border-color] text-[--btn-darkmode-color] font-bold p-2 rounded-full">
        {theme === "dark" ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
      </button>
  )
}
