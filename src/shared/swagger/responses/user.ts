export const GetUsersResponse = {
  status: 200,
  description: 'Users list',
  isArray: true,
  schema: {
    items: {
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
        profilePic: {
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
  },
};

export const GetUserResponse = {
  status: 200,
  description: 'User found',
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

export const CreateUserResponse = {
  status: 201,
  description: 'User created',
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
      profilePic: {
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

export const UpdateUserResponse = {
  status: 200,
  description: 'User updated',
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
      profilePic: {
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

export const DeleteUserResponse = {
  status: 200,
  description: 'User deleted',
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
      profilePic: {
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
