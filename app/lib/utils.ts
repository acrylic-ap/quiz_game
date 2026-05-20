export const generateRoomId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getDisplayTopic = (topicItem: Map<string, string>) => {
  let firstItem: string = "";

  topicItem.forEach((item) => {
    firstItem = item;
  });

  return topicItem.size > 1
    ? `${firstItem} 외 ${topicItem.size - 1}개`
    : !topicItem.size
      ? "선택한 주제가 없습니다."
      : firstItem;
};
