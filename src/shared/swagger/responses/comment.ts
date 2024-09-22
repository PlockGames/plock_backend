export const GetCommentsResponse = {
  status: 200,
  description: 'Comments list',
  isArray: true,
  schema: {
    items: {
      properties: {
        id: {
          type: 'string',
        },
        content: {
          type: 'string',
        },
        userId: {
          type: 'string',
        },
        postId: {
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

export const GetCommentResponse = {
  status: 200,
  description: 'Comment found',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      content: {
        type: 'string',
      },
      userId: {
        type: 'string',
      },
      postId: {
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

export const CreateCommentResponse = {
  status: 201,
  description: 'Comment created',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      content: {
        type: 'string',
      },
      userId: {
        type: 'string',
      },
      postId: {
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

export const UpdateCommentResponse = {
  status: 200,
  description: 'Comment updated',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      content: {
        type: 'string',
      },
      userId: {
        type: 'string',
      },
      postId: {
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

export const DeleteCommentResponse = {
  status: 200,
  description: 'Comment deleted',
  schema: {
    properties: {
      id: {
        type: 'string',
      },
      content: {
        type: 'string',
      },
      userId: {
        type: 'string',
      },
      postId: {
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
