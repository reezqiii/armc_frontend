const getApiPortal = () => {
  let api_url       = process.env.NEXT_PUBLIC_API_PORTAL
  let link_portal   = process.env.NEXT_PUBLIC_PORTAL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('smoebatam.com')) {
      api_url       = process.env.NEXT_PUBLIC_API_PORTAL
      link_portal   = process.env.NEXT_PUBLIC_PORTAL
    }

    const localIpPattern = /^10\.\d+\.\d+\.\d+$/;
    if (localIpPattern.test(hostname)) {
      api_url     = process.env.NEXT_PUBLIC_API_PORTAL_LOCAL
      link_portal = process.env.NEXT_PUBLIC_PORTAL_LOCAL
    }
  }

  return {
    api_url_default       : api_url,
    link_portal_default   : link_portal
  }

};

const {api_url_default, link_portal_default} = getApiPortal()

const config = {
  API_URL     : api_url_default,
  LINK_PORTAL : link_portal_default,
};

export default config;