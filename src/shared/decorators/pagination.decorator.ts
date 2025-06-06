import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          {
            properties: {
              status: { type: 'string', example: 'success' },
              message: { type: 'string', example: 'Message example' },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              timestamp: { type: 'string', example: new Date().toISOString() },
            },
          },
          {
            properties: {
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  lastPage: { type: 'number' },
                  currentPage: { type: 'number' },
                  perPage: { type: 'number' },
                  prev: { type: 'number' },
                  next: { type: 'number' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
