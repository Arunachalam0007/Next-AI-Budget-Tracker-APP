export function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
  }
}

export function serializeTransaction(obj) {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
}

export const RECURRING_INTERVALS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
