import { query as queryUsers, queryCurrent, queryUserInfo } from '../services/user';

export default {
  namespace: 'user',

  state: {
    userArray: [],
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent({ payload }, { call, put }) {
      const response = yield call(queryCurrent, payload);
      console.log('user.fetchCurrent', response);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },

    *queryUserArray({ payload }, { call, put }) {
      const response = yield call(queryUserInfo, payload);
      yield put({
        type: 'saveUserArray',
        payload: response.data||[],
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      // console.log('user model - reducers -saveCurrentUser', action)
      const currentUser = {
        name: action.payload.data.userName || {},
        ...action.payload.data,
      }

      return {
        ...state,
        currentUser,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    saveUserArray(state, {payload}){
      return {
        ...state,
        userArray: payload,
      };
    },
  },
};
