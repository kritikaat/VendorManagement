import { Schema } from 'mongoose';

export const baseSchemaDefinition = {
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
};

/**
 * A shared schema plugin to exclude soft-deleted docs by default
 */
export function softDeletePlugin(schema: Schema) {
  schema.pre('find', function () {
    this.where({ isDeleted: false });
  });

  schema.pre('findOne', function () {
    this.where({ isDeleted: false });
  });

  schema.pre('findOneAndUpdate', function () {
    this.where({ isDeleted: false });
  });
}
