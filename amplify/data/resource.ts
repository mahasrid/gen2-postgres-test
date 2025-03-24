import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { schema as generatedSqlSchema } from './schema.sql';

const sqlSchema = generatedSqlSchema.authorization(allow => allow.authenticated())

export type Schema = ClientSchema<typeof sqlSchema>;

export const data = defineData({
  schema: sqlSchema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
