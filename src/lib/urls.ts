export function path(route = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${route.replace(/^\//, '')}`;
}
export const dateLabel = (date: Date) => new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(date);
