const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:8000/api";


// --------Token helpers --------
export const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

const getRefreshToken = () =>
    localStorage.getItem("refresh") || sessionStorage.getItem("refresh");

const isPersistent = () => !!localStorage.getItem("refresh");

export const saveTokens = (data, rememberMe) => {
    const storage = rememberMe? localStorage : sessionStorage;
    storage.setItem("access", data.access); 
    storage.setItem("refresh", data.refresh); 
};

const clearTokens = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    window.dispatchEvent(new Event("session-expired"));
};

// ---------- Refresh logic ----------
let refreshPromise = null; // prevents multiple simultaneous refresh calls

// api.js
async function refreshAccessToken() {
    const refresh = getRefreshToken();
    if (!refresh) return null;
    
    if(!refreshPromise) {
        refreshPromise = fetch(`${BASE_URL}/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ refresh }),
        })
          .then(async (res) => {
            if (!res.ok){
                clearTokens();
                return null;
            }
            const data = await res.json();
            const storage = isPersistent() ? localStorage: sessionStorage;
            storage.setItem("access", data.access);
            if (data.refresh) {
                storage.setItem("refresh", data.refresh);
            }
            return data.access;
          })
          .catch(() => {
            clearTokens();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          }); 
    }
    return refreshPromise;
}

// ---------- Core request wrapper ----------
async function request(endpoint, options = {}, isRetry = false) {
  const token = getToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Access token expired — try refreshing once, then retry the original request
  if (res.status === 401 && !isRetry) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw { status: 401, detail: "Session expired" };
    return request(endpoint, options, true); // retry exactly once
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. DELETE 204)
  }

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data;
}

const apiGet = (endpoint) => request(endpoint);
const apiPost = (endpoint, body) =>
  request(endpoint, { method: "POST", body: JSON.stringify(body) });
const apiPatch = (endpoint, body) =>
  request(endpoint, { method: "PATCH", body: JSON.stringify(body) });
const apiDelete = (endpoint) => request(endpoint, { method: "DELETE" });

// ---------- Task endpoints ----------
export const fetchTasks = () => apiGet("/tasks/");
export const createTask = (data) => apiPost("/tasks/", data);
export const updateTask = (id, data) => apiPatch(`/tasks/${id}/`, data);
export const deleteTask = (id) => apiDelete(`/tasks/${id}/`);

// ---------- Auth endpoints ----------
export const loginUser = (credentials) =>
  apiPost("/accounts/login/", credentials);
export const registerUser = (data) => apiPost("/accounts/", data);
export const fetchCurrentUser = () => apiGet("/accounts/me/");

export const generateTaskSuggestion = (title) =>
  apiPost("/tasks/generate/", { title });

export const fetchHabitPresets = () => apiGet("/tasks/habit-presets/");

export const fetchNotifications = () => apiGet("/tasks/notifications/");

export const fetchProfile = () => apiGet("/accounts/me/");
export const updateProfile = (data) => apiPatch("/accounts/me/", data);
export const changePassword = (data) =>
  apiPost("/accounts/change-password/", data);

export const fetchHabitCalendar = (taskId, days = 30) =>
  request(`/tasks/${taskId}/calendar/?days=${days}`);

export const fetchHabitNudge = (taskId) =>
  apiGet(`/tasks/${taskId}/latest-nudge/`);

export const toggleHabitCompletion = (taskId) =>
  request(`/tasks/${taskId}/toggle-habit/`, { method: "POST" });

// ---------- Duplicate / merge endpoints ----------
export const checkDuplicateTask = (title) =>
  apiPost("/tasks/check-duplicate/", { title });

export const mergeTasks = (mergeTaskIds, newTask) =>
  apiPost("/tasks/merge/", { merge_task_ids: mergeTaskIds, new_task: newTask });

export const generateHabitNudge = (taskId) =>
  apiPost(`/tasks/${taskId}/generate-nudge/`, {});