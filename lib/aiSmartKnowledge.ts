import { type AiSurveyState, type AiResponseResult } from "./aiChatEngine";
import { getOfficialDocxItinerary, getOfficialLongCocXuanSonItinerary } from "./guidePlanner";
import { places, type Place } from "@/data/travel";
import { findDistrictByQuery, DISTRICT_DATABASE, type DistrictInfo, type DistrictAttraction } from "@/data/districtDirectory";

// Match specific place from query text
export type DestinationSearchResult =
  | { type: "place"; data: Place }
  | { type: "attraction"; data: DistrictAttraction; district: DistrictInfo }
  | { type: "district"; data: DistrictInfo };

export function resolveAnyDestinationInfo(text: string): DestinationSearchResult | null {
  const norm = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ]/g, "d")
    .trim();

  // 1. Quét 18 Places cốt lõi
  const PLACE_KEYWORD_MAP: Array<{ keywords: string[]; placeId: string }> = [
    { keywords: ["den hung", "den cac vua hung", "nghia linh", "lang vua hung", "hung vuong", "den ha", "den trung", "den thuong", "den gieng", "cot da the"], placeId: "den-hung" },
    { keywords: ["long coc", "doi che long coc", "che bat up", "che long coc"], placeId: "long-coc" },
    { keywords: ["xuan son", "vuon quoc gia xuan son", "vqg xuan son", "hang lang", "ban coi", "ban du", "thac chin tang"], placeId: "xuan-son" },
    { keywords: ["thanh thuy", "khoang nong thanh thuy", "lynn times", "onsen thanh thuy", "suoi khoang thanh thuy", "ohayo onsen", "bamboo thanh thuy", "tre nguon thanh thuy"], placeId: "thanh-thuy" },
    { keywords: ["au co", "den mau au co", "hien luong"], placeId: "den-mau-au-co" },
    { keywords: ["hung lo", "lang co hung lo", "dinh hung lo", "dinh co hung lo", "hat xoan hung lo", "lang co & dinh co hung lo"], placeId: "hung-lo" },
    { keywords: ["dam ao chau", "ao chau", "ao chau ha hoa"], placeId: "dam-ao-chau" },
    { keywords: ["dao ngoc xanh", "kdl dao ngoc xanh", "cong vien nuoc dao ngoc xanh"], placeId: "dao-ngoc-xanh" },
    { keywords: ["tam dao", "thi tran tam dao", "nha tho da tam dao", "cong troi tam dao", "thac bac tam dao", "cau may tam dao", "quan gio tam dao"], placeId: "tam-dao" },
    { keywords: ["tay thien", "thien vien truc lam tay thien", "quoc mau tay thien", "chua tay thien"], placeId: "tay-thien" },
    { keywords: ["ban lac", "mai chau", "thung lung mai chau", "ban lac mai chau"], placeId: "ban-lac-mai-chau" },
    { keywords: ["kim boi", "khoang nong kim boi", "suoi khoang kim boi"], placeId: "khoang-nong-kim-boi" },
    { keywords: ["thung nai", "thac bo", "den thac bo", "long ho song da", "song da thung nai"], placeId: "thung-nai-song-da" },
    { keywords: ["lang gom huong canh", "gom huong canh", "huong canh"], placeId: "lang-gom-huong-canh" },
    { keywords: ["ho dai lai", "dai lai", "flamingo dai lai"], placeId: "ho-dai-lai" },
    { keywords: ["chua ha tien", "chua ha vinh yen", "ha tien"], placeId: "chua-ha-tien" },
    { keywords: ["bao tang muong", "khong gian van hoa muong"], placeId: "bao-tang-muong" },
    { keywords: ["pa co", "san may pa co", "cho phien pa co"], placeId: "pa-co-san-may" },
  ];

  for (const item of PLACE_KEYWORD_MAP) {
    if (item.keywords.some((kw) => norm.includes(kw))) {
      const found = places.find((p) => p.id === item.placeId);
      if (found) return { type: "place", data: found };
    }
  }

  // Quét trực tiếp qua places
  for (const p of places) {
    const pNameNorm = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đ]/g, "d");
    const pShortNorm = p.shortName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đ]/g, "d");
    if (norm.includes(pShortNorm) || norm.includes(pNameNorm)) {
      return { type: "place", data: p };
    }
  }

  // 2. Quét các điểm tham quan con (Attractions) trong 32 Districts
  const ATTRACTION_ALIAS_MAP: Array<{ keywords: string[]; distId: string; attIndex: number }> = [
    { keywords: ["tam giang", "chua tam giang", "den tam giang", "bach hac", "nga ba hac", "ben got"], distId: "viet-tri", attIndex: 3 },
    { keywords: ["van lang", "cong vien van lang", "cau di bo van lang", "cau di bo"], distId: "viet-tri", attIndex: 2 },
    { keywords: ["lac long quan", "den lac long quan", "quoc to lac long quan"], distId: "viet-tri", attIndex: 4 },
    { keywords: ["vuon vua", "vuon vua resort", "resort vuon vua"], distId: "tam-nong", attIndex: 0 },
    { keywords: ["lang suong", "den lang suong"], distId: "thanh-thuy", attIndex: 2 },
    { keywords: ["thac choi", "cu thang"], distId: "thanh-son", attIndex: 3 },
    { keywords: ["ho ly", "dap ly", "ho ly yen lap"], distId: "yen-lap", attIndex: 0 },
    { keywords: ["dam sen bach thuy", "bach thuy"], distId: "tam-nong", attIndex: 1 },
    { keywords: ["sai nga", "lang non sai nga"], distId: "cam-khe", attIndex: 0 },
    { keywords: ["roc trinh", "dam roc trinh"], distId: "cam-khe", attIndex: 1 },
    { keywords: ["lang dong", "banh lang dong", "chu quyen"], distId: "lam-thao", attIndex: 1 },
    { keywords: ["ho lang cam", "lang cam", "doi che thanh ba"], distId: "thanh-ba", attIndex: 1 },
    { keywords: ["dam vac", "ho dam vac"], distId: "vinh-yen", attIndex: 0 },
    { keywords: ["tho tang", "cho tho tang"], distId: "vinh-tuong", attIndex: 0 },
    { keywords: ["dong dau", "di chi dong dau"], distId: "yen-lac", attIndex: 0 },
    { keywords: ["thap binh son", "binh son"], distId: "song-lo", attIndex: 0 },
    { keywords: ["chua dai bi", "song lo doan hung"], distId: "doan-hung", attIndex: 1 },
  ];

  for (const alias of ATTRACTION_ALIAS_MAP) {
    if (alias.keywords.some((kw) => norm.includes(kw))) {
      const dist = DISTRICT_DATABASE[alias.distId];
      if (dist && dist.attractions[alias.attIndex]) {
        return { type: "attraction", data: dist.attractions[alias.attIndex], district: dist };
      }
    }
  }

  // Quét tự do qua tất cả các attractions
  for (const dist of Object.values(DISTRICT_DATABASE)) {
    for (const att of dist.attractions) {
      const attNorm = att.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đ]/g, "d");
      if (norm.includes(attNorm) || attNorm.includes(norm)) {
        return { type: "attraction", data: att, district: dist };
      }
    }
  }

  // 3. Quét DistrictInfo (32 huyện / thị)
  const distInfo = findDistrictByQuery(text);
  if (distInfo) {
    return { type: "district", data: distInfo };
  }

  return null;
}

function formatPlaceInfo(p: Place, greeting: string, survey: AiSurveyState): AiResponseResult {
  let text = `${greeting}Dưới đây là **thông tin chi tiết về ${p.name}**:\n\n`;
  text += `📍 **Vị trí:** ${p.location} (${p.district ? `Huyện/TX ${p.district}, ` : ""}${p.region})\n`;
  text += `⭐ **Đánh giá:** ${p.rating} / 5.0 (${p.reviews.toLocaleString("vi-VN")} lượt du khách) | Danh mục: *${p.category}*\n\n`;
  
  text += `📖 **Giới thiệu tổng quan:**\n${p.description}\n\n`;

  if (p.highlights && p.highlights.length > 0) {
    text += `🌟 **Những điểm nổi bật & Trải nghiệm không thể bỏ lỡ:**\n`;
    p.highlights.forEach((h) => {
      text += `• ${h}\n`;
    });
    text += `\n`;
  }

  text += `⏰ **Giờ mở cửa:** ${p.hours}\n`;
  text += `⏱️ **Thời lượng tham quan thích hợp:** ${p.duration}\n`;
  text += `🎟️ **Giá vé & Dịch vụ:** ${p.price}\n`;
  text += `🌤️ **Thời điểm lý tưởng:** ${p.bestTime} *(Mùa đẹp nhất: ${p.season})*\n\n`;

  text += `🚗 **Hướng dẫn di chuyển & Cự ly:**\n`;
  text += `• Khoảng cách: Cách trung tâm TP. Việt Trì khoảng **${p.distanceFromVietTri} km** (${p.travelFromVietTri}).\n`;
  if (p.transportTips) {
    text += `• Phương tiện khuyến nghị: ${p.transportTips.recommendedVehicle}.\n`;
    text += `• Tuyến đường: ${p.transportTips.routeAdvice}\n`;
    if (p.transportTips.caution) {
      text += `• 💡 Lưu ý di chuyển: ${p.transportTips.caution}\n`;
    }
  }
  if (p.warning) {
    text += `⚠️ **Lưu ý bỏ túi:** ${p.warning}\n`;
  }
  text += `\n`;

  if (p.restaurants && p.restaurants.length > 0) {
    text += `🥢 **Ẩm thực & Quán ngon gợi ý gần ${p.shortName}:**\n`;
    p.restaurants.slice(0, 2).forEach((r) => {
      text += `• **${r.name}** (${r.type}): ${r.note} - *Địa chỉ: ${r.address}* (Cách ${r.distance}, ${r.priceRange || ""})\n`;
    });
    text += `\n`;
  }

  if (p.stays && p.stays.length > 0) {
    text += `🏨 **Lưu trú gợi ý lân cận:**\n`;
    p.stays.slice(0, 2).forEach((s) => {
      text += `• **${s.name}** (${s.type}): ${s.note} - *Địa chỉ: ${s.address}* (${s.priceRange || ""})\n`;
    });
    text += `\n`;
  }

  if (p.audioScript) {
    text += `🎙️ *Điểm đến này đã có bài thuyết minh Audio chất lượng cao trên ứng dụng.*\n\n`;
  }

  text += `👉 *Bạn có muốn em **thiết kế phương án lịch trình tối ưu** kết hợp ghé thăm ${p.shortName} cho đoàn mình không ạ?*`;

  const options = [
    { label: `✨ Lên lịch trình đến ${p.shortName}`, value: `plan_place_${p.id}`, icon: "🗺️" },
    { label: `🎧 Thuyết minh Audio ${p.shortName}`, value: `audio_${p.id}`, icon: "🎙️" },
    { label: `🥢 Quán ăn ngon gần ${p.shortName}`, value: `food_${p.id}`, icon: "🍲" },
    { label: `⭐ Tour mẫu 2N1Đ có ${p.shortName}`, value: "tour_2n1d", icon: "⭐" },
  ];

  return {
    text,
    options,
    updatedSurvey: {
      ...survey,
      anchorPlaceId: p.id,
      destinationText: p.name,
      district: p.district,
      region: p.region,
    },
  };
}

