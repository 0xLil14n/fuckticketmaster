export const shortMonthName = new Intl.DateTimeFormat('en-US', {
  month: 'short',
}).format;

export const longMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' })
  .format;

export const getDayString = (day: number) => {
  return `${day}${day > 3 ? 'th' : day > 2 ? 'rd' : day > 1 ? 'nd' : 'st'}`;
};

export const dateInSecs = (dateString: string) =>
  Math.floor(new Date(dateString).getTime() / 1000);
