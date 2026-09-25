/** Local calendar date as 'YYYY-MM-DD' — avoids UTC off-by-one near midnight. */
export const toDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const todayDateString = () => toDateString(new Date());

export const daysAgoDateString = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return toDateString(date);
};
