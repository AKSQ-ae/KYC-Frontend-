// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_vnzc7I7Sb",
  client_id: "6t61naa9tt2t69ve71a7niog2t",
  redirect_uri: "https://didactic-funicular-v65wr575557vfpqg7-3000.app.github.dev",
  response_type: "code",
  scope: "phone openid email",
};
const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);