function formatDistrictInfo(d: DistrictInfo, greeting: string, survey: AiSurveyState): AiResponseResult {
  let text = `${greeting}Dưới đây là **thông tin du lịch tổng quan về ${d.title}** (${d.province}):\n\n`;
  text += `📖 **Giới thiệu:**\n${d.intro}\n\n`;
  
  text += `🏞️ **Các địa điểm tham quan & Di tích tiêu biểu:**\n`;
  d.attractions.forEach((a, i) => {
    text += `${i + 1}. ${a.icon} **${a.name}** (${a.category}):\n   - ${a.desc}\n`;
  });
  text += `\n`;

  text += `🥢 **Ẩm thực đặc sản nức tiếng:**\n`;
  d.culinary.forEach((c) => {
    text += `• **${c.dish}**: ${c.desc} *(Địa chỉ: ${c.places})*\n`;
  });
  text += `\n`;

  if (d.recommendedStay) {
    text += `🏨 **Gợi ý lưu trú:** ${d.recommendedStay}\n\n`;
  }

  text += `👉 *Bạn có thể bấm các gợi ý bên dưới để em lên lịch trình hoặc xem chi tiết từng điểm nhé!*`;

  const options = [
    { label: `✨ Lên lịch trình khám phá ${d.name}`, value: d.comboActionValue, icon: "✨" },
    { label: `⭐ Tour 2 ngày 1 đêm (${d.name})`, value: `choose_dur_2_${d.id}`, icon: "⭐" },
    { label: `🥢 Khám phá đặc sản ${d.name}`, value: `food_${d.id}`, icon: "🍲" },
  ];

  return {
    text,
    options,
    updatedSurvey: {
      ...survey,
      anchorPlaceId: `district-${d.id}`,
      destinationText: d.title,
      district: d.name,
      region: d.province,
    },
  };
}

