// Превращаем дату создания поста в короткую строку: "now", "5 m", "3 h", "2 d", "4 w"
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks} w`;
  if (days > 0) return `${days} d`;
  if (hours > 0) return `${hours} h`;
  if (minutes > 0) return `${minutes} m`;
  return 'now';
}
