import { onUnmounted } from 'vue';
/**
 * Start a countdown timer that updates every second.
 * @param {string|Date} expiryDate - The expiry date or timestamp to count down to.
 * @param {HTMLElement} countdownElement - The DOM element to display the countdown.
 */
// oxlint-disable-next-line no-unused-vars
export default function startCountdown(expiryDate, countdownElement) {
  const expiryTimestamp = new Date(expiryDate).getTime();
  
  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = expiryTimestamp - now;

    // Time calculations
    // const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the countdown
    if (distance > 0) {
      countdownElement.value = `${minutes}m ${seconds}s`;
    } else {
      countdownElement.value = 'Expired';
    }
  };

  // Update the countdown every second
  setInterval(updateCountdown, 1000);

  onUnmounted(() => {
    clearInterval(interval);
  });
}
