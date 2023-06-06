export const shortMonthName = new Intl.DateTimeFormat('en-US', {
  month: 'short',
}).format;

export const longMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' })
  .format;

export const getDayString = (day: number) => {
  return `${day}${day > 3 ? 'th' : day > 2 ? 'rd' : day > 1 ? 'nd' : 'st'}`;
};
