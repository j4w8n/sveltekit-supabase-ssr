export const load = async ({ setHeaders }) => {
  /**
   * Prevents browsers from caching pages which should be protected in all scenarios.
   * 
   * This is not strictly necessary, but be aware of the following:
   * If a user is logged in and uses a feature that utilizes a form action,
   * when that form action returns, the browser URL still contains the search param.
   * e.g. http://localhost:5173/app?/some_form_action
   * 
   * If the user then logs out and clicks/taps the browser back navigation button,
   * some browsers will serve the previous page via cache, potentially exposing
   * sensitive data. I understand this example is a bit contrived, since
   * the user just saw the data before logging out.
   * 
   * If you aren't concerned about the above, I'd still recommend 
   * setting this to 'private' so sensitive data can't be leaked across users via the cache.
   */
  setHeaders({
    'cache-control': 'no-store'
  })
}