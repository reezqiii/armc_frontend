import { useEffect, useState } from "react";
import config from "../config/api"

const useApi = () => {
  const [apiConfig, setApiConfig] = useState({
    API_URL: config.API_URL,
    LINK_PORTAL: config.LINK_PORTAL,
  });

  return apiConfig;
};

export default useApi;