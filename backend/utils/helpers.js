/**
 * Build pagination options from query params
 */
const getPagination = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

/**
 * Build pagination response metadata
 */
const paginationMeta = (total, page, limit) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    };
};

/**
 * Generate slug from text
 */
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

/**
 * Calculate days between two dates
 */
const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Build sort object from query param
 * e.g. "createdAt:desc" or "-createdAt"
 */
const buildSort = (sortQuery, defaultSort = { createdAt: -1 }) => {
    if (!sortQuery) return defaultSort;

    const sort = {};
    const parts = sortQuery.split(',');
    parts.forEach((part) => {
        if (part.startsWith('-')) {
            sort[part.substring(1)] = -1;
        } else if (part.includes(':')) {
            const [field, order] = part.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort[part] = 1;
        }
    });

    return sort;
};

module.exports = {
    getPagination,
    paginationMeta,
    slugify,
    daysBetween,
    buildSort,
};