export function handleSmartKnowledgeQuery(
  rawText: string,
  survey: AiSurveyState,
  userName?: string
): AiResponseResult | null {
  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();

  const greeting = userName ? `Chào **${userName}**! ` : "Dạ, ";

  // 1. GREETING & IDENTITY
  if (
    /^(chào|chao|xin chào|xin chao|hello|hi|alo|hé lô|helo|chào em|chào bạn|chao em|chao ban|ad ơi|ad oi|bạn ơi|ban oi)\b/i.test(lower) ||
    lower === "chào" ||
    lower === "hi" ||
    lower === "hello"
  ) {
    return {
      text:
        `${greeting}Em là **Trợ lý Du lịch Đất Tổ AI**, rất vui được đồng hành cùng bạn! 🌿\n\n` +
        `Em có thể hỗ trợ bạn như một chuyên gia bản địa thông thái:\n` +
        `• 🗺️ **Tự động lên lịch trình thông minh**: Tối ưu cung đường, thời gian và dự toán ngân sách từ vị trí của bạn.\n` +
        `• 🎙️ **Thuyết minh Audio độc quyền**: Cung cấp các bài thuyết minh chuẩn hồ sơ cho từng điểm dừng.\n` +
        `• 🍲 **Khám phá ẩm thực & Đặc sản OCOP**: Tra cứu quán ngon, món đặc sản nức tiếng và địa chỉ mua quà uy tín.\n` +
        `• 📍 **Tra cứu 100+ điểm đến**: Đền Hùng, Đồi chè Long Cốc, VQG Xuân Sơn, Khoáng nóng Thanh Thủy, Tam Đảo, Tây Thiên, Mai Châu...\n\n` +
        `Bạn đang muốn tìm hiểu điểm đến nào, hay muốn em lên ngay một lịch trình du lịch cho đoàn mình ạ?`,
      options: [
        { label: "⭐ Tour chuẩn 2N1Đ (Đền Hùng · Onsen · Tam Đảo)", value: "tour_2n1d", icon: "⭐" },
        { label: "🍃 Tour sinh thái 1N (Long Cốc · Xuân Sơn)", value: "tour_long_coc", icon: "🍃" },
        { label: "🌤️ Đi Phú Thọ mùa nào đẹp nhất?", value: "hoi_mua_du_lich", icon: "🌤️" },
        { label: "🎟️ Bảng giá vé & chi phí tham quan", value: "hoi_gia_ve", icon: "🎫" },
        { label: "🎁 Đặc sản Phú Thọ mua làm quà", value: "hoi_dac_san_qua", icon: "🎁" },
      ],
      updatedSurvey: survey,
    };
  }

function formatAttractionInfo(
  att: DistrictAttraction,
  dist: DistrictInfo,
  greeting: string,
  survey: AiSurveyState
): AiResponseResult {
  let text = `${greeting}Dưới đây là **thông tin chi tiết về ${att.name}**:\n\n`;
  text += `📍 **Vị trí:** ${att.location || `${dist.name}, tỉnh ${dist.province}`}\n`;
  text += `🏷️ **Phân loại:** *${att.category}* | Thuộc địa bàn: **${dist.title}**\n\n`;
  text += `📖 **Giới thiệu & Trải nghiệm nổi bật:**\n${att.desc}\n\n`;

  if (dist.culinary && dist.culinary.length > 0) {
    text += `🥢 **Ẩm thực đặc sản gợi ý khi ghé thăm ${dist.name}:**\n`;
    dist.culinary.slice(0, 2).forEach((c) => {
      text += `• **${c.dish}**: ${c.desc} *(Địa chỉ: ${c.places || "Trung tâm xã / nhà hàng địa phương"})*\n`;
    });
    text += `\n`;
  }

  if (dist.recommendedStay) {
    text += `🏨 **Gợi ý lưu trú lân cận:** ${dist.recommendedStay}\n\n`;
  }

  text += `👉 *Bạn có muốn em **thiết kế phương án lịch trình** kết hợp ghé thăm ${att.name.split("(")[0].trim()} cho đoàn mình không ạ?*`;

  const options = [
    { label: `✨ Lên lịch trình đến ${att.name.split("(")[0].trim()}`, value: dist.comboActionValue, icon: "🗺️" },
    { label: `🍲 Ẩm thực đặc sản ${dist.name}`, value: `food_${dist.id}`, icon: "🥢" },
    { label: `⭐ Tour mẫu 2N1Đ (${dist.name})`, value: `choose_dur_2_${dist.id}`, icon: "⭐" },
  ];

  return {
    text,
    options,
    updatedSurvey: {
      ...survey,
      anchorPlaceId: `district-${dist.id}`,
      destinationText: `${att.name} (${dist.name})`,
      district: dist.name,
      region: dist.province,
    },
  };
}

// 1.1. SPECIFIC PLACE OR DISTRICT INFORMATION LOOKUP
  // Khi người xem hỏi về 1 địa điểm (ví dụ: "Đền Hùng", "Thông tin về Đền Hùng", "Đồi chè Long Cốc", "Chùa Tam Giang", "Thanh Thủy có gì", "Xuân Sơn ở đâu"...)
  // Hệ thống sẽ lập tức cung cấp đầy đủ thông tin: Vị trí, giờ mở cửa, giá vé, điểm nhấn, cách đi, quán ăn & nơi lưu trú!
  const destinationFound = resolveAnyDestinationInfo(trimmed);

  const isAskingScheduleExplicitly =
    lower.includes("lên lịch trình") ||
    lower.includes("lập lịch trình") ||
    lower.includes("2 ngày 1 đêm") ||
    lower.includes("2n1d") ||
    lower.includes("3 ngày 2 đêm") ||
    lower.includes("3n2d") ||
    (lower.includes("tour") && (lower.includes("2 ngày") || lower.includes("1 ngày") || lower.includes("mấy ngày")));

  if (destinationFound && !isAskingScheduleExplicitly) {
    const isExplicitInfoQuery =
      lower.includes("thông tin") ||
      lower.includes("thong tin") ||
      lower.includes("ở đâu") ||
      lower.includes("o dau") ||
      lower.includes("có gì") ||
      lower.includes("co gi") ||
      lower.includes("giới thiệu") ||
      lower.includes("gioi thieu") ||
      lower.includes("kể về") ||
      lower.includes("tìm hiểu") ||
      lower.includes("tim hieu") ||
      lower.includes("chơi gì") ||
      lower.includes("đẹp không") ||
      lower.includes("như thế nào") ||
      lower.includes("bao xa") ||
      lower.includes("mấy giờ") ||
      lower.includes("giá vé") ||
      lower.includes("review") ||
      trimmed.length <= 45; // Người dùng chỉ gõ ngắn gọn tên địa danh như "Đền Hùng", "Đồi chè Long Cốc", "Thanh Thủy"

    if (isExplicitInfoQuery) {
      if (destinationFound.type === "place") {
        return formatPlaceInfo(destinationFound.data, greeting, survey);
      }
      if (destinationFound.type === "attraction") {
        return formatAttractionInfo(destinationFound.data, destinationFound.district, greeting, survey);
      }
      if (destinationFound.type === "district") {
        return formatDistrictInfo(destinationFound.data, greeting, survey);
      }
    }
  }

  // 1.25. INTERACTIVE CLARIFICATION DIALOG:
  // Khi người dùng hỏi tư vấn lịch trình/tour nhưng câu hỏi chưa rõ (thiếu số người, phương tiện, mức giá...)
  // AI sẽ chủ động hỏi lại lịch sự và cung cấp các nút bấm 1 chạm để cá nhân hoá lịch trình chuẩn xác nhất.
  const isTripConsultation =
    /tư vấn|tu van|lịch trình|lich trinh|kế hoạch|ke hoach|gợi ý|goi y|tour|đi đâu|di dau|đi chơi|di choi|du lịch|du lich|phương án|phuong an|muốn đi|muon di|sắp đi|sap di|tổ chức|to chuc|khám phá/i.test(lower) ||
    /2 ngày 1 đêm|2n1d|2n1đ|1 ngày|3 ngày 2 đêm|3n2d|cuối tuần/i.test(lower);

  const isSpecificLookups =
    /giá vé|gia ve|vé tham quan|ve tham quan|ăn gì|an gi|món gì ngon|mon gi ngon|quán ăn|quan an|mua quà|mua qua|đặc sản mua|mua gì|thời tiết|thoi tiet|mùa nào đẹp|mua nao dep|bạn là ai|ban la ai|em là ai/i.test(lower) ||
    lower.includes("theo file") ||
    lower.includes("theo tài liệu") ||
    lower.includes("bản đồ gps") ||
    lower.includes("lưu vào lịch trình");

  // Kiểm tra xem người dùng đã cung cấp các thông tin cốt lõi hay chưa
  const hasTravelers =
    /\b(\d+)\s*(?:người|nguoi|khách|khach|thành viên|ve|vé|bạn|ban)\b/i.test(lower) ||
    /cặp đôi|hai người|2 vợ chồng|gia đình|nhóm bạn|đoàn|solo|1 mình|một mình/i.test(lower) ||
    (survey.travelers !== undefined && survey.travelers !== 2);

  const hasTransport =
    /xe máy|xe may|mô tô|mo to|phượt|phuot|ô tô|o to|xe hơi|xe nha|xe riêng|tự lái|tu lai|limousine|xe khách|xe khach|xe bus/i.test(lower) ||
    (survey.transport !== undefined && survey.transport !== "Ô tô riêng");

  const hasBudget =
    /ngân sách|ngan sach|chi phí|chi phi|giá|gia|tiết kiệm|tiet kiem|bình dân|binh dan|tiêu chuẩn|tieu chuan|cao cấp|cao cap|resort|onsen|\b\d+\s*(?:k|nghìn|nghin|ngàn|ngan|tr|triệu|trieu|đồng|dong|đ)\b/i.test(lower) ||
    survey.customBudgetTotal !== undefined ||
    survey.customBudgetPerPerson !== undefined;

  const hasDuration =
    /\b(\d+)\s*(?:ngày|ngay|đêm|dem)\b/i.test(lower) ||
    /2n1d|2n1đ|3n2d|3n2đ|1 ngày|trong ngày|cuối tuần/i.test(lower) ||
    survey.durationDays !== undefined;

  // Nếu người dùng hỏi tư vấn chuyến đi nhưng còn thiếu từ 2 yếu tố cốt lõi (travelers, transport, budget):
  const missingCoreCount = (!hasTravelers ? 1 : 0) + (!hasTransport ? 1 : 0) + (!hasBudget ? 1 : 0);

  if (isTripConsultation && !isSpecificLookups && missingCoreCount >= 2) {
    let destLabel = "Đất Tổ Phú Thọ";
    let anchorPlaceId = "den-hung";
    if (lower.includes("đền hùng") || lower.includes("den hung") || lower.includes("việt trì")) {
      destLabel = "Đền Hùng & Việt Trì";
      anchorPlaceId = "den-hung";
    } else if (lower.includes("thanh thủy") || lower.includes("thanh thuy") || lower.includes("khoáng nóng") || lower.includes("onsen")) {
      destLabel = "Khu nghỉ dưỡng Khoáng nóng Thanh Thủy";
      anchorPlaceId = "thanh-thuy";
    } else if (lower.includes("long cốc") || lower.includes("long coc") || lower.includes("đồi chè")) {
      destLabel = "Đồi chè Long Cốc & Tân Sơn";
      anchorPlaceId = "long-coc";
    } else if (lower.includes("xuân sơn") || lower.includes("xuan son")) {
      destLabel = "Vườn quốc gia Xuân Sơn";
      anchorPlaceId = "long-coc";
    } else if (lower.includes("tam đảo") || lower.includes("tam dao")) {
      destLabel = "Phố núi Tam Đảo & Tây Thiên";
      anchorPlaceId = "tam-dao";
    }

    // Thời lượng suy đoán
    let durationText = "2 ngày 1 đêm";
    let days = 2;
    let nights = 1;
    if (lower.includes("1 ngày") || lower.includes("trong ngày")) {
      durationText = "1 ngày (trong ngày)";
      days = 1;
      nights = 0;
    } else if (lower.includes("3 ngày") || lower.includes("3n2d") || lower.includes("3n2đ")) {
      durationText = "3 ngày 2 đêm";
      days = 3;
      nights = 2;
    }

    return {
      text:
        `${greeting}Dạ vâng! Tuyến điểm **${destLabel}** là một lựa chọn cực kỳ tuyệt vời với nhiều cảnh quan thiên nhiên đẹp, di sản văn hóa đặc sắc và ẩm thực phong phú! 🌿\n\n` +
        `Để em có thể **thiết kế phương án lịch trình hợp lý nhất** (tối ưu cự ly di chuyển, phân bổ thời gian hợp lý không bị mệt) và **dự toán chi phí sát thực tế nhất cho bạn**, bạn cho em biết thêm một vài thông tin nhé:\n\n` +
        `👥 **1. Đoàn mình dự kiến đi mấy người?**\n` +
        `   *(Đi cặp đôi 2 người, nhóm bạn trẻ, hay gia đình có trẻ nhỏ/người lớn tuổi?)*\n\n` +
        `🚗 **2. Phương tiện di chuyển của bạn là gì?**\n` +
        `   *(Đi xe máy phượt, ô tô riêng tự lái hay đi xe Limousine/xe khách?)*\n\n` +
        `💰 **3. Mức ngân sách / Giá dự kiến của đoàn?**\n` +
        `   *(Tiết kiệm bình dân ~750k - 1tr/người, tiêu chuẩn ~1.2 - 1.5tr, hay nghỉ dưỡng Onsen 4-5 sao ~1.8 - 2.5tr/người?)*\n` +
        (!hasDuration ? `\n⏱️ **4. Bạn dự kiến đi trong bao lâu?** *(Đi trong ngày 1 ngày, 2 ngày 1 đêm hay 3 ngày 2 đêm?)*\n` : `\n⏱️ *Thời lượng dự kiến: **${durationText}***\n`) +
        `\n👉 **Bạn có thể gõ trực tiếp trả lời** hoặc **bấm chọn nhanh một trong các phương án phổ biến bên dưới** để em lập tức hoàn thiện lịch trình chi tiết từng giờ cho bạn nhé!`,
      options: [
        { label: "👨‍👩‍👧‍👦 Gia đình 4 người · Ô tô · Tiêu chuẩn (~1.2 - 1.5tr)", value: "clarify_plan_family_car", icon: "👨‍👩‍👧‍👦" },
        { label: "👫 Cặp đôi 2 người · Ô tô · Nghỉ dưỡng Onsen (~1.8 - 2.5tr)", value: "clarify_plan_couple_resort", icon: "♨️" },
        { label: "🏍️ Nhóm bạn phượt · Xe máy · Tiết kiệm (~750k - 1tr)", value: "clarify_plan_friends_bike", icon: "🏍️" },
        { label: "🏛️ Tuyến Đền Hùng – Thanh Thủy (2N1Đ)", value: "clarify_route_hung_thuy", icon: "🏛️" },
        { label: "🍃 Tuyến Long Cốc – Xuân Sơn (2N1Đ)", value: "clarify_route_long_coc", icon: "🍃" },
      ],
      updatedSurvey: {
        ...survey,
        anchorPlaceId,
        destinationText: destLabel,
        durationDays: days,
        durationNights: nights,
      },
    };
  }

  // 1.3. SMART DURATION & DESTINATION REASONING (2 Ngày 1 Đêm, 1 Ngày, 3 Ngày 2 Đêm)
  // Xử lý thông minh khi người dùng hỏi các câu hỏi về thời gian & địa điểm theo yêu cầu
  const isAsking2N1D =
    (lower.includes("2 ngày 1 đêm") || lower.includes("2n1d") || lower.includes("2 ngày") || lower.includes("2n1đ") || lower.includes("hai ngày một đêm")) &&
    (lower.includes("gợi ý") || lower.includes("lịch trình") || lower.includes("đi đâu") || lower.includes("kế hoạch") || lower.includes("tư vấn") || lower.includes("phương án") || lower.includes("tôi muốn đi") || lower.includes("muốn đi"));

  if (isAsking2N1D) {
    const isMentionDenHung = lower.includes("đền hùng") || lower.includes("den hung");
    const isMentionThanhThuy = lower.includes("thanh thủy") || lower.includes("thanh thuy") || lower.includes("onsen") || lower.includes("khoáng nóng");
    const isMentionLongCoc = lower.includes("long cốc") || lower.includes("long coc") || lower.includes("đồi chè");
    const isMentionXuanSon = lower.includes("xuân sơn") || lower.includes("xuan son") || lower.includes("vườn quốc gia");
    const isMentionTamDao = lower.includes("tam đảo") || lower.includes("tam dao");

    // Case A: Đền Hùng + Thanh Thủy (+ Tam Đảo) 2N1Đ
    if (isMentionDenHung && (isMentionThanhThuy || isMentionTamDao)) {
      const docxTour = getOfficialDocxItinerary();
      return {
        text:
          `${greeting}Em đã phân tích cự ly di chuyển và xây dựng **Phương án Lịch trình 2 Ngày 1 Đêm Hợp Lý Nhất** kết hợp **Đền Hùng linh thiêng – Suối khoáng nóng Thanh Thủy – Thị trấn mây Tam Đảo**:\n\n` +
          `🛣️ **Lộ trình tối ưu thuận đường (Tổng cự ly ~140 km, không bị đi vòng):**\n` +
          `TP. Việt Trì ➔ Đền Hùng ➔ Suối khoáng nóng Thanh Thủy ➔ Vượt đèo mây lên Tam Đảo ➔ Về Việt Trì.\n\n` +
          `🗓️ **Kế hoạch chi tiết từng buổi:**\n` +
          `• **NGÀY 1: CỘI NGUỒN ĐẤT TỔ & NGHỈ DƯỠNG KHOÁNG NÓNG**\n` +
          `   - **07:00 – 08:15:** Ăn sáng phở bò nóng tại Nhà hàng Mai Anh (chân Đền Hùng).\n` +
          `   - **08:15 – 11:00:** Dâng hương Đền Hùng (Đền Hạ → Đền Trung → Đền Thượng → Cột đá thề → Lăng Hùng Vương → Đền Giếng).\n` +
          `   - **11:00 – 12:15:** Ăn trưa đặc sản cá lăng sông Lô & gà đồi tại Nhà hàng Giang Lan Đền Hùng.\n` +
          `   - **12:30 – 14:00:** Di chuyển 35 km về KDL Khoáng nóng Lynn Times Thanh Thủy nhận phòng Shoptel.\n` +
          `   - **14:30 – 17:30:** Ngâm khoáng nóng Radon Nhật Bản tại Ohayo Onsen & Spa, xông hơi đá muối Himalaya, dạo phố đi bộ Hokkaido.\n` +
          `   - **18:30 – 21:00:** Ăn tối Chả cá sông Đà tại Nhà hàng Tinh Hoa Bắc Bộ, café quảng trường Sakura và nghỉ đêm thư giãn.\n\n` +
          `• **NGÀY 2: SĂN MÂY TAM ĐẢO & THƯỞNG THỨC ẨM THỰC PHỐ NÚI**\n` +
          `   - **07:30 – 08:30:** Buffet sáng tại Thanh Thủy, khởi hành sang phố núi Tam Đảo (50 km).\n` +
          `   - **10:00 – 12:00:** Check-in Quảng trường Tam Đảo, Nhà thờ đá cổ Gothic rêu phong giữa màn sương mây.\n` +
          `   - **12:00 – 13:30:** Ăn trưa ngọn su su xào tỏi & gà đồi nướng tại Nhà hàng Tam Đảo Núi.\n` +
          `   - **13:30 – 15:30:** Café ngắm thung lũng mây Cổng Trời, dạo chợ mua quà su su, bánh hạt dẻ.\n` +
          `   - **15:30 – 17:00:** Khởi hành về lại điểm xuất phát, khép lại hành trình an toàn!\n\n` +
          `💰 **Dự toán chi phí:** ~1.400.000 – 1.850.000đ/người (đã gồm phòng nghỉ, tắm Onsen 5 sao, 4 bữa ăn đặc sản).\n` +
          `🎙️ *Hành trình đã tích hợp sẵn Audio thuyết minh giọng đọc HD cho toàn bộ 18 điểm dừng!*`,
        itinerary: docxTour,
        options: [
          { label: "👉 Mở Toàn Bộ Lịch Trình Trên Bản Đồ GPS", value: "view_trip_now", icon: "🗺️" },
          { label: "💾 Lưu vào Lịch trình của tôi", value: "save_trip_now", icon: "⭐" },
          { label: "🔄 Xem phương án 2N1Đ Long Cốc – Xuân Sơn", value: "tour_long_coc", icon: "🍃" },
        ],
        updatedSurvey: {
          ...survey,
          durationDays: 2,
          durationNights: 1,
          anchorPlaceId: "den-hung",
          destinationText: "Đền Hùng – Thanh Thủy – Tam Đảo",
        },
      };
    }

    // Case B: Long Cốc + Xuân Sơn 2N1Đ
    if (isMentionLongCoc || isMentionXuanSon) {
      const longCocTour = getOfficialLongCocXuanSonItinerary();
      return {
        text:
          `${greeting}Em xin gợi ý **Phương án Lịch trình 2N1Đ Sinh Thái & Săn Mây Tuyệt Đẹp** tại **Đồi chè Long Cốc – VQG Xuân Sơn**:\n\n` +
          `🛣️ **Cung đường:** TP. Việt Trì qua QL32 ➔ TT. Thanh Sơn ➔ Ốc đảo chè Long Cốc ➔ Rừng nguyên sinh VQG Xuân Sơn (Tân Sơn).\n\n` +
          `🗓️ **Kế hoạch chi tiết từng buổi:**\n` +
          `• **NGÀY 1: BIỂN MÂY ĐỒI CHÈ LONG CỐC & ĐÊM BẢN MƯỜNG**\n` +
          `   - **05:30 – 07:30:** Khởi hành sớm từ Việt Trì lên Long Cốc để bắt trọn khoảnh khắc bình minh trên đồi chè bát úp.\n` +
          `   - **07:30 – 09:00:** Ăn sáng bánh cuốn nóng & thưởng thức trà Shan tuyết cổ thụ tại Homestay Tony Luận.\n` +
          `   - **09:00 – 11:30:** Thuê trang phục dân tộc Mường, check-in ốc đảo chè bạt ngàn mây trắng.\n` +
          `   - **12:00 – 13:30:** Ăn trưa mâm cỗ lợn mán nướng & xôi ngũ sắc.\n` +
          `   - **14:00 – 17:30:** Khám phá bản làng, dạo bước qua cầu treo gỗ, tắm suối mát.\n` +
          `   - **18:30 – 21:00:** Bữa tối ấm cúng cùng đồng bào Mường, giao lưu lửa trại & nghỉ đêm nhà sàn gỗ view đồi chè.\n\n` +
          `• **NGÀY 2: ĐẠI NGÀN XUÂN SƠN – THÁC CHÍN TẦNG – VỀ VIỆT TRÌ**\n` +
          `   - **07:00 – 08:00:** Dậy sớm hít thở không khí rừng già trong lành, ăn sáng cháo gà đồi.\n` +
          `   - **08:30 – 11:30:** Vượt cung đường đèo sang VQG Xuân Sơn: khám phá rừng nguyên sinh đá vôi, thám hiểm Hang Lạng và ngắm Thác Chín Tầng.\n` +
          `   - **11:30 – 13:00:** Ăn trưa gà chín cựa nướng than hoa tiến Vua & rau dớn rừng xào tỏi tại Nhà hàng Thế Nhé 1.\n` +
          `   - **13:30 – 15:30:** Dạo Bản Dù tìm hiểu nghề dệt thổ cẩm người Dao Tiền, mua mật ong rừng nguyên chất làm quà.\n` +
          `   - **15:30 – 17:30:** Khởi hành về lại TP. Việt Trì, kết thúc chuyến đi tuyệt vời!\n\n` +
          `💰 **Dự toán chi phí:** ~750.000 – 1.100.000đ/người (cực kỳ tiết kiệm và đậm chất thiên nhiên).\n` +
          `🎙️ *Hành trình có sẵn bài thuyết minh Audio cho từng điểm!*`,
        itinerary: longCocTour,
        options: [
          { label: "👉 Mở Toàn Bộ Lịch Trình Long Cốc – Xuân Sơn", value: "view_trip_now", icon: "🍃" },
          { label: "💾 Lưu vào Lịch trình của tôi", value: "save_trip_now", icon: "⭐" },
          { label: "♨️ Xem tuyến Đền Hùng – Thanh Thủy 2N1Đ", value: "tour_2n1d", icon: "⭐" },
        ],
        updatedSurvey: {
          ...survey,
          durationDays: 2,
          durationNights: 1,
          anchorPlaceId: "doi-che-long-coc",
          destinationText: "Đồi chè Long Cốc – VQG Xuân Sơn",
        },
      };
    }

    // Case C: Tổng quát 2 Ngày 1 Đêm (chưa chọn điểm cụ thể hoặc hỏi phương án hợp lý nhất)
    return {
      text:
        `${greeting}Đối với chuyến du lịch **2 Ngày 1 Đêm tại Phú Thọ**, em đã phân tích vị trí địa lý, thời gian di chuyển và chọn lọc ra **3 Phương án Lịch trình Hợp lý & Được Du khách Yêu thích Nhất** sau đây:\n\n` +
        `🏆 **PHƯƠNG ÁN 1 (TUYẾN VÀNG: CỘI NGUỒN & NGHỈ DƯỠNG ONSEN)**\n` +
        `• **Lộ trình:** TP. Việt Trì ➔ Đền Hùng ➔ Suối khoáng nóng Lynn Times Thanh Thủy ➔ Tam Đảo.\n` +
        `• **Trải nghiệm:** Dâng hương đất Tổ linh thiêng, tắm Onsen khoáng nóng Radon Nhật Bản phục hồi sức khỏe, ăn cá sông Đà và ngắm hoàng hôn Tam Đảo.\n` +
        `• **Phù hợp:** Gia đình, nhóm bạn, người lớn tuổi muốn nghỉ dưỡng thảnh thơi.\n` +
        `• **Dự toán:** ~1.400.000 – 1.850.000đ/người.\n\n` +
        `🍃 **PHƯƠNG ÁN 2 (KỲ QUAN SINH THÁI & SĂN MÂY ĐẠI NGÀN)**\n` +
        `• **Lộ trình:** TP. Việt Trì ➔ Đồi chè Long Cốc (Tân Sơn) ➔ Vườn Quốc Gia Xuân Sơn ➔ Bản Dù.\n` +
        `• **Trải nghiệm:** Đón bình minh ốc đảo chè bát úp bồng bềnh mây sớm, ngủ homestay nhà sàn bản Mường, trekking rừng nguyên sinh, tắm Thác Chín Tầng, ăn gà chín cựa nướng.\n` +
        `• **Phù hợp:** Giới trẻ, cặp đôi, du khách yêu thiên nhiên, thích chụp ảnh và trải nghiệm văn hóa bản địa.\n` +
        `• **Dự toán:** ~750.000 – 1.100.000đ/người.\n\n` +
        `🏛️ **PHƯƠNG ÁN 3 (DI SẢN VĂN HÓA & TRẢI NGHIỆM LÀNG CỔ)**\n` +
        `• **Lộ trình:** Đền Hùng ➔ Làng cổ Hùng Lô (Hát Xoan UNESCO) ➔ Đền Mẫu Âu Cơ (Hạ Hòa) ➔ Đầm Ao Châu.\n` +
        `• **Trải nghiệm:** Khám phá trọn vẹn văn hóa cội nguồn Hùng Vương, nghe làn điệu Xoan cổ tại đình làng 300 năm, du thuyền ngắm 99 ngách đầm Ao Châu.\n` +
        `• **Dự toán:** ~900.000 – 1.300.000đ/người.\n\n` +
        `👉 **Bạn ưng ý Phương án nào nhất?** Bạn có thể bấm chọn nhanh bên dưới để em tải toàn bộ lịch trình chi tiết từng giờ kèm bản đồ chỉ đường cho bạn nhé!`,
      options: [
        { label: "⭐ Tuyến 1: Đền Hùng & Thanh Thủy Onsen (2N1Đ)", value: "tour_2n1d", icon: "♨️" },
        { label: "🍃 Tuyến 2: Long Cốc & Xuân Sơn Săn Mây (2N1Đ)", value: "tour_long_coc", icon: "📸" },
        { label: "🏛️ Tuyến 3: Di Sản Hùng Vương & Hát Xoan (2N1Đ)", value: "plan_den_hung", icon: "🏛️" },
      ],
      updatedSurvey: {
        ...survey,
        durationDays: 2,
        durationNights: 1,
      },
    };
  }

  // 1.4. SMART REASONING: TOUR 1 NGÀY / TRONG NGÀY
  const isAsking1Day =
    (lower.includes("1 ngày") || lower.includes("trong ngày") || lower.includes("đi về trong ngày") || lower.includes("1 ngày 0 đêm")) &&
    (lower.includes("gợi ý") || lower.includes("lịch trình") || lower.includes("đi đâu") || lower.includes("tư vấn") || lower.includes("kế hoạch") || lower.includes("muốn đi"));

  if (isAsking1Day) {
    return {
      text:
        `${greeting}Nếu bạn có quỹ thời gian **1 Ngày (Đi về trong ngày)**, em gợi ý **2 Phương án Lịch trình 1 Ngày Tối Ưu Nhất** vừa vặn, không mệt mỏi:\n\n` +
        `🏛️ **LỰA CHỌN A: HÀNH TRÌNH TÂM LINH & KHOÁNG NÓNG (ĐỀN HÙNG – THANH THỦY)**\n` +
        `• **Sáng (07:30 – 11:30):** Dâng hương tại Quần thể di tích Đền Hùng (núi Nghĩa Lĩnh), leo các đền dâng hương cầu bình an.\n` +
        `• **Trưa (11:30 – 13:00):** Ăn trưa đặc sản cá lăng sông Lô hoặc gà đồi tại chân núi Đền Hùng.\n` +
        `• **Chiều (13:30 – 16:30):** Di chuyển sang Thanh Thủy, ngâm khoáng nóng Onsen Nhật Bản phục hồi thể lực sau chặng leo núi.\n` +
        `• **17:00:** Mua thịt chua Thanh Sơn làm quà và khởi hành về lại Hà Nội / Việt Trì.\n\n` +
        `🍃 **LỰA CHỌN B: THIÊN NHIÊN & SĂN MÂY (LONG CỐC – VQG XUÂN SƠN)**\n` +
        `• **Sáng (05:30 – 09:30):** Đón bình minh và săn mây trên đồi chè bát úp Long Cốc, uống trà Shan tuyết.\n` +
        `• **Trưa (11:30 – 13:00):** Ăn trưa gà chín cựa nướng & canh rau dớn rừng tại VQG Xuân Sơn.\n` +
        `• **Chiều (13:30 – 16:00):** Trekking rừng nguyên sinh, thám hiểm hang đá thạch nhũ và dạo cầu treo Bản Dù.\n` +
        `• **16:30:** Lên xe trở về, kết thúc 1 ngày tràn đầy năng lượng!\n\n` +
        `Bạn muốn em mở chi tiết lịch trình của **Lựa chọn A** hay **Lựa chọn B** ạ?`,
      options: [
        { label: "🏛️ Chi tiết Tour 1 Ngày Đền Hùng – Thanh Thủy", value: "plan_den_hung", icon: "🏛️" },
        { label: "🍃 Chi tiết Tour 1 Ngày Long Cốc – Xuân Sơn", value: "tour_long_coc", icon: "🍃" },
      ],
      updatedSurvey: {
        ...survey,
        durationDays: 1,
        durationNights: 0,
      },
    };
  }

  // 1.5. SMART REASONING: TOUR 3 NGÀY 2 ĐÊM (3N2Đ)
  const isAsking3N2D =
    (lower.includes("3 ngày 2 đêm") || lower.includes("3n2d") || lower.includes("3 ngày") || lower.includes("3n2đ")) &&
    (lower.includes("gợi ý") || lower.includes("lịch trình") || lower.includes("đi đâu") || lower.includes("kế hoạch") || lower.includes("tư vấn"));

  if (isAsking3N2D) {
    return {
      text:
        `${greeting}Với chuyến đi **3 Ngày 2 Đêm**, bạn sẽ có trải nghiệm trọn vẹn nhất văn hóa, thiên nhiên và nghỉ dưỡng của vùng Đất Tổ:\n\n` +
        `✨ **LỊCH TRÌNH 3N2Đ ĐẠI NGÀN & DI SẢN HOÀN HẢO:**\n\n` +
        `• **NGÀY 1: CỘI NGUỒN ĐẤT TỔ & HÁT XOAN LÀNG CỔ**\n` +
        `   - Sáng: Tham quan dâng hương Quần thể Di tích Đền Hùng.\n` +
        `   - Trưa: Thưởng thức ẩm thực sông Lô tại TP. Việt Trì.\n` +
        `   - Chiều: Khám phá Làng cổ Hùng Lô hơn 300 năm, thưởng thức nghệ thuật Hát Xoan UNESCO.\n` +
        `   - Tối: Dạo công viên Văn Lang ngắm cầu đi bộ ánh sáng, nghỉ đêm khách sạn tại TP. Việt Trì.\n\n` +
        `• **NGÀY 2: SĂN MÂY LONG CỐC & VQG XUÂN SƠN**\n` +
        `   - Sáng: Di chuyển lên ốc đảo chè Long Cốc đón bình minh và biển mây.\n` +
        `   - Trưa: Thưởng thức bữa trưa ẩm thực Mường tại Homestay Tony Luận.\n` +
        `   - Chiều: Khám phá VQG Xuân Sơn, tắm suối mát Thác Chín Tầng, hang Lạng.\n` +
        `   - Tối: Thưởng thức gà chín cựa nướng, lửa trại và nghỉ đêm nhà sàn Bản Dù.\n\n` +
        `• **NGÀY 3: NGHỈ DƯỠNG KHOÁNG NÓNG THANH THỦY & VỀ HÀ NỘI**\n` +
        `   - Sáng: Khởi hành sang KDL Khoáng nóng Lynn Times Thanh Thủy.\n` +
        `   - Trưa: Tắm Onsen Nhật Bản, xông đá muối phục hồi sức khỏe, ăn chả cá sông Đà.\n` +
        `   - Chiều: Mua thịt chua Thanh Sơn, bưởi Đoan Hùng làm quà và trở về.\n\n` +
        `💰 **Dự toán ngân sách:** ~2.100.000 – 2.800.000đ/người.\n` +
        `Bạn có muốn em nạp lịch trình 3N2Đ này vào bản đồ du lịch của bạn không ạ?`,
      options: [
        { label: "⭐ Bắt đầu chuyến đi 3N2Đ này", value: "start_planner", icon: "✨" },
        { label: "♨️ Xem thêm dịch vụ khoáng nóng Thanh Thủy", value: "plan_thanh_thuy", icon: "💆" },
        { label: "📸 Xem thêm ảnh đẹp Long Cốc", value: "plan_long_coc", icon: "📸" },
      ],
      updatedSurvey: {
        ...survey,
        durationDays: 3,
        durationNights: 2,
      },
    };
  }

  // 1.2. WHO ARE YOU / CAPABILITIES
  if (
    lower.includes("bạn là ai") ||
    lower.includes("em là ai") ||
    lower.includes("ai tạo ra") ||
    lower.includes("giới thiệu về bạn") ||
    lower.includes("bạn biết làm gì") ||
    lower.includes("em làm được gì") ||
    lower.includes("hướng dẫn sử dụng") ||
    lower.includes("chức năng")
  ) {
    return {
      text:
        `${greeting}Em là **Trợ lý Du lịch Đất Tổ Thông Minh (AI Travel Assistant)**, được phát triển chuyên sâu cho nền tảng Du lịch Phú Thọ & các tuyến liên kết (Vĩnh Phúc, Hòa Bình).\n\n` +
        `💡 **Các năng lực nổi bật của em:**\n` +
        `1. **Lập lịch trình tự động**: Bạn chỉ cần nói số ngày, số người, sở thích hoặc ngân sách (Ví dụ: *"Lên tour 2 ngày 1 đêm cho 4 người đi ô tô"*), em sẽ tính toán lộ trình chi tiết từng giờ.\n` +
        `2. **Thuyết minh giọng đọc Audio**: Tích hợp các tệp âm thanh thuyết minh chất lượng cao cho các di tích lịch sử và danh lam thắng cảnh.\n` +
        `3. **Bản đồ & Định vị GPS**: Tự động đo khoảng cách từ vị trí thiết bị của bạn đến các điểm đến và chỉ đường Google Maps.\n` +
        `4. **Cẩm nang OCOP & Quán ngon**: Gợi ý đặc sản chuẩn gốc (Thịt chua Thanh Sơn, Bưởi Đoan Hùng, Cá lăng sông Lô, Gà chín cựa...) kèm mức giá minh bạch.\n` +
        `5. **Giải đáp toàn diện**: Trả lời chính xác về giá vé, thời tiết các mùa, lưu trú khách sạn/homestay và các lễ hội truyền thống.`,
      options: [
        { label: "🚀 Lên lịch trình ngay", value: "start_planner", icon: "✨" },
        { label: "🏛️ Khám phá Đền Hùng", value: "plan_den_hung", icon: "🏛️" },
        { label: "🍵 Khám phá Đồi chè Long Cốc", value: "plan_long_coc", icon: "🍃" },
        { label: "♨️ Khám phá Khoáng nóng Thanh Thủy", value: "plan_thanh_thuy", icon: "💆" },
      ],
      updatedSurvey: survey,
    };
  }

  // 2. BEST TIME & SEASONALITY
  if (
    lower.includes("mùa nào") ||
    lower.includes("thời điểm nào") ||
    lower.includes("tháng mấy") ||
    lower.includes("thời tiết") ||
    lower.includes("nhiệt độ") ||
    lower.includes("mùa săn mây") ||
    lower.includes("khi nào săn mây") ||
    lower.includes("mùa lễ hội")
  ) {
    return {
      text:
        `${greeting}**Phú Thọ mang vẻ đẹp 4 mùa quanh năm**, mỗi mùa lại có một nét đặc trưng riêng biệt mà bạn không nên bỏ lỡ:\n\n` +
        `🌸 **1. Mùa Xuân (Tháng 1 – Tháng 3 Âm lịch) – Mùa Lễ Hội & Trẩy Xuân:**\n` +
        `• Đỉnh cao là **Đại lễ Giỗ Tổ Hùng Vương (mùng 10 tháng 3 Âm lịch)** trên núi Nghĩa Lĩnh, cùng Lễ hội Đền Mẫu Âu Cơ (Hạ Hòa).\n` +
        `• Không khí linh thiêng, tiết trời se lạnh ấm áp, muôn hoa đua nở, rất thích hợp du xuân tâm linh và thưởng thức Hát Xoan tại các đình cổ.\n\n` +
        `🍃 **2. Mùa Hè (Tháng 5 – Tháng 8) – Mùa Tránh Nóng Đại Ngàn:**\n` +
        `• Điểm đến số 1 là **Vườn quốc gia Xuân Sơn**: Rừng nguyên sinh trên núi đá vôi giúp nhiệt độ luôn mát lạnh 22–24°C, tha hồ tắm suối mát ở Thác Chín Tầng, Thác Tiên và thám hiểm Hang Lạng.\n` +
        `• Bạn cũng có thể vui chơi công viên nước Đảo Ngọc Xanh hoặc du thuyền lòng hồ sinh thái Đầm Ao Châu.\n\n` +
        `☁️ **3. Mùa Thu – Đông (Tháng 9 – Tháng 12) – Mùa Săn Mây & Nghỉ Dưỡng Onsen:**\n` +
        `• **Mùa săn mây đẹp nhất trong năm tại Đồi chè Long Cốc**: Biển mây bồng bềnh cuộn qua hàng trăm đồi chè bát úp lúc bình minh (05:30 – 07:00 sáng).\n` +
        `• Tiết trời se lạnh cực kỳ lý tưởng để ngâm mình trong làn **suối khoáng nóng Radon tại Lynn Times Thanh Thủy**.\n` +
        `• Đây cũng là mùa thu hoạch **Bưởi Đoan Hùng** chín vàng ngọt thơm nức mũi!`,
      options: [
        { label: "📸 Săn mây Đồi chè Long Cốc", value: "plan_long_coc", icon: "☁️" },
        { label: "♨️ Nghỉ dưỡng khoáng nóng Thanh Thủy", value: "plan_thanh_thuy", icon: "💆" },
        { label: "🏛️ Chiêm bái Đền Hùng", value: "plan_den_hung", icon: "🏛️" },
        { label: "🌲 Trekking VQG Xuân Sơn", value: "plan_xuan_son", icon: "🌲" },
      ],
      updatedSurvey: survey,
    };
  }

  // 3. TICKET PRICES & COST GUIDELINE
  if (
    lower.includes("giá vé") ||
    lower.includes("vé vào cổng") ||
    lower.includes("vé tham quan") ||
    lower.includes("vé tắm") ||
    lower.includes("bao nhiêu tiền") ||
    lower.includes("hết bao nhiêu") ||
    lower.includes("bảng giá") ||
    lower.includes("chi phí đi") ||
    lower.includes("dự toán chi phí")
  ) {
    return {
      text:
        `${greeting}Em xin gửi bạn **Bảng giá vé tham quan & Chi phí dịch vụ chuẩn xác** tại các điểm du lịch Phú Thọ:\n\n` +
        `🏛️ **1. Khu Di tích Lịch sử Đền Hùng:**\n` +
        `• **Vé vào cổng:** **MIỄN PHÍ 100%** cho toàn bộ du khách vào dâng hương các đền (Đền Hạ, Đền Trung, Đền Thượng, Đền Giếng, Lăng Vua Hùng).\n` +
        `• **Xe điện đưa đón nội khu (nếu đi):** ~50.000đ/lượt khứ hồi.\n` +
        `• **Bảo tàng Hùng Vương:** 15.000 – 30.000đ/người.\n\n` +
        `🍵 **2. Đồi chè Long Cốc (Tân Sơn):**\n` +
        `• **Vé tham quan:** **MIỄN PHÍ** vào ngắm cảnh và chụp ảnh.\n` +
        `• **Thuê trang phục dân tộc Mường / Dao:** 30.000 – 50.000đ/bộ.\n\n` +
        `🌲 **3. Vườn Quốc Gia Xuân Sơn:**\n` +
        `• **Vé tham quan rừng & hang động:** 40.000đ/người lớn (trẻ em miễn phí hoặc giảm 50%).\n` +
        `• **Homestay Bản Dù / Bản Cỏi:** 100.000 – 150.000đ/người/đêm (nhà sàn cộng đồng) hoặc 450.000 – 600.000đ/phòng bungalow.\n\n` +
        `♨️ **4. Khu Nghỉ dưỡng Khoáng nóng Thanh Thủy:**\n` +
        `• **Vé tắm Public Onsen Ohayo (Lynn Times):** 250.000 – 450.000đ/người (tùy gói Onsen Nhật Bản, xông hơi đá muối Himalaya, thảo dược).\n` +
        `• **Khu du lịch Đảo Ngọc Xanh:** ~150.000 – 200.000đ/vé trọn gói vui chơi công viên nước.\n\n` +
        `💰 **Dự toán ngân sách cho cả chuyến đi:**\n` +
        `• **Tour 1 ngày:** Khoảng **350.000 – 550.000đ/người** (đã gồm xăng xe, ăn trưa đặc sản, vé tham quan).\n` +
        `• **Tour 2 ngày 1 đêm:** Khoảng **1.200.000 – 1.850.000đ/người** (đã gồm khách sạn/resort, tắm Onsen, 4 bữa ăn đặc sản).`,
      options: [
        { label: "⭐ Xem Lịch trình 2N1Đ chuẩn ngân sách", value: "tour_2n1d", icon: "⭐" },
        { label: "🍃 Xem Lịch trình 1N Long Cốc tiết kiệm", value: "tour_long_coc", icon: "🍃" },
        { label: "✨ Lên lịch trình theo ngân sách của tôi", value: "start_planner", icon: "💰" },
      ],
      updatedSurvey: survey,
    };
  }

  // 4. SOUVENIRS & OCOP SPECIALTIES TO BUY AS GIFTS
  if (
    lower.includes("mua gì làm quà") ||
    lower.includes("quà lưu niệm") ||
    lower.includes("đặc sản làm quà") ||
    lower.includes("mua quà") ||
    lower.includes("quà biếu") ||
    lower.includes("mua về làm quà") ||
    lower.includes("thịt chua mua ở đâu") ||
    lower.includes("bưởi đoan hùng mua")
  ) {
    return {
      text:
        `${greeting}Khi du lịch Phú Thọ, bạn nhất định nên mua **Top 7 Đặc sản OCOP trứ danh** sau đây về làm quà biếu tặng gia đình và bạn bè:\n\n` +
        `1. 🥩 **Thịt chua Thanh Sơn (OCOP 4 sao) – Món quà số 1:**\n` +
        `• Thịt lợn mán sạch ủ thính ngô nương lên men tự nhiên, thơm bùi, đóng trong ống nứa hoặc hộp tiện lợi, ăn kèm lá sung lá ổi và tương ớt.\n` +
        `• *Thương hiệu uy tín:* Nghị Thịnh, Điệp Đào, Trường Foods. Bảo quản ngăn mát tủ lạnh được 15 – 30 ngày.\n\n` +
        `2. 🍈 **Bưởi Đoan Hùng (Tiến Vua):**\n` +
        `• Giống bưởi Sửu Chí Đám và bưởi Bằng Luân: Quả tròn dẹt, tép mọng nước trong veo, vị ngọt thanh mát, để càng héo vỏ càng thơm ngọt.\n\n` +
        `3. 🍵 **Trà Shan tuyết cổ thụ Long Cốc & Chè Chùa Tà:**\n` +
        `• Búp chè phủ lớp lông tuyết trắng mịn màng, nước chè xanh vàng óng ánh, vị tiền chát hậu ngọt sâu lắng đậm đà hương núi rừng.\n\n` +
        `4. 🍯 **Mật ong hoa rừng nguyên chất VQG Xuân Sơn:**\n` +
        `• Mật ong tự nhiên màu vàng óng, thơm mùi hoa rừng nhiệt đới, có công dụng bồi bổ sức khỏe và làm đẹp rất tốt.\n\n` +
        `5. 🐟 **Cá thính Cẩm Khê (Cá muối thính chua):**\n` +
        `• Cá tươi ủ muối và thính ngô rang thơm trong chum sành truyền thống. Khi nướng than hoa hoặc rán vàng, thịt cá săn chắc chua dịu bùi ngậy.\n\n` +
        `6. 🥟 **Bánh tai Phú Thọ & Bánh chưng Đất Tổ làng Dòng:**\n` +
        `• Bánh tai dẻo mềm nhân thịt ba chỉ hành tiêu thơm phức; bánh chưng dẻo rền xanh mướt cội nguồn.\n\n` +
        `7. 🎋 **Măng đắng, măng nứa khô Xuân Sơn & Tương nếp Dục Mỹ (Lâm Thao).**`,
      options: [
        { label: "🥩 Xem chi tiết Thịt chua Thanh Sơn", value: "explore_food_phu_tho", icon: "🥩" },
        { label: "🍵 Khám phá Đồi chè Long Cốc", value: "plan_long_coc", icon: "🍃" },
        { label: "✨ Lên tour kết hợp mua sắm đặc sản", value: "plan_food_tour", icon: "✨" },
      ],
      updatedSurvey: survey,
    };
  }

  // 5. TRANSPORTATION & HOW TO GET THERE
  if (
    lower.includes("từ hà nội") ||
    lower.includes("khoảng cách") ||
    lower.includes("bao nhiêu km") ||
    lower.includes("mất bao lâu") ||
    lower.includes("đi đường nào") ||
    lower.includes("đường đi đền hùng") ||
    lower.includes("đường đi long cốc") ||
    lower.includes("đường đi thanh thủy") ||
    lower.includes("xe máy đi được không") ||
    lower.includes("ô tô có lên được")
  ) {
    return {
      text:
        `${greeting}Hệ thống giao thông kết nối Hà Nội và các tỉnh với Phú Thọ hiện nay **cực kỳ thuận tiện, đường sá rộng rãi và bằng phẳng**:\n\n` +
        `🚗 **1. Hà Nội → TP. Việt Trì & Đền Hùng (~80 km, 1 giờ 20 phút):**\n` +
        `• **Ô tô:** Chạy thẳng cao tốc **Nội Bài – Lào Cai**, ra tại nút giao **IC7** (vào trung tâm TP. Việt Trì) hoặc **IC8** (đến thẳng cổng Đền Hùng).\n` +
        `• **Xe máy / Ô tô theo đường QL32:** Đi qua Sơn Tây, qua Cầu Trung Hà hoặc Cầu Văn Lang là tới ngay Việt Trì.\n` +
        `• **Xe Limousine:** Đón trả tận nơi tại Hà Nội (Nhà xe Nam Cường, Hà Hải, Mekong...) giá vé 130.000 – 160.000đ/lượt.\n\n` +
        `🍵 **2. Hà Nội → Đồi chè Long Cốc & VQG Xuân Sơn (~115 km – 130 km, 2 giờ 30 phút):**\n` +
        `• **Lộ trình:** Hà Nội theo QL32 qua Sơn Tây → TT. Thanh Sơn → rẽ ĐT316 vào xã Long Cốc (huyện Tân Sơn).\n` +
        `• *Tình trạng đường:* Toàn bộ tuyến đường đã được rải nhựa áp-phan phẳng đẹp. Xe ô tô 4 chỗ, 7 chỗ hay xe máy đều lên đồi chè an toàn và êm ái.\n\n` +
        `♨️ **3. Hà Nội → Suối khoáng nóng Thanh Thủy (~65 km, 1 giờ 15 phút):**\n` +
        `• Đi thẳng Đại lộ Thăng Long qua cầu Đồng Quang hoặc cầu Trung Hà rẽ trái vào huyện Thanh Thủy.`,
      options: [
        { label: "🗺️ Mở bản đồ chỉ đường Google Maps", value: "xem_ban_do", icon: "🚗" },
        { label: "⭐ Lên lịch trình di chuyển chi tiết", value: "start_planner", icon: "✨" },
      ],
      updatedSurvey: survey,
    };
  }

  // 6. HOTELS, RESORTS & HOMESTAYS
  if (
    lower.includes("nghỉ ở đâu") ||
    lower.includes("khách sạn") ||
    lower.includes("resort") ||
    lower.includes("homestay") ||
    lower.includes("chỗ ở") ||
    lower.includes("thuê phòng") ||
    lower.includes("nghỉ đêm")
  ) {
    return {
      text:
        `${greeting}Dưới đây là **Các địa chỉ lưu trú uy tín, chất lượng nhất** theo từng khu vực tại Phú Thọ:\n\n` +
        `♨️ **1. Khu nghỉ dưỡng Khoáng nóng Thanh Thủy (Nghỉ dưỡng & Phục hồi):**\n` +
        `• **Lynn Times Thanh Thủy (5 sao):** Quần thể shoptel khoáng nóng chuẩn Nhật, công viên Onsen Ohayo, xông hơi đá muối, phố đi bộ Hokkaido.\n` +
        `• **Wyndham Lynn Times Thanh Thủy:** Khách sạn cao tầng khoáng nóng sang trọng.\n` +
        `• **Vườn Vua Resort & Villas:** Khu nghỉ dưỡng sinh thái đầm sen Bạch Thủy thơ mộng.\n\n` +
        `🏙️ **2. Khu vực TP. Việt Trì (Trung tâm & Gần Đền Hùng):**\n` +
        `• **Khách sạn Mường Thanh Luxury Phú Thọ (5 sao):** Sang trọng, view công viên Văn Lang và hồ nước trung tâm.\n` +
        `• **Khách sạn Sài Gòn Phú Thọ (4 sao):** Trung tâm đường Hùng Vương, dịch vụ chu đáo.\n` +
        `• **X2 Vibe Việt Trì Hotel (4 sao):** Trẻ trung, hiện đại bên bờ hồ Văn Lang.\n\n` +
        `🍃 **3. Khu vực Đồi chè Long Cốc & VQG Xuân Sơn (Trải nghiệm bản địa):**\n` +
        `• **Homestay Tony Luận (Long Cốc):** Nhà sàn gỗ mộc mạc view nhìn thẳng ra ốc đảo chè bát úp, phục vụ trà Shan tuyết và ẩm thực Mường.\n` +
        `• **Homestay Quỳnh Nga (Long Cốc):** Tiện nghi, thân thiện, dịch vụ thuê trang phục chụp ảnh.\n` +
        `• **Homestay Bản Dù & Bản Cỏi (Xuân Sơn):** Trải nghiệm văn hóa người Dao Tiền, tắm suối mát và ăn gà chín cựa nướng than hoa.`,
      options: [
        { label: "♨️ Lên tour Lynn Times Thanh Thủy 2N1Đ", value: "tour_2n1d", icon: "⭐" },
        { label: "🍃 Lên tour Homestay Long Cốc – Xuân Sơn", value: "tour_long_coc", icon: "🍃" },
        { label: "🏛️ Tour Đền Hùng & Việt Trì", value: "plan_den_hung", icon: "🏛️" },
      ],
      updatedSurvey: survey,
    };
  }

  // 7. HISTORICAL & UNESCO CULTURAL HERITAGE
  if (
    lower.includes("hát xoan") ||
    lower.includes("giỗ tổ") ||
    lower.includes("lễ hội đền hùng") ||
    lower.includes("tín ngưỡng thờ cúng") ||
    lower.includes("hùng lô") ||
    lower.includes("đền mẫu âu cơ") ||
    lower.includes("bánh chưng bánh giầy") ||
    lower.includes("lang liêu")
  ) {
    return {
      text:
        `${greeting}Phú Thọ là **cái nôi cội nguồn thiêng liêng của dân tộc Việt Nam**, tự hào sở hữu **2 Di sản văn hóa phi vật thể đại diện của nhân loại** được UNESCO vinh danh:\n\n` +
        `🏛️ **1. Tín ngưỡng Thờ cúng Hùng Vương (Di sản UNESCO 2012):**\n` +
        `• Thể hiện lòng biết ơn sâu sắc đối với các Vua Hùng có công dựng nước, bồi đắp đạo lý truyền thống *"Uống nước nhớ nguồn"*. Điểm tựa tâm linh gắn kết muôn triệu người con đất Việt qua ngàn năm lịch sử.\n\n` +
        `🎶 **2. Nghệ thuật Hát Xoan Phú Thọ (Di sản UNESCO 2017):**\n` +
        `• Loại hình dân ca nghi lễ phong tục độc nhất vô nhị, gồm 3 chặng: Hát thờ, Hát quả cách và Hát hội.\n` +
        `• *Nơi thưởng thức trọn vẹn nhất:* **Đình cổ Hùng Lô** (hơn 300 năm tuổi, kiến trúc chạm khắc rồng phượng tinh xảo), Miếu Lãi Lèn, Đình An Thái.\n\n` +
        `👑 **3. Truyền thuyết Bánh chưng – Bánh giầy & Hoàng tử Lang Liêu:**\n` +
        `• Gắn liền với Đền Trung (núi Nghĩa Lĩnh), biểu trưng cho Trời tròn – Đất vuông và tình cảm hiếu nghĩa mộc mạc với cây lúa nước hạt ngọc trời.\n\n` +
        `👸 **4. Đền Mẫu Âu Cơ (Hạ Hòa):**\n` +
        `• Nơi tôn vinh Người Mẹ huyền thoại sinh ra bọc trăm trứng, cội nguồn hai tiếng *"Đồng bào"* thiêng liêng của nòi giống Con Rồng Cháu Tiên.`,
      options: [
        { label: "🏛️ Tour Di sản Đền Hùng – Hùng Lô (1 Ngày)", value: "plan_den_hung", icon: "🏛️" },
        { label: "⭐ Tour chuẩn 2N1Đ có Audio thuyết minh", value: "tour_2n1d", icon: "🎙️" },
      ],
      updatedSurvey: survey,
    };
  }

  // 8. ĐỒI CHÈ LONG CỐC SPECIFIC
  if (
    lower.includes("đồi chè long cốc") ||
    lower.includes("doi che long coc") ||
    lower.includes("long cốc có gì") ||
    lower.includes("vịnh hạ long trên cạn")
  ) {
    return {
      text:
        `${greeting}**Đồi chè Long Cốc** (huyện Tân Sơn, Phú Thọ) được mệnh danh là **"Vịnh Hạ Long trên cạn"** của vùng trung du Bắc Bộ:\n\n` +
        `📸 **Điểm độc đáo thu hút du khách:**\n` +
        `• Hàng trăm quả đồi chè hình bán cầu tròn xoe, nhấp nhô như những **chiếc bát úp khổng lồ** xếp san sát nhau trải dài đến tận chân trời.\n` +
        `• **Thiên đường săn mây:** Vào sáng sớm (05:30 – 07:00), biển mây trắng muốt bồng bềnh tràn qua các khe đồi, tạo nên khung cảnh sương mây huyền ảo đẹp như chốn bồng lai tiên cảnh.\n` +
        `• **Trải nghiệm:** Tản bộ giữa luống chè xanh mướt, thuê trang phục dân tộc Mường/Dao chụp ảnh, thưởng thức trà Shan tuyết ấm nồng tại Homestay Tony Luận.\n\n` +
        `💡 *Mẹo nhỏ:* Kết hợp Đồi chè Long Cốc vào buổi sáng với Vườn quốc gia Xuân Sơn vào buổi chiều tạo nên chuyến du lịch sinh thái 1 ngày hoàn hảo!`,
      options: [
        { label: "🍃 Mở Tour 1N Long Cốc – Xuân Sơn (Có Audio)", value: "tour_long_coc", icon: "🍃" },
        { label: "🗺️ Chỉ đường đến Đồi chè Long Cốc", value: "xem_ban_do_long_coc", icon: "🚗" },
      ],
      updatedSurvey: survey,
    };
  }

  // 9. VƯỜN QUỐC GIA XUÂN SƠN SPECIFIC
  if (
    lower.includes("xuân sơn") ||
    lower.includes("xuan son") ||
    lower.includes("vườn quốc gia xuân sơn") ||
    lower.includes("thác chín tầng") ||
    lower.includes("hang lạng") ||
    lower.includes("bản dù")
  ) {
    return {
      text:
        `${greeting}**Vườn quốc gia Xuân Sơn** (huyện Tân Sơn) là "lá phổi xanh" nguyên sinh quý giá bậc nhất tỉnh Phú Thọ:\n\n` +
        `🌲 **Cảnh quan & Trải nghiệm nổi bật:**\n` +
        `• **Hệ sinh thái rừng nhiệt đới trên núi đá vôi:** Rừng cổ thụ rậm rạp che phủ 3 đỉnh núi cao trên 1.000m (Núi Voi, Núi Ten, Núi Cẩn), khí hậu mát lạnh trong lành quanh năm.\n` +
        `• **Thác Chín Tầng & Thác Ngọc:** Dòng nước suối trong vắt mát lạnh chảy qua các tầng đá ghềnh tuyệt đẹp.\n` +
        `• **Hệ thống hang động kỳ vĩ:** Hang Lạng, Hang Na, Hang Sơn Dương với muôn vàn nhũ đá lấp lánh nguyên sơ.\n` +
        `• **Bản làng văn hóa Bản Dù & Bản Cỏi:** Tìm hiểu đời sống mộc mạc của đồng bào Dao Tiền và Mường, cầu treo thơ mộng, nghề dệt thổ cẩm và mâm cỗ Gà chín cựa nướng than hoa tiến Vua.`,
      options: [
        { label: "🍃 Tour kết hợp Long Cốc – VQG Xuân Sơn (1 Ngày)", value: "tour_long_coc", icon: "🍃" },
        { label: "🍗 Đặc sản Gà chín cựa Xuân Sơn", value: "explore_food_phu_tho", icon: "🍗" },
      ],
      updatedSurvey: survey,
    };
  }

  // 10. GÀ CHÍN CỰA (GÀ NHIỀU CỰA)
  if (
    lower.includes("gà chín cựa") ||
    lower.includes("ga chin cua") ||
    lower.includes("gà nhiều cựa") ||
    lower.includes("sơn tinh thủy tinh")
  ) {
    return {
      text:
        `${greeting}**Gà chín cựa (Gà nhiều cựa)** là giống gà quý huyền thoại gắn liền với tích thách cưới công chúa Mỵ Nương trong truyền thuyết *Sơn Tinh – Thủy Tinh*:\n\n` +
        `🐓 **Đặc điểm & Nguồn gốc:**\n` +
        `• Giống gà bản địa quý hiếm được nuôi thả tự nhiên trên núi rừng Bản Cỏi, Bản Dù thuộc Vườn quốc gia Xuân Sơn.\n` +
        `• Gà có vóc dáng nhanh nhẹn, mào đỏ tươi, chân to vàng óng và đặc biệt mọc từ 6 đến 8 cựa (rất hiếm con đủ 9 cựa).\n` +
        `• **Hương vị:** Thịt gà săn chắc, thơm ngọt tự nhiên, da giòn sần sật và không hề bị ngấy.\n` +
        `• **Món ngon:** Gà chín cựa nướng than hoa chấm muối ớt hạt dổi mắc khén, gà hấp lá chanh tiến Vua, ăn kèm xôi ngũ sắc và rau dớn rừng tại Nhà hàng Thế Nhé 1 hoặc các homestay Xuân Sơn.`,
      options: [
        { label: "🍗 Thưởng thức tại Tour Long Cốc – Xuân Sơn", value: "tour_long_coc", icon: "🍃" },
        { label: "🥢 Xem thêm món ngon Phú Thọ", value: "explore_food_phu_tho", icon: "🍲" },
      ],
      updatedSurvey: survey,
    };
  }

  // 11. SUỐI KHOÁNG NÓNG THANH THỦY
  if (
    lower.includes("khoáng nóng thanh thủy") ||
    lower.includes("khoang nong thanh thuy") ||
    lower.includes("tác dụng khoáng") ||
    lower.includes("lynn times thanh thủy") ||
    lower.includes("onsen thanh thủy")
  ) {
    return {
      text:
        `${greeting}**Suối khoáng nóng Thanh Thủy** là nguồn tài nguyên vô giá thiên nhiên ban tặng cho vùng Đất Tổ:\n\n` +
        `♨️ **Điểm đặc biệt quý hiếm:**\n` +
        `• **Khoáng nóng Radon tự nhiên:** Mạch nước ngầm hình thành sâu trong lòng đất núi lửa cổ xưa, nhiệt độ ổn định 37°C – 53°C.\n` +
        `• **Công dụng sức khỏe kỳ diệu:** Tinh chất khoáng Radon vi lượng giúp đào thải độc tố, lưu thông khí huyết, hỗ trợ điều trị đau nhức xương khớp, trẻ hóa làn da và giải tỏa căng thẳng thần kinh hiệu quả.\n` +
        `• **Tổ hợp nghỉ dưỡng 5 sao Lynn Times:** Tắm Onsen phong cách Nhật Bản ngoài trời, xông hơi đá muối Himalaya, ngâm thảo dược thuốc bắc và dạo phố đi bộ Hokkaido rực rỡ sắc màu.`,
      options: [
        { label: "⭐ Lên lịch trình nghỉ dưỡng Onsen 2N1Đ", value: "tour_2n1d", icon: "⭐" },
        { label: "🎟️ Giá vé & Dịch vụ Lynn Times", value: "hoi_gia_ve", icon: "🎫" },
      ],
      updatedSurvey: survey,
    };
  }

  // 12. PHÚ THỌ CÓ GÌ CHƠI / TỔNG QUAN DU LỊCH
  if (
    lower.includes("phú thọ có gì") ||
    lower.includes("phu tho co gi") ||
    lower.includes("chơi gì ở phú thọ") ||
    lower.includes("du lịch phú thọ có gì") ||
    lower.includes("điểm du lịch phú thọ") ||
    lower.includes("tham quan phú thọ")
  ) {
    return {
      text:
        `${greeting}Du lịch Phú Thọ hội tụ **4 Trụ Cột Trải Nghiệm** độc đáo bậc nhất miền Bắc:\n\n` +
        `1. 🏛️ **Tâm linh Cội Nguồn Di Sản:**\n` +
        `• Khu di tích lịch sử Quốc gia đặc biệt **Đền Hùng** trên đỉnh Nghĩa Lĩnh.\n` +
        `• Đền Mẫu Âu Cơ (Hạ Hòa), Chùa Cổ Thiên Quang, Đình cổ Hùng Lô hơn 300 năm nghe Hát Xoan Di sản UNESCO.\n\n` +
        `2. 🍃 **Kỳ quan Sinh Thái & Săn Mây:**\n` +
        `• **Đồi chè Long Cốc:** "Vịnh Hạ Long trên cạn" với hàng trăm quả đồi chè bát úp bồng bềnh mây sớm.\n` +
        `• **Vườn quốc gia Xuân Sơn:** Rừng nguyên sinh đá vôi, thác Chín Tầng, hang động thạch nhũ và văn hóa người Dao, Mường.\n` +
        `• **Đầm Ao Châu & Hồ Ly:** Thảm nước mênh mông như bức tranh sơn thủy hữu tình.\n\n` +
        `3. ♨️ **Nghỉ Dưỡng Khoáng Nóng Thiên Nhiên:**\n` +
        `• **Lynn Times Thanh Thủy:** Thiên đường Onsen khoáng Radon chuẩn Nhật Bản và Vườn Vua Resort.\n\n` +
        `4. 🍲 **Tinh Hoa Ẩm Thực Đất Tổ:**\n` +
        `• Thịt chua Thanh Sơn, Bưởi Đoan Hùng tiến Vua, Cá lăng sông Lô, Gà chín cựa nướng, Bánh tai, Bánh chưng Đất Tổ.\n\n` +
        `👉 Em có thể lên ngay lịch trình phù hợp với thời gian và số người của đoàn mình!`,
      options: [
        { label: "⭐ Tour chuẩn 2N1Đ (Đền Hùng · Onsen · Tam Đảo)", value: "tour_2n1d", icon: "⭐" },
        { label: "🍃 Tour sinh thái 1N (Long Cốc · Xuân Sơn)", value: "tour_long_coc", icon: "🍃" },
        { label: "✨ Tự thiết kế lịch trình riêng", value: "start_planner", icon: "✨" },
        { label: "🍲 Khám phá món ngon đặc sản", value: "ask_foods", icon: "🥢" },
      ],
      updatedSurvey: survey,
    };
  }

  // 13. THANK YOU / COMPLIMENTS
  if (
    lower.includes("cảm ơn") ||
    lower.includes("cam on") ||
    lower.includes("thank") ||
    lower.includes("tuyệt vời") ||
    lower.includes("tuyet voi") ||
    lower.includes("hay quá") ||
    lower.includes("hay qua") ||
    lower.includes("thông minh") ||
    lower.includes("ok em") ||
    lower.includes("tốt lắm")
  ) {
    return {
      text:
        `${greeting}Rất vui được hỗ trợ bạn! Chúc bạn và gia đình có một chuyến đi khám phá Đất Tổ Phú Thọ thật trọn vẹn, nhiều niềm vui và nhiều kỷ niệm đẹp! 🌸\n\n` +
        `Nếu bạn cần hỗ trợ thêm thông tin điểm đến, quán ăn ngon hay tối ưu lịch trình, đừng ngần ngại nhắn cho em bất kỳ lúc nào nhé!`,
      options: [
        { label: "🗺️ Xem lại Lịch trình đã tạo", value: "view_trip_now", icon: "🗺️" },
        { label: "💾 Lưu lịch trình vào Sổ tay", value: "save_trip_now", icon: "⭐" },
        { label: "🍃 Xem thêm Tour Long Cốc – Xuân Sơn", value: "tour_long_coc", icon: "🍃" },
      ],
      updatedSurvey: survey,
    };
  }

  return null;
}
