import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ResponseManySchema = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        title: `ResponseMany${model.name}`,
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
        ],
      },
    }),
  );
};
