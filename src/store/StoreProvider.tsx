'use client'
import { use, useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { AppStore, makeStore, RootState } from '@/store/store'
import { setDarkMode } from './darkMode'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    //storeRef.current.dispatch(setDarkMode(localStorage?.getItem('darkMode') === 'true'))
  } 

  return <Provider store={storeRef.current}>{children}</Provider>
}