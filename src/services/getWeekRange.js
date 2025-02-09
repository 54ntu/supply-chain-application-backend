const getWeekRange = (weeksAgo = 0) => {
  const now = new Date();
  const startOfWeek = new Date(now); //set start of the week
  startOfWeek.setDate(now.getDate() - now.getDay() + weeksAgo * -7);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

module.exports = {
  getWeekRange,
};
