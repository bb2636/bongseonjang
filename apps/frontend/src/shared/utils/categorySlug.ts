const CATEGORY_NAME_SEPARATOR = '/';
const CATEGORY_SLUG_SEPARATOR = '-';

export function toCategorySlug(categoryName: string): string {
  return categoryName.split(CATEGORY_NAME_SEPARATOR).join(CATEGORY_SLUG_SEPARATOR);
}
