import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axios";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    user: JSON.parse(localStorage.getItem("user")) || {},
    isAuthenticated: !!localStorage.getItem("token"),
    error: null,
    message: null,
    isUpdated: false,
  },
  reducers: {
    loginRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },
    logoutSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
      state.message = action.payload;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = state.isAuthenticated;
      state.user = state.user;
      state.error = action.payload;
    },
    loadUserRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    loadUserSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loadUserFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },
    updatePasswordRequest(state, action) {
      state.loading = true;
      state.isUpdated = false;
      state.message = null;
      state.error = null;
    },
    updatePasswordSuccess(state, action) {
      state.loading = false;
      state.isUpdated = true;
      state.message = action.payload;
      state.error = null;
    },
    updatePasswordFailed(state, action) {
      state.loading = false;
      state.isUpdated = false;
      state.message = null;
      state.error = action.payload;
    },
    updateProfileRequest(state, action) {
      state.loading = true;
      state.isUpdated = false;
      state.message = null;
      state.error = null;
    },
    updateProfileSuccess(state, action) {
      state.loading = false;
      state.isUpdated = true;
      state.message = action.payload;
      state.error = null;
    },
    updateProfileFailed(state, action) {
      state.loading = false;
      state.isUpdated = false;
      state.message = null;
      state.error = action.payload;
    },
    updateProfileResetAfterUpdate(state, action) {
      state.error = null;
      state.isUpdated = false;
      state.message = null;
    },
    clearAllErrors(state, action) {
      state.error = null;
      state = state.user;
    },
  },
});

export const login = (email, password) => async (dispatch) => {
  dispatch(userSlice.actions.loginRequest());
  try {
    const { data } = await axiosInstance.post("/user/login", {
      email,
      password,
    });
    dispatch(userSlice.actions.loginSuccess(data));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(
      userSlice.actions.loginFailed(
        error.response?.data?.message || "Login failed"
      )
    );
  }
};

export const getUser = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  dispatch(userSlice.actions.loadUserRequest());
  try {
    const { data } = await axiosInstance.get("/user/me");
    dispatch(userSlice.actions.loadUserSuccess(data.user));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(userSlice.actions.loadUserFailed(null));
    } else {
      dispatch(
        userSlice.actions.loadUserFailed(
          error.response?.data?.message || "Failed to load user"
        )
      );
    }
  }
};

export const logout = () => async (dispatch) => {
  try {
    const { data } = await axiosInstance.get("/user/logout");
    dispatch(userSlice.actions.logoutSuccess(data.message));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(
      userSlice.actions.logoutFailed(
        error.response?.data?.message || "Logout failed"
      )
    );
  }
};

export const updatePassword =
  (currentPassword, newPassword, confirmNewPassword) => async (dispatch) => {
    dispatch(userSlice.actions.updatePasswordRequest());
    try {
      const { data } = await axiosInstance.put("/user/password/update", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      dispatch(userSlice.actions.updatePasswordSuccess(data.message));
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        userSlice.actions.updatePasswordFailed(
          error.response?.data?.message || "Password update failed"
        )
      );
    }
  };

export const updateProfile = (data) => async (dispatch, getState) => {
  dispatch(userSlice.actions.updateProfileRequest());

  try {
    const token = getState().auth?.token || localStorage.getItem("token");

    const response = await axiosInstance.put("/user/me/profile/update", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // ✅ send the token!
      },
    });

    dispatch(userSlice.actions.updateProfileSuccess(response.data.message));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(
      userSlice.actions.updateProfileFailed(
        error.response?.data?.message || "Profile update failed"
      )
    );
  }
};

export const resetProfile = () => (dispatch) => {
  dispatch(userSlice.actions.updateProfileResetAfterUpdate());
};

export default userSlice.reducer;
