import { QueryOptions, PaginatedResult } from '../types/common.type.js';

export class PaginationHelper {
  /**
   * Standardizes database pagination results
   */
  public static mapResult<T>(
    docs: T[],
    totalDocs: number,
    options: QueryOptions
  ): PaginatedResult<T> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
      docs,
      totalDocs,
      limit,
      totalPages,
      page,
      pagingCounter: (page - 1) * limit + 1,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    };
  }
}
