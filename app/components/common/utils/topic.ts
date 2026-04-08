export const getDisplayTopic = (topicItem: Map<string, string>) => {
  let firstItem: string = "";

  topicItem.forEach((item, key) => {
    firstItem = item;
  });

  return topicItem.size > 1
    ? `${firstItem} 외 ${topicItem.size - 1}개`
    : firstItem;
};
