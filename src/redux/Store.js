import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reducers
import auth from './reducers/authReducer';
import city from './reducers/cityReducer';
import product from './reducers/productReducer';
import seller from './reducers/sellerReducer';


// Combine reducers
const appReducer = combineReducers({
  auth,
  city,
  product,
  seller,
});


// Reset store when logout / reset action
const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    AsyncStorage.removeItem('persist:root');
    state = undefined;
  }
  return appReducer(state, action);
};


// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // only auth state will persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


// Store configuration
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false, // removes ImmutableStateInvariantMiddleware warning
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});


// Persistor
export const persistor = persistStore(store);

export default store;