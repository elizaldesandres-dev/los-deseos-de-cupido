export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL for GitHub OAuth
export const getLoginUrl = () => {
  // Redirect to our GitHub OAuth login endpoint
  return `${window.location.origin}/api/oauth/github/login`;
};
