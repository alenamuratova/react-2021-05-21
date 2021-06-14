import {
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import { STATUS } from '../constants';
import { addReview } from '../features/reviews';
import api from '../../api';
import { isLoaded, shouldLoad } from '../utils';

export const loadRestaurants = createAsyncThunk(
  'restaurants/load',
  () => api.loadRestaurants(),
  {
    condition: (_, { getState }) => shouldLoadRestaurantsSelector(getState()),
  }
);

const Restaurants = createEntityAdapter();

const initialState = {
  status: STATUS.idle,
  ...Restaurants.getInitialState(),
  error: null,
};

const { reducer } = createSlice({
  name: 'restaurants',
  initialState,
  extraReducers: {
    [loadRestaurants.pending.type]: (state) => {
      state.status = STATUS.pending;
      state.error = null;
    },
    [loadRestaurants.fulfilled.type]: (state, action) => {
      state.status = STATUS.fulfilled;
      Restaurants.addMany(state, action);
    },
    [loadRestaurants.rejected.type]: (state, { error }) => {
      state.status = STATUS.rejected;
      state.error = error;
    },
    [addReview.type]: (state, { meta, payload }) => {
      const { restaurantId } = payload;
      Restaurants.updateOne(state, {
        restaurantId,
        reviews: state.entities[restaurantId].reviews.push(meta.reviewId),
      });
    },
  },
});

export default reducer;

const restaurantsSelectors = Restaurants.getSelectors(
  (state) => state.restaurants
);

const restaurantsSelector = restaurantsSelectors.selectEntities;

const restaurantsStatusSelector = (state) => state.restaurants.status;

export const restaurantsLoadedSelector = isLoaded(restaurantsStatusSelector);
export const shouldLoadRestaurantsSelector = shouldLoad(
  restaurantsStatusSelector
);

export const restaurantsListSelector = createSelector(
  restaurantsSelector,
  Object.values
);

export const restaurantSelector = (state, { id }) =>
  restaurantsSelectors.selectById(state, id);
