import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const store = createPinia()

store.use(
  createPersistedState({
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync,
    },
  }),
)

// Activate Pinia immediately so stores work before app.use(store).
setActivePinia(store)

export default store

export * from './theme'
export * from './user'
export * from './workout'
export * from './loading'
export * from './feedback'
