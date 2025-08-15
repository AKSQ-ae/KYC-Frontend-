import { 
  signUp, signIn, confirmSignUp, resendSignUpCode,
  getCurrentUser, signOut, fetchUserAttributes, signInWithRedirect
} from 'aws-amplify/auth';

class AuthService {
  async signUpWithCognito(email, password, fullName) {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email, name: fullName }
        }
      });
      return {
        success: true,
        user: result.user,
        userSub: result.userSub,
        nextStep: result.nextStep
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signInWithCognito(email, password) {
    try {
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        const user = await this.getCurrentUser();
        return { success: true, user, accessToken: result.accessToken };
      }
      return { success: false, nextStep: result.nextStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async verifyEmailWithCognito(email, confirmationCode) {
    try {
      const result = await confirmSignUp({ username: email, confirmationCode });
      return { success: true, nextStep: result.nextStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signInWithGoogle() {
    try {
      await signInWithRedirect({ provider: 'Google' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      return { ...user, attributes };
    } catch (error) {
      return null;
    }
  }

  async signOut() {
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserId() {
    try {
      const user = await this.getCurrentUser();
      return user?.userId || user?.username;
    } catch {
      return null;
    }
  }
}

export default new AuthService();
