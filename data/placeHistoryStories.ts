export type HistoryStory = {
  title: string;
  period: string; // e.g. "Thời đại Hùng Vương", "Thế kỷ XX", "Niên đại 800 năm"
  legend: string; // Truyền thuyết dân gian gắn liền
  history: string; // Lịch sử hình thành & giá trị văn hóa
};

export const PLACE_HISTORY_STORIES: Record<string, HistoryStory> = {
  "den-hung": {
    title: "Quần thể Di tích Lịch sử Đền Hùng",
    period: "Thời đại các Vua Hùng dựng nước (khoảng thế kỷ VII TCN)",
    legend: "Tương truyền núi Nghĩa Lĩnh là nơi Mẹ Âu Cơ sinh ra bọc trăm trứng, nở thành một trăm người con trai - cội nguồn của hai tiếng 'đồng bào' và giống nòi 'Con Rồng cháu Tiên'. Khi chia tay, năm mươi người con theo cha Lạc Long Quân xuống biển, năm mươi người con theo mẹ lên núi, người con trưởng được tôn lên làm Vua, hiệu là Hùng Vương, đặt quốc hiệu là Văn Lang, mở đầu thời đại dựng nước của dân tộc Việt Nam.",
    history: "Quần thể Đền Hùng tọa lạc trên núi Nghĩa Lĩnh cao 175m, gồm Cổng Đền (xây dựng năm 1917 với bức đại tự 'Cao sơn cảnh hành'), Đền Hạ, Chùa Thiên Quang, Đền Trung, Đền Thượng, Lăng Hùng Vương và Đền Giếng. Năm 2012, Tín ngưỡng thờ cúng Hùng Vương tại Phú Thọ chính thức được UNESCO vinh danh là Di sản văn hóa phi vật thể đại diện của nhân loại.",
  },
  "den-hung-ha": {
    title: "Đền Hạ – Nơi khởi nguồn trăm trứng",
    period: "Thời Hùng Vương dựng nước",
    legend: "Gắn liền với truyền thuyết huyền thoại Mẹ Âu Cơ sinh bọc trăm trứng nở thành 100 người con trai. Sau này, 50 con theo cha về biển, 50 con theo mẹ lên núi, thể hiện tinh thần đoàn kết keo sơn 'đồng bào' chung một bọc của người Việt muôn đời.",
    history: "Đền Hạ được xây dựng lại vào thời Hậu Lê (thế kỷ XVII - XVIII) theo kiểu chữ Nhị, gồm hai tòa tiền tế và hậu cung. Nơi đây là điểm dừng chân đầu tiên trên cung đường hành hương lên đỉnh Nghĩa Lĩnh.",
  },
  "den-hung-chua": {
    title: "Chùa Thiên Quang – Dấu ấn Phật giáo & Lời dặn Bác Hồ",
    period: "Thế kỷ XII (thời nhà Trần) & Ngày 19/9/1954",
    legend: "Chùa Thiên Quang mang ý nghĩa 'Ánh sáng từ trời chiếu rọi', thể hiện sự giao thoa hài hòa giữa tín ngưỡng thờ cúng tổ tiên và triết lý từ bi của đạo Phật trong tâm thức dân gian người Việt.",
    history: "Trước cửa chùa có cây vạn tuế cổ thụ ba nhánh hơn 800 năm tuổi. Vào sáng ngày 19/9/1954, bên gốc vạn tuế này, Chủ tịch Hồ Chí Minh đã căn dặn cán bộ, chiến sĩ Đại đoàn Quân Tiên Phong câu nói bất hủ đã khắc sâu vào lịch sử: 'Các Vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước'.",
  },
  "den-hung-trung": {
    title: "Đền Trung – Hùng Vương Tổ Miếu & Bánh chưng, bánh giầy",
    period: "Thời Hùng Vương thứ 6",
    legend: "Nơi Vua Hùng họp bàn việc nước với các Lạc hầu, Lạc tướng và là nơi diễn ra cuộc thi dâng lễ vật chọn người kế vị. Hoàng tử Lang Liêu đã dùng hạt gạo quê hương làm nên chiếc bánh chưng vuông tượng trưng cho Đất và bánh giầy tròn tượng trưng cho Trời, biểu tượng của lòng hiếu thảo và sự trân quý thiên nhiên.",
    history: "Đền Trung có tên chữ là 'Hùng Vương Tổ Miếu', xây dựng theo hình chữ Đinh gồm 3 gian tiền tế và 1 gian hậu cung. Vượt qua 159 bậc đá từ Đền Hạ, du khách đặt chân tới ngôi đền trầm mặc giữa lưng chừng núi mờ sương.",
  },
  "den-hung-thuong": {
    title: "Đền Thượng – Kính Thiên Lĩnh Điện & Cột đá thề",
    period: "Đỉnh núi Nghĩa Lĩnh – Thời Hùng Vương & Thục Phán An Dương Vương",
    legend: "Đỉnh núi Nghĩa Lĩnh là nơi các Vua Hùng lập đàn Kính Thiên tế Trời Đất, cầu cho mưa thuận gió hòa, mùa màng tốt tươi, muôn dân no ấm. Bên cạnh đền có Cột đá thề do Thục Phán An Dương Vương dựng lên thề đời đời gìn giữ non sông sau khi nhận chuyển giao ngôi báu từ Vua Hùng thứ 18.",
    history: "Đền Thượng có tên chữ 'Kính Thiên Lĩnh Điện' (Điện thờ Trời trên núi cao), nằm ở độ cao 175 mét so với mực nước biển. Đây là trung tâm thực hành các nghi lễ quốc gia trang nghiêm nhất trong ngày Giỗ Tổ Hùng Vương mùng 10 tháng 3 âm lịch.",
  },
  "den-hung-lang": {
    title: "Lăng Hùng Vương – Nơi an nghỉ tiền nhân",
    period: "Thời Hùng Vương thứ 6",
    legend: "Tương truyền sau khi đánh thắng giặc Ân nhờ sự phò trợ của Thánh Gióng Phù Đổng Thiên Vương, Vua Hùng thứ sáu đã hóa thân tại đây. Nhân dân tưởng nhớ công đức vĩ đại nên đã xây lăng mộ phụng thờ đời đời.",
    history: "Lăng nằm ở phía đông Đền Thượng, đầu gối vào đỉnh núi, mặt quay hướng đông nam nhìn ra ngã ba sông Hạc. Lăng được trùng tu tôn tạo năm Khải Định thứ 7 (1922) với kiến trúc hình tháp vuông vức, trang nghiêm cổ kính.",
  },
  "den-hung-gieng": {
    title: "Đền Giếng – Giếng Ngọc Tỉnh & Hai nàng công chúa",
    period: "Thời Hùng Vương thứ 18",
    legend: "Đền thờ hai người con gái hiếu thảo của Vua Hùng thứ 18 là công chúa Tiên Dung (kết duyên cùng chàng trai nghèo Chử Đồng Tử lập nên đầm Nhất Dạ) và công chúa Ngọc Hoa (kết duyên cùng Sơn Tinh - Tản Viên Sơn Thánh đẩy lùi Thủy Tinh dâng nước). Hai nàng thường soi bóng vấn tóc bên Giếng Ngọc Tỉnh và dạy dân chúng cấy lúa, trồng dâu, dệt vải ấm no.",
    history: "Đền Giếng tọa lạc dưới chân núi Nghĩa Lĩnh ở sườn đông nam, xây dựng từ thế kỷ XVIII. Giếng Ngọc cổ quanh năm nước trong vắt, mát lành, là điểm chiêm bái linh thiêng kết thúc chặng đường leo núi.",
  },
  "den-hung-bao-tang": {
    title: "Bảo tàng Hùng Vương – Đồi Công Quán",
    period: "Thời kỳ văn hóa Tiền Đông Sơn & Đông Sơn rực rỡ",
    legend: "Tương truyền Đồi Công Quán xưa kia là nơi các tù trưởng, thủ lĩnh các bộ lạc và khách bốn phương tụ hội về trước khi lên núi bái yết Vua Hùng.",
    history: "Bảo tàng Hùng Vương được thiết kế theo triết lý 'Trời tròn Đất vuông', hiện lưu giữ và trưng bày hơn 4.000 hiện vật khảo cổ học quý giá qua các giai đoạn văn hóa Sơn Vi, Phùng Nguyên, Đồng Đậu, Gò Mun và đỉnh cao là những chiếc trống đồng Đông Sơn thời đại Hùng Vương dựng nước.",
  },
  "thanh-thuy": {
    title: "Khu khoáng nóng Thanh Thủy & Lynn Times",
    period: "Mạch khoáng Radon tự nhiên hình thành hàng triệu năm",
    legend: "Dân gian truyền tụng vùng đất Thanh Thủy được thiên nhiên ưu ái ban tặng nguồn 'nước thần' ngầm ấm áp phun trào từ lòng đất, nơi các bậc vương giả xưa thường tìm về ngâm tắm để dưỡng sinh, trừ hàn tà và phục hồi sinh lực.",
    history: "Khoáng nóng Thanh Thủy là một trong số rất ít mỏ khoáng trên toàn quốc sở hữu thành phần Radon quý hiếm tự nhiên, duy trì nhiệt độ lý tưởng 37°C – 53°C quanh năm. Quần thể Lynn Times Thanh Thủy được phát triển theo chuẩn phong cách Onsen Nhật Bản 5 sao kết hợp phố đi bộ Hokkaido và công viên khoáng nóng hiện đại.",
  },
  "tam-dao": {
    title: "Khu du lịch Quốc gia Tam Đảo",
    period: "Phát hiện & Quy hoạch nghỉ dưỡng từ đầu thế kỷ XX (năm 1904)",
    legend: "Tam Đảo được đặt tên theo ba ngọn núi Thạch Bàn, Thiên Thị và Phù Nghĩa nhô lên giữa biển mây tựa như ba hòn đảo bồng bềnh nơi cõi tiên, gắn với truyền thuyết các nàng tiên giáng trần ngắm cảnh non nước hữu tình.",
    history: "Năm 1904, người Pháp đã khảo sát và biến Tam Đảo thành khu nghỉ dưỡng trên cao nổi tiếng bậc nhất Bắc Kỳ. Nơi đây lưu giữ Nhà thờ đá cổ xây dựng từ năm 1906 - 1937 bằng đá xanh theo kiến trúc Gothic uy nghiêm, Cổng Trời săn mây và khí hậu trong lành biến chuyển 4 mùa trong 1 ngày kỳ thú.",
  },
  "long-coc": {
    title: "Đồi chè Long Cốc – Vịnh Hạ Long trên cạn vùng Đất Tổ",
    period: "Địa hình karst trung du hàng triệu năm & Làng nghề chè truyền thống",
    legend: "Người Mường vùng Long Cốc kể rằng xưa kia những nàng tiên gánh trà từ thượng giới ghé thăm vùng đất Tân Sơn trù phú, thấy đất đai màu mỡ nên đã đánh rơi những nắm hạt trà tiên biến thành hàng trăm ngọn đồi tròn uốn lượn như ngày nay.",
    history: "Đồi chè Long Cốc gồm hàng trăm ốc đảo chè hình bát úp nối tiếp nhau trải dài trên diện tích gần 700 ha. Nơi đây sản sinh ra dòng trà Shan tuyết cổ thụ thơm ngọt nước xanh biếc, được bình chọn là một trong những điểm săn mây đón bình minh đẹp nhất Việt Nam.",
  },
  "xuan-son": {
    title: "Vườn quốc gia Xuân Sơn & Bản Dù",
    period: "Thành lập theo Quyết định số 49/2002/QĐ-TTg của Thủ tướng Chính phủ",
    legend: "Gắn liền với truyền thuyết Sơn Tinh tìm kiếm sính lễ 'Voi chín ngà, Gà chín cựa, Ngựa chín hồng mao' để rước công chúa Ngọc Hoa. Giống gà nhiều cựa quý hiếm này đến nay vẫn được người Dao Tiền, người Mường gìn giữ thuần chủng tại các bản làng giữa đại ngàn Xuân Sơn.",
    history: "VQG Xuân Sơn rộng hơn 15.000 ha, là nơi sở hữu khu rừng nguyên sinh trên núi đá vôi độc nhất vô nhị ở miền Bắc với độ che phủ rừng lên đến 84%. Nơi đây có hệ thống hang động thạch nhũ kỳ vĩ (Hang Na, Hang Lạng, Hang Thổ Thần) cùng không gian sinh hoạt văn hóa mộc mạc của bản Dù, bản Cỏi.",
  },
  "hung-lo": {
    title: "Làng cổ Hùng Lô & Đình cổ 300 năm",
    period: "Niên đại khởi dựng thời Hậu Lê (năm 1697)",
    legend: "Tương truyền khi Vua Hùng cùng các công chúa và quân lính du ngoạn ven sông Lô, đã dừng chân nghỉ lại vùng đất này vì thấy cảnh sắc thanh bình, gió mát trăng thanh. Nhân dân cảm kích ơn vua đã lập đền thờ phụng.",
    history: "Đình cổ Hùng Lô trải qua hơn 300 năm lịch sử vẫn giữ nguyên vẹn quần thể kiến trúc gỗ lim bề thế với nghệ thuật chạm khắc tinh xảo bậc nhất đồng bằng Bắc Bộ. Đây cũng là một trong những cái nôi gìn giữ di sản Hát Xoan Phú Thọ được UNESCO vinh danh.",
  },
  "den-mau-au-co": {
    title: "Đền Mẫu Âu Cơ – Hạ Hòa",
    period: "Thời kỳ Hùng Vương dựng nước & Tôn tạo thời Lê Thánh Tông",
    legend: "Sau khi đưa 50 người con lên núi khai hoang mở cõi, Mẹ Âu Cơ đã dừng chân tại vùng đất trù phú Hiền Lương (Hạ Hòa), dạy dân khai khẩn ruộng nương, trồng dâu nuôi tằm, dệt vải. Ngày 25 tháng Chạp, Mẹ cùng các tiên nữ bay về trời để lại dải yếm lụa bên gốc đa thiêng.",
    history: "Đền Mẫu Âu Cơ được vua Lê Thánh Tông niên hiệu Hồng Đức phong sắc và cho xây dựng ngôi đền uy nghiêm. Hằng năm vào ngày mùng 7 tháng Giêng, lễ hội Đền Mẫu đón hàng vạn con cháu Tiên Rồng từ khắp mọi miền đất nước về dâng hương thành kính.",
  },
  "tay-thien": {
    title: "Khu Danh thắng Tây Thiên",
    period: "Thế kỷ III TCN (Phật giáo) & Thời Hùng Vương (Quốc Mẫu)",
    legend: "Thờ Quốc Mẫu Lăng Thị Tiêu – chính vương phi của Vua Hùng thứ bảy, người có công chiêu binh mãi mã phò vua giúp nước dẹp yên giặc ngoại xâm, dạy dân làm nông nghiệp và mở mang bờ cõi.",
    history: "Tây Thiên là cái nôi Phật giáo du nhập sớm nhất vào Việt Nam, đồng thời là trung tâm tín ngưỡng thờ Mẫu linh thiêng với hệ thống chùa cổ, Thiền viện Trúc Lâm Tây Thiên và cáp treo hiện đại vượt núi ngắm đại ngàn.",
  },
  "mai-chau": {
    title: "Bản Lác Mai Châu",
    period: "Lịch sử định cư của người Thái trắng hơn 700 năm",
    legend: "Tổ tiên người Thái trắng xưa kia di cư từ phương Bắc qua nhiều đèo cao suối sâu, khi đến thung lũng Mai Châu thấy nguồn nước ngọt lành, đất thung lũng bằng phẳng màu mỡ đã dựng nhà sàn bên sườn núi và an cư lập nghiệp đời đời.",
    history: "Bản Lác giữ trọn vẹn những nếp nhà sàn cột gỗ vững chãi lợp lá dong hoặc rơm khô, nghề dệt thổ cẩm thủ công truyền thống và văn hóa múa xòe, uống rượu cần bên bếp lửa bập bùng.",
  },
  "khoang-nong-kim-boi": {
    title: "Suối khoáng nóng Kim Bôi",
    period: "Hình thành từ đới đứt gãy địa chất ngàn năm",
    legend: "Dòng suối nước nóng lộ thiên tự nhiên phun trào giữa đại ngàn Mường Động, tương truyền là suối nguồn ban tặng sức khỏe và sắc đẹp cho các cô gái Mường xứ hoa ban.",
    history: "Kim Bôi có nguồn nước khoáng ngầm ổn định 34 - 36°C, có thể uống trực tiếp tại nguồn hoặc tắm ngâm trị liệu các bệnh về xương khớp, thần kinh và tim mạch.",
  },
  "thung-nai-song-da": {
    title: "Thung Nai Sông Đà & Đền Bờ",
    period: "Khởi dựng từ thời Vua Lê Lợi (năm 1431)",
    legend: "Đền Bờ thờ Bà Chúa Thác Bờ Đinh Thị Vân (người Mường) và một bà người Dao có công huy động thuyền bè, lương thảo giúp vua Lê Lợi vượt thác sông Đà tiến quân dẹp loạn giặc Đèo Cát Hãn ở Mường Lễ.",
    history: "Khi thủy điện Hòa Bình ngăn dòng tích nước, vùng lòng hồ Thung Nai biến thành một bức tranh sơn thủy hữu tình với hàng trăm hòn đảo đá vôi nhấp nhô trên mặt hồ xanh ngọc bích, được ví như 'Vịnh Hạ Long trên núi'.",
  },
  "dao-ngoc-xanh": {
    title: "Khu du lịch Đảo Ngọc Xanh",
    period: "Hình thành trên bãi bồi tự nhiên sông Đà",
    legend: "Bãi bồi phù sa tự nhiên xanh tươi nằm giữa hai nhánh sông Đà, nơi lưu truyền những câu chuyện về các cuộc thủy chiến và tình yêu thiên nhiên gắn với truyền thuyết Sơn Tinh - Thủy Tinh.",
    history: "Đảo Ngọc Xanh được quy hoạch thành quần thể sinh thái nghỉ dưỡng và vui chơi giải trí hiện đại quy mô 65 ha với công viên nước, tắm khoáng nóng và các trò chơi cảm giác mạnh thu hút du khách miền Bắc.",
  },
};
