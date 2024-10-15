import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ResponseOneSchema = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        title: `ResponseOne${model.name}`,
        allOf: [
          {
            properties: {
              status: { type: 'string', example: 'success' },
              message: { type: 'string', example: 'Message example' },
              data: { $ref: getSchemaPath(model) },
              timestamp: { type: 'string', example: new Date().toISOString() },
            },
          },
        ],
      },
    }),
  );
};
