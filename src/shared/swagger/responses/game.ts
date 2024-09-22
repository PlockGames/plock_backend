// responses.ts

export const GetGamesResponse = {
  status: 200,
  description: 'Games list',
  isArray: true,
  schema: {
    items: {
      properties: {
        id: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        creatorId: {
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

export const GetGameResponse = {
  status: 200,
  description: 'Game found',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      creatorId: {
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

export const CreateGameResponse = {
  status: 201,
  description: 'Game created',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      creatorId: {
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

export const UpdateGameResponse = {
  status: 200,
  description: 'Game updated',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      creatorId: {
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

export const DeleteGameResponse = {
  status: 200,
  description: 'Game deleted',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      creatorId: {
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
