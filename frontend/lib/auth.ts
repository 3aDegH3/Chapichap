export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};

export const getAccessToken = () => {
  return localStorage.getItem("access");
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};