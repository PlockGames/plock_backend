// responses.ts

export const GetTagsResponse = {
  status: 200,
  description: 'Tags list',
  isArray: true,
  schema: {
    items: {
      properties: {
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        description: {
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

export const GetTagResponse = {
  status: 200,
  description: 'Tag found',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      description: {
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

export const CreateTagResponse = {
  status: 201,
  description: 'Tag created',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      description: {
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

export const UpdateTagResponse = {
  status: 200,
  description: 'Tag updated',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      description: {
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

export const DeleteTagResponse = {
  status: 200,
  description: 'Tag deleted',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      description: {
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
