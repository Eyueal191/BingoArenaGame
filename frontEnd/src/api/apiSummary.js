const API_BASE_URL = "http://localhost:5000/api/auth";

export const authAPI = {
  baseURL: API_BASE_URL,

  authentication: {
    register: {
      method: "POST",
      url: `${API_BASE_URL}/register`,
      description: "Create a new user account and send email verification OTP",
      body: {
        email: "string",
        password: "string",
      },
    },

    login: {
      method: "POST",
      url: `${API_BASE_URL}/login`,
      description: "Authenticate user and return JWT token",
      body: {
        identifier: "email | phone",
        password: "string",
      },
    },
  },

  passwordManagement: {
    forgotPassword: {
      method: "POST",
      url: `${API_BASE_URL}/forgot-password`,
      description: "Send OTP for password reset",
      body: {
        email: "string",
      },
    },

    resetPassword: {
      method: "POST",
      url: `${API_BASE_URL}/reset-password`,
      description: "Reset password using OTP",
      body: {
        otp: "string",
        newPassword: "string",
      },
    },

    resendPasswordResetOTP: {
      method: "POST",
      url: `${API_BASE_URL}/resend-password-reset-otp`,
      description: "Resend OTP for password reset",
    },
  },

  emailVerification: {
    verifyEmail: {
      method: "POST",
      url: `${API_BASE_URL}/verify-email`,
      description: "Verify user email using OTP",
      body: {
        otp: "string",
      },
    },

    resendEmailVerificationOTP: {
      method: "POST",
      url: `${API_BASE_URL}/resend-email-verification-otp`,
      description: "Resend email verification OTP",
    },
  },

  oauth: {
    google: {
      method: "GET",
      url: `${API_BASE_URL}/google`,
      description: "Redirect user to Google OAuth login",
    },

    googleCallback: {
      method: "GET",
      url: `${API_BASE_URL}/google/callback`,
      description:
        "Handle Google OAuth callback and return JWT or redirect to account completion",
    },

    facebook: {
      method: "GET",
      url: `${API_BASE_URL}/facebook`,
      description: "Redirect user to Facebook OAuth login",
    },

    facebookCallback: {
      method: "GET",
      url: `${API_BASE_URL}/facebook/callback`,
      description:
        "Handle Facebook OAuth callback and return JWT or redirect to account completion",
    },
  },

  account: {
    completeAccount: {
      method: "POST",
      url: `${API_BASE_URL}/complete-account`,
      description: "Complete user profile after OAuth signup",
    },
  },

  responses: {
    success: {
      success: true,
      token: "JWT_TOKEN",
      userId: "USER_ID",
    },
    error: {
      success: false,
      message: "Error message",
    },
  },
};
