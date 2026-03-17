import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 鍒涘缓 Pinia 瀹炰緥
const store = createPinia()

// 浣跨敤鎸佷箙鍖栨彃浠讹紝鏁版嵁瀛樺偍鍒版湰鍦?
store.use(
  createPersistedState({
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync,
    },
  }),
)

// 绔嬪嵆婵€娲?Pinia 瀹炰緥锛岀‘淇濆湪 app.use(store) 涔嬪墠璋冪敤 store 涔熻兘姝ｅ父宸ヤ綔
setActivePinia(store)

export default store

export * from './theme'
export * from './user'
// 妯″潡缁熶竴瀵煎嚭
export * from './workout'
export * from './loading'
export * from './feedback'

