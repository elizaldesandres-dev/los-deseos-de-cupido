export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local login page route
export const getLoginUrl = () => {
  // Redirect to our local login page
  return `${window.location.origin}/login`;
};
