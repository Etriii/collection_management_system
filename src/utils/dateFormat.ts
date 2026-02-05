export const formatDate = (date: string | number | Date) => {
  if (!date || date === "Invalid Date" || date === "N/A") {
    return "N/A"
  }

  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch (error) {
    console.error("Error formatting date:", date, error)
    return "Invalid Date"
  }
}