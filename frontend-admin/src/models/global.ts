// 全局共享数据管理

// 用户信息接口
interface UserInfo {
  id: number;
  username: string;
  realName: string;
  avatar: string;
  role: string;
  isSuper: number;
  lastLoginAt: Date;
}

// 定义全局状态类型
export interface GlobalState {
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  loading: boolean;
}

// 初始状态
export const initialState: GlobalState = {
  userInfo: null,
  isLoggedIn: false,
  loading: false,
};

// 定义model
export default {
  namespace: 'global',
  state: initialState,
  
  // 初始化时从localStorage获取用户信息
  effects: {
    *init(_, { put }) {
      const token = localStorage.getItem('token');
      const savedUserInfo = localStorage.getItem('userInfo');
      
      if (token && savedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(savedUserInfo);
          yield put({ 
            type: 'setUserInfo', 
            payload: parsedUserInfo 
          });
          yield put({ 
            type: 'setIsLoggedIn', 
            payload: true 
          });
        } catch (error) {
          console.error('解析用户信息失败:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
        }
      }
    },
  },
  
  // 同步操作
  reducers: {
    // 设置用户信息
    setUserInfo(state, action) {
      return {
        ...state,
        userInfo: action.payload,
      };
    },
    
    // 设置登录状态
    setIsLoggedIn(state, action) {
      return {
        ...state,
        isLoggedIn: action.payload,
      };
    },
    
    // 设置加载状态
    setLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    
    // 登录成功
    loginSuccess(state, action) {
      const { userInfo, token } = action.payload;
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      return {
        ...state,
        userInfo,
        isLoggedIn: true,
      };
    },
    
    // 登出
    logout(state) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      return {
        ...state,
        userInfo: null,
        isLoggedIn: false,
      };
    },
  },
};
