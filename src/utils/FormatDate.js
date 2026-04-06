export const formatDate = (input) => {
  if (!input) return "-";

  let d;

  // Handle timestamp (number or numeric string)
  if (!isNaN(input)) {
    d = new Date(Number(input));
  } else {
    // Normalize separators
    const normalized = input.replace(/[-.]/g, "/");
    d = new Date(normalized);
  }

  // Invalid date check
  if (isNaN(d.getTime())) return "__";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};