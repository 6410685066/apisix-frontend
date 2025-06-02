const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_APISIX_ADMIN_URL = import.meta.env.VITE_APISIX_ADMIN_URL;


const BackgroundService = {
  callApi: async ({ url, method = 'GET', body = null, headers = {}, isUseBody = false, isBackend = true , isXApi = false , xApiKey, isOther =false}) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      console.log(options.headers);

      if (isUseBody && body) {
        options.body = JSON.stringify(body);
      }

      if (isXApi) {
        options.headers['X-Api-Key'] = xApiKey;
      }

      if (!isOther){
        url = isBackend ? BACKEND_URL + url : VITE_APISIX_ADMIN_URL + url;
      }

      const response = await fetch(url, options);
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error('BackgroundService callApi error:', error);
      throw error;
    }
  }
};

export default BackgroundService;
