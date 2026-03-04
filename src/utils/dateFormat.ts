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

export const formatDateTime = (date: string | number | Date) => {
  if (!date || date === "Invalid Date" || date === "N/A") {
    return "N/A"
  }

  try {
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }

    const formatted = dateObj.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // converts 15 → 3 PM
    })

    return formatted
  } catch (error) {
    console.error("Error formatting date:", date, error)
    return "Invalid Date"
  }
}


export const formatDateToTime = (date: string | number | Date) => {
  if (!date || date === "Invalid Date" || date === "N/A") {
    return "N/A"
  }

  try {
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return "Invalid Time"
    }

    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.error("Error formatting time:", date, error)
    return "Invalid Time"
  }
}

export const formatTimeField = (time: string) => {
  if (!time || time === "N/A") return "N/A"

  try {
    const [hourStr, minuteStr] = time.split(":")
    const hour = Number(hourStr)
    const minute = Number(minuteStr)

    if (isNaN(hour) || isNaN(minute)) return "Invalid Time"

    const dateObj = new Date()
    dateObj.setHours(hour, minute)

    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.error("Error formatting time:", time, error)
    return "Invalid Time"
  }
}