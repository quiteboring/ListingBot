export const formatNumber = (n, d = 1) => {
  if (!n || isNaN(n)) return '0';

  const u = ['', 'K', 'M', 'B', 'T', 'Q'];
  let i = 0;

  while (Math.abs(n) >= 1e3 && i < u.length - 1) {
    n /= 1e3;
    i++;
  }

  return `${n.toFixed(d)}${u[i]}`;
};

export const titleCase = (str) => {
  if (!str) return "";

  if (typeof str !== "string") {
    return "";
  }

  return str
    .toLowerCase()
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}