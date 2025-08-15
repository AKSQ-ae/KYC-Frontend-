import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION || 'ap-southeast-1',
      userPoolId: process.env.REACT_APP_USER_POOL_ID || 'ap-southeast-1_vnzc7l7Sb',
      userPoolClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '6t61naa9tt2t69ve71a7niog2t',
      loginWith: {
        oauth: {
          domain: process.env.REACT_APP_OAUTH_DOMAIN || 'https://ap-southeast-1vnzc7l7sb.auth.ap-southeast-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [window.location.origin],
          redirectSignOut: [window.location.origin],
          responseType: 'code',
        },
        username: true,
        email: true,
      }
    }
  }
};

Amplify.configure(awsConfig);
console.log('Amplify configured:', Amplify.getConfig());
export default awsConfig;