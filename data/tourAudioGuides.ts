export type TourAudioSegment = {
  title: string;
  stopName: string;
  audioFile: string;
  text: string;
  durationSec?: number;
};

export const TOUR_AUDIO_GUIDES: {
  tour2n1d: Record<string, TourAudioSegment>;
  tourLongCocXuanSon: Record<string, TourAudioSegment>;
} = {
  tour2n1d: {
    "viet-tri": {
      title: "Khởi hành từ TP. Việt Trì",
      stopName: "TP. Việt Trì",
      audioFile: "/audio/giong_mau.m4a",
      text: "Xin chào quý khách! Tôi là Trợ lý Du lịch Đất Tổ. Hôm nay, tôi rất vinh hạnh được đồng hành cùng quý khách trong hành trình 2 ngày 1 đêm khám phá vùng Đất Tổ thiêng liêng: từ cội nguồn dân tộc tại Quần thể di tích Đền Hùng, đến không gian khoáng nóng thư giãn tại Lynn Times Thanh Thủy và săn mây tại đỉnh núi mờ sương Tam Đảo. Chúc quý khách một hành trình an toàn, tràn đầy niềm vui!",
      durationSec: 13,
    },
    "mai-anh": {
      title: "Ăn sáng tại Nhà hàng Mai Anh",
      stopName: "Nhà hàng Mai Anh – Hy Cương",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Trước khi bước vào hành trình leo núi chiêm bái Đền Hùng, đoàn chúng ta dừng chân ăn sáng tại Nhà hàng Mai Anh, tọa lạc ngay trên trục đường vào khu di tích xã Hy Cương. Tại đây, quý khách có thể thưởng thức bữa sáng nóng sốt với các món phở bò, bún bò Huế đậm đà hoặc bánh cuốn nóng, nhâm nhi tách cà phê sáng để nạp đầy năng lượng cho hành trình dâng hương phía trước.",
      durationSec: 13,
    },
    "den-hung": {
      title: "Cổng chính & Quần thể Đền Hùng",
      stopName: "Khu di tích lịch sử Đền Hùng",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Chúng ta đang có mặt tại Cổng chính Khu di tích lịch sử Đền Hùng, nằm dưới chân núi Nghĩa Lĩnh linh thiêng. Cổng chính được xây dựng vào năm 1917 thời vua Khải Định. Trên đỉnh cổng nổi bật bức đại tự bốn chữ Hán 'Cao sơn cảnh hành', nghĩa là lên núi cao ngắm cảnh đẹp và noi theo đức hạnh cao vời vợi của các bậc tiền nhân dựng nước. Tuyến hành hương sẽ lần lượt đưa quý khách lên Đền Hạ, Chùa Thiên Quang, Đền Trung, Đền Thượng, Lăng Hùng Vương, Đền Giếng và Bảo tàng Hùng Vương.",
      durationSec: 13,
    },
    "den-hung-ha": {
      title: "Đền Hạ – Cội nguồn trăm trứng",
      stopName: "Đền Hạ",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Trước mắt chúng ta là Đền Hạ, gắn liền với truyền thuyết huyền thoại Mẹ Âu Cơ sinh bọc trăm trứng, nở ra một trăm người con trai – cội nguồn thiêng liêng của hai tiếng 'đồng bào' và dòng dõi 'Con Rồng cháu Tiên' của dân tộc Việt Nam.",
      durationSec: 13,
    },
    "den-hung-chua": {
      title: "Chùa Thiên Quang – Dấu ấn Phật giáo",
      stopName: "Chùa Thiên Quang",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Nằm liền kề Đền Hạ là Chùa Thiên Quang. Trước cửa chùa có cây vạn tuế cổ thụ hơn 800 năm tuổi, nơi vào ngày 19/9/1954 Chủ tịch Hồ Chí Minh đã căn dặn cán bộ, chiến sĩ Đại đoàn Quân Tiên Phong câu nói bất hủ: 'Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước'.",
      durationSec: 13,
    },
    "den-hung-trung": {
      title: "Đền Trung – Bánh chưng bánh giầy",
      stopName: "Đền Trung",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Vượt qua 159 bậc đá, chúng ta đã đến Đền Trung, có tên chữ là 'Hùng Vương Tổ Miếu'. Nơi đây các Vua Hùng cùng các Lạc hầu, Lạc tướng họp bàn việc nước và gắn với sự tích hoàng tử Lang Liêu dâng bánh chưng, bánh giầy vuông tròn.",
      durationSec: 13,
    },
    "den-hung-thuong": {
      title: "Đền Thượng – Kính Thiên Lĩnh Điện",
      stopName: "Đền Thượng & Cột đá thề",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Lên đỉnh núi Nghĩa Lĩnh ở độ cao 175 mét, chúng ta đang đứng trước Đền Thượng – Kính Thiên Lĩnh Điện. Đây là trung tâm linh thiêng bậc nhất của Tín ngưỡng thờ cúng Hùng Vương – Di sản văn hóa phi vật thể của nhân loại, bên cạnh là Cột đá thề gìn giữ non sông trường tồn.",
      durationSec: 13,
    },
    "den-hung-lang": {
      title: "Lăng Hùng Vương – Tưởng niệm tiền nhân",
      stopName: "Lăng Hùng Vương",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Nằm ngay phía đông Đền Thượng là Lăng Hùng Vương, tương truyền là lăng mộ Vua Hùng thứ sáu. Nơi đây mang đến sự tĩnh lặng thiêng liêng để mỗi người con đất Việt tưởng nhớ công đức tiền nhân và bồi đắp đạo lý 'Uống nước nhớ nguồn'.",
      durationSec: 13,
    },
    "den-hung-gieng": {
      title: "Đền Giếng – Giếng Ngọc & Hai công chúa",
      stopName: "Đền Giếng",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Xuôi theo sườn đông nam, chúng ta đến với Đền Giếng, nơi thờ hai công chúa Tiên Dung và Ngọc Hoa. Giếng cổ Ngọc Tỉnh quanh năm nước trong vắt mát lành, gắn với hình ảnh hai công chúa thương dân, dạy cấy lúa dệt vải ấm no.",
      durationSec: 13,
    },
    "den-hung-bao-tang": {
      title: "Bảo tàng Hùng Vương – Đồi Công Quán",
      stopName: "Bảo tàng Hùng Vương",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Tọa lạc trên Đồi Công Quán, Bảo tàng Hùng Vương lưu giữ và trưng bày hơn 4.000 hiện vật khảo cổ học Sơn Vi, Phùng Nguyên, Đồng Đậu, Gò Mun và đỉnh cao là những chiếc trống đồng Đông Sơn thời đại Hùng Vương dựng nước.",
      durationSec: 13,
    },
    "giang-lan": {
      title: "Nhà hàng Giang Lan – Ẩm thực Đền Hùng",
      stopName: "Nhà hàng Giang Lan Đền Hùng",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Đoàn dừng chân ăn trưa tại Nhà hàng Giang Lan Đền Hùng. Nhà hàng nổi tiếng với các món cá lăng sông Lô, cá chiên om chuối đậu, gà đồi hấp lá chanh và thịt chua Thanh Sơn cuốn lá sung đặc sản trứ danh.",
      durationSec: 13,
    },
    "thanh-thuy": {
      title: "Lynn Times Thanh Thủy – Onsen khoáng nóng 5 sao",
      stopName: "Lynn Times Thanh Thủy Resort",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Chào mừng quý khách đến với Lynn Times Thanh Thủy Resort! Tổ hợp nghỉ dưỡng 5 sao sở hữu mạch khoáng nóng Radon quý hiếm tự nhiên, với bể khoáng Onsen phong cách Nhật, xông hơi đá muối Himalaya, phố đi bộ Hokkaido và hồ cá Koi rực rỡ sắc màu.",
      durationSec: 13,
    },
    "tinh-hoa-bac-bo": {
      title: "Nhà hàng Tinh Hoa Bắc Bộ & Chả Cá Sông Đà",
      stopName: "Nhà hàng Tinh Hoa Bắc Bộ",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Bữa tối tại Lynn Times Thanh Thủy, chúng ta thưởng thức món Chả cá sông Đà trứ danh trên phố đi bộ. Cá sông tươi ngon thơm béo xèo xèo trên chảo mỡ cùng thì là, hành hoa, bún tươi và gia vị truyền thống đem lại trải nghiệm ẩm thực thăng hoa khó quên.",
      durationSec: 13,
    },
    "tam-dao-quang-truong": {
      title: "Quảng trường Tam Đảo – Trái tim phố núi",
      stopName: "Quảng trường Tam Đảo",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Sáng ngày thứ hai, chúng ta đặt chân đến Quảng trường trung tâm Tam Đảo ở độ cao gần 1.000 mét. Quảng trường rực rỡ với đài phun nước, bậc thang đá và dòng chữ Tam Đảo nổi bật giữa biển mây bồng bềnh và núi non hùng vĩ.",
      durationSec: 13,
    },
    "tam-dao-nha-tho": {
      title: "Nhà thờ đá Tam Đảo – Kiệt tác Gothic",
      stopName: "Nhà thờ đá Tam Đảo",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Nhà thờ đá cổ Tam Đảo được xây dựng từ đầu thế kỷ XX bằng đá xanh kiên cố theo kiến trúc Gothic uy nghiêm. Các vòm cửa đá cổ kính nhìn xuống thung lũng mây trập trùng tựa như một bức tranh châu Âu lãng mạn giữa mây ngàn.",
      durationSec: 13,
    },
    "tam-dao-nui": {
      title: "Nhà hàng Tam Đảo Núi – Đặc sản ngọn su su",
      stopName: "Nhà hàng Tam Đảo Núi",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Bữa trưa tại Nhà hàng Tam Đảo Núi mang trọn hương vị vùng cao: đĩa ngọn su su xào tỏi xanh non giòn ngọt, gà đồi nướng than hoa vàng rộm và thịt lợn mán nướng xiên thơm nức giữa tiết trời se lạnh mát mẻ.",
      durationSec: 13,
    },
    "tam-dao-cong-troi": {
      title: "Cổng Trời Tam Đảo – Săn mây từ trên cao",
      stopName: "Cổng Trời Tam Đảo",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Khu vực Cổng Trời là điểm ngắm cảnh cao nhất của Tam Đảo. Thưởng thức một tách cà phê ấm nóng, ngắm nhìn biển mây cuồn cuộn tràn qua các sườn thông đại ngàn là khoảnh khắc thư thái tuyệt vời khó phai.",
      durationSec: 13,
    },
    "tam-dao-ket-thuc": {
      title: "Chợ Tam Đảo & Lời kết chia tay hành trình",
      stopName: "Trung tâm Tam Đảo – Về Việt Trì",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Quý khách có thời gian dạo chợ mua những bó ngọn su su tươi non và bánh hạt dẻ về làm quà. Hành trình 2 ngày 1 đêm kết nối Đền Hùng linh thiêng, khoáng nóng Thanh Thủy và Tam Đảo mờ sương đã khép lại trọn vẹn. Trợ lý Du lịch Đất Tổ xin chào và hẹn gặp lại quý khách!",
      durationSec: 13,
    },
  },
  tourLongCocXuanSon: {
    "long-coc-khoi-hanh": {
      title: "Khởi hành từ Việt Trì đi Long Cốc – Xuân Sơn",
      stopName: "TP. Việt Trì",
      audioFile: "/audio/giong_mau.m4a",
      text: "Xin chào quý khách! Tôi là Trợ lý Du lịch Đất Tổ. Hôm nay, tôi rất hân hạnh đồng hành cùng quý khách trong hành trình khám phá hai viên ngọc sinh thái của Phú Thọ: Đồi chè bát úp Long Cốc và Vườn quốc gia Xuân Sơn. Chúc quý khách một chuyến đi tràn đầy sức sống!",
      durationSec: 13,
    },
    "long-coc-doi-che": {
      title: "Đồi chè Long Cốc – Đón bình minh & săn mây",
      stopName: "Đồi chè Long Cốc",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Chào mừng quý khách đến với Đồi chè Long Cốc – 'Vịnh Hạ Long trên cạn' của vùng trung du. Hàng trăm quả đồi chè tròn xoe nhấp nhô như những chiếc bát úp khổng lồ, buổi sớm mây sương bồng bềnh dệt nên khung cảnh kỳ ảo say đắm lòng người.",
      durationSec: 13,
    },
    "long-coc-tony-luan": {
      title: "Ăn sáng tại Homestay Tony Luận",
      stopName: "Homestay Tony Luận Long Cốc",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Sau khi đón bình minh, đoàn dừng chân tại Homestay Tony Luận. Trong không gian nhà sàn gỗ mộc mạc của bản Mường, kính mời quý khách thưởng thức bữa sáng nóng sốt và nhâm nhi tách trà Shan tuyết Long Cốc thơm ngát.",
      durationSec: 13,
    },
    "long-coc-kham-pha": {
      title: "Khám phá & Check-in ốc đảo chè Long Cốc",
      stopName: "Khu chụp ảnh đồi chè Long Cốc",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Khi nắng sớm trải vàng, quý khách tự do dạo bước men theo các lối mòn giữa nương chè, thuê trang phục dân tộc Mường, Dao rực rỡ để lưu lại những khuôn hình kỷ niệm độc đáo giữa không gian bao la của đất trời.",
      durationSec: 13,
    },
    "xuan-son-chuyen-tiep": {
      title: "Cung đường chuyển tiếp sang VQG Xuân Sơn",
      stopName: "Tuyến đường Long Cốc – Xuân Sơn",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Tạm biệt những đồi chè mềm mại của Long Cốc, xe đưa đoàn đến với Vườn quốc gia Xuân Sơn. Cung đường uốn lượn mở ra không gian đại ngàn kỳ vĩ với núi đá vôi sừng sững và những cánh rừng nguyên sinh ngút ngàn.",
      durationSec: 13,
    },
    "vqg-xuan-son": {
      title: "Tham quan Vườn quốc gia Xuân Sơn",
      stopName: "Vườn quốc gia Xuân Sơn",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Chào mừng quý khách đến với Vườn quốc gia Xuân Sơn – lá phổi xanh quý giá của tỉnh Phú Thọ. Nơi đây sở hữu hệ sinh thái rừng nhiệt đới trên núi đá vôi kỳ thú, hang động Hang Na, Hang Lạng thạch nhũ lung linh và Thác Chín Tầng mát lạnh.",
      durationSec: 13,
    },
    "xuan-son-the-nhe": {
      title: "Ăn trưa đặc sản tại Nhà hàng Thế Nhé 1",
      stopName: "Nhà hàng Thế Nhé 1 Xuân Sơn",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Đoàn dừng chân ăn trưa tại Nhà hàng Thế Nhé 1. Bữa trưa mang đậm phong vị đại ngàn: Gà chín cựa nướng than hoa tiến Vua giòn ngọt, đĩa rau dớn rừng xào tỏi xanh non và cá suối chiên giòn thơm nức mũi.",
      durationSec: 13,
    },
    "ban-du-van-hoa": {
      title: "Khám phá Bản Dù & Văn hóa bản địa Dao – Mường",
      stopName: "Bản Dù – VQG Xuân Sơn",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Buổi chiều, chúng ta dạo bước khám phá Bản Dù. Những nếp nhà sàn xinh xắn bên bờ suối, tiếng khung cửi dệt thổ cẩm lách cách và nụ cười thân thiện của đồng bào Dao Tiền, Mường sẽ mang lại cảm giác bình yên, ấm áp.",
      durationSec: 13,
    },
    "long-coc-ve-viet-tri": {
      title: "Khởi hành trở về Việt Trì – Khép lại hành trình",
      stopName: "Bản Dù – Về lại Việt Trì",
      audioFile: "/audio/giong_mau.m4a",
      text: "Kính thưa quý khách! Chiều tà buông xuống, xe đón đoàn khởi hành trở về thành phố Việt Trì. Hành trình săn mây Long Cốc và khám phá rừng già Xuân Sơn đã khép lại trọn vẹn và an toàn. Trợ lý Du lịch Đất Tổ xin cảm ơn và hẹn gặp lại quý khách!",
      durationSec: 13,
    },
  },
};
