const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
const SCOPE = 'user'
const client_id='48e5b8fecfb6a98edd4c'

module.exports = {
    github: {
        request_token_url: 'https://github.com/login/oauth/access_token',
        client_id,
        client_secret: 'f50a3c51ca1f4ca00d57f5ad02946ee0c268dcbc'
    },
    OAUTH_URL: `${GITHUB_OAUTH_URL}?client_id=${client_id}&scope=${SCOPE}`,
    GITHUB_OAUTH_URL
   
}