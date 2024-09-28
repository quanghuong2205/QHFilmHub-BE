import { Types } from 'mongoose';

/**
 * Converts a string ID to a MongoDB ObjectId
 *
 * @param id String Id
 * @returns MongoDB ObjectId
 */
export const createObjectId = (id: string) => {
  return new Types.ObjectId(id);
};
