export const mascotMessages = {
  welcome: [
    "Hôm nay bạn cảm thấy thế nào? Khởi động ngày mới bằng vài câu TOEIC sẽ giúp bạn phấn khởi hơn đấy!",
    "Chào mừng bạn quay trở lại! Cùng nhau chinh phục TOEIC nhé.",
    "Sẵn sàng cho một buổi luyện tập hiệu quả chưa nào?",
  ],
  onSubmit: [
    "Nộp bài thôi! Cùng xem kết quả nào.",
    "Đã xong! Để xem bạn làm tốt đến đâu nhé.",
    "Tuyệt vời! Giờ là lúc kiểm tra đáp án.",
  ],
  resultGood: [
    "Làm tốt lắm! Bạn đang tiến bộ rất nhanh đó.",
    "Tuyệt vời! Cứ đà này thì 990 TOEIC không còn xa đâu.",
    "Bạn thật sự rất giỏi! Hãy tiếp tục phát huy nhé.",
  ],
  resultOkay: [
    "Khá lắm! Cố gắng thêm một chút nữa nhé, bạn sắp làm được rồi.",
    "Kết quả không tệ đâu. Mỗi lần luyện tập là một lần tiến bộ.",
    "Bạn đã làm rất tốt. Cùng xem lại những câu sai để rút kinh nghiệm nhé.",
  ],
  resultBad: [
    "Đừng nản lòng nhé! Luyện tập chính là chìa khóa để thành công.",
    "Không sao cả. Quan trọng là bạn đã học được gì từ những lỗi sai.",
    "Bạn đừng sợ những lỗi sai nhé, vì những lỗi sai cho ta biết mình vẫn có cơ hội học tập.",
  ],
  startAnalysis: [
    "Để tôi xem nào... chúng ta cùng phân tích câu này nhé!",
    "Một lỗi sai là một cơ hội học hỏi. Cùng tìm hiểu nào!",
    "Đừng lo, tôi sẽ giúp bạn hiểu rõ tại sao đáp án lại như vậy.",
  ],
};

export const getRandomMessage = (category: keyof typeof mascotMessages): string => {
  const messages = mascotMessages[category];
  return messages[Math.floor(Math.random() * messages.length)];
};
