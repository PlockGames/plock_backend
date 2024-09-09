export const AuthLoginResponse = {
  status: 200,
  description: 'The user access token',
  schema: {
    properties: {
      accessToken: {
        type: 'string',
      },
      refreshToken: {
        type: 'string',
      },
    },
  },
};

export const AuthSignupResponse = {
  status: 200,
  description: 'The user access token',
  schema: {
    properties: {
      accessToken: {
        type: 'string',
      },
      refreshToken: {
        type: 'string',
      },
    },
  },
};

export const AuthMeResponse = {
  status: 200,
  description: 'The user profile',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      username: {
        type: 'string',
      },
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      phoneNumber: {
        type: 'string',
      },
      birthDate: {
        type: 'string',
      },
      role: {
        type: 'string',
      },
      privacy: {
        type: 'boolean',
      },
      pofilePic: {
        type: 'string',
      },
      lastLogin: {
        type: 'string',
      },
      createdAt: {
        type: 'string',
      },
      updatedAt: {
        type: 'string',
      },
    },
  },
};
