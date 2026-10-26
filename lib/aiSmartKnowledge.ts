import { type AiSurveyState, type AiResponseResult } from "./aiChatEngine";
import { buildItinerary, type GeneratedItinerary, getOfficialDocxItinerary, getOfficialLongCocXuanSonItinerary } from "./guidePlanner";
import { places, type Place, ACCOMMODATIONS_DATABASE } from "@/data/travel";
import { getAllDistrictPlaces } from "./districtPlaceGenerator";
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

// =========================================================================
// DYNAMIC ROUTE COMBINER & RANDOM ITINERARY GENERATOR
// =========================================================================

/**
 * Quét và trích xuất tất cả các địa danh được người dùng nhắc tới trong câu hỏi
 */
export function extractAllMentionedPlaces(text: string): Place[] {
  const norm = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ]/g, "d");

  const allPlacesPool: Place[] = [...places, ...getAllDistrictPlaces()];
  const matchedMap = new Map<string, Place>();

  // 1. Quét 18 địa danh cốt lõi
  const PLACE_KEYWORD_MAP: Array<{ keywords: string[]; placeId: string }> = [
    { keywords: ["den hung", "nghia linh", "hung vuong", "lang vua hung", "den cac vua hung"], placeId: "den-hung" },
    { keywords: ["long coc", "doi che long coc", "che bat up", "che long coc"], placeId: "long-coc" },
    { keywords: ["xuan son", "vqg xuan son", "vuon quoc gia xuan son", "hang lang", "ban coi", "ban du"], placeId: "xuan-son" },
    { keywords: ["thanh thuy", "khoang nong thanh thuy", "lynn times", "onsen thanh thuy", "suoi khoang thanh thuy", "ohayo onsen", "bamboo thanh thuy"], placeId: "thanh-thuy" },
    { keywords: ["au co", "den mau au co", "hien luong"], placeId: "den-mau-au-co" },
    { keywords: ["hung lo", "lang co hung lo", "dinh hung lo", "hat xoan hung lo", "hat xoan"], placeId: "hung-lo" },
    { keywords: ["dam ao chau", "ao chau", "ao chau ha hoa"], placeId: "dam-ao-chau" },
    { keywords: ["dao ngoc xanh", "kdl dao ngoc xanh", "cong vien nuoc dao ngoc xanh"], placeId: "dao-ngoc-xanh" },
    { keywords: ["tam dao", "thi tran tam dao", "nha tho da tam dao", "cong troi tam dao"], placeId: "tam-dao" },
    { keywords: ["tay thien", "thien vien truc lam tay thien", "quoc mau tay thien", "chua tay thien"], placeId: "tay-thien" },
    { keywords: ["ban lac", "mai chau", "thung lung mai chau"], placeId: "ban-lac-mai-chau" },
    { keywords: ["kim boi", "khoang nong kim boi", "suoi khoang kim boi"], placeId: "khoang-nong-kim-boi" },
    { keywords: ["thung nai", "thac bo", "den thac bo", "long ho song da"], placeId: "thung-nai-song-da" },
    { keywords: ["lang gom huong canh", "gom huong canh", "huong canh"], placeId: "lang-gom-huong-canh" },
    { keywords: ["ho dai lai", "dai lai", "flamingo dai lai"], placeId: "ho-dai-lai" },
    { keywords: ["chua ha tien", "chua ha vinh yen", "ha tien"], placeId: "chua-ha-tien" },
    { keywords: ["bao tang muong", "khong gian van hoa muong"], placeId: "bao-tang-muong" },
    { keywords: ["pa co", "san may pa co", "cho phien pa co"], placeId: "pa-co-san-may" },
  ];

  for (const item of PLACE_KEYWORD_MAP) {
    if (item.keywords.some((kw) => norm.includes(kw))) {
      const found = allPlacesPool.find((p) => p.id === item.placeId);
      if (found && !matchedMap.has(found.id)) {
        matchedMap.set(found.id, found);
      }
    }
  }

  // 2. Quét các điểm tham quan con & địa danh huyện
  const SPOT_KEYWORD_MAP: Array<{ keywords: string[]; spotId: string; fallbackId?: string }> = [
    { keywords: ["tam giang", "chua tam giang", "den tam giang", "bach hac", "nga ba hac", "ben got"], spotId: "viet-tri-spot-3", fallbackId: "den-hung" },
    { keywords: ["van lang", "cong vien van lang", "cau di bo"], spotId: "viet-tri-spot-2", fallbackId: "den-hung" },
    { keywords: ["lac long quan", "den lac long quan"], spotId: "viet-tri-spot-4", fallbackId: "den-hung" },
    { keywords: ["vuon vua", "vuon vua resort"], spotId: "tam-nong-spot-0", fallbackId: "thanh-thuy" },
    { keywords: ["lang suong", "den lang suong"], spotId: "thanh-thuy-spot-2", fallbackId: "thanh-thuy" },
    { keywords: ["thac choi", "cu thang"], spotId: "thanh-son-spot-3", fallbackId: "long-coc" },
    { keywords: ["ho ly", "dap ly"], spotId: "yen-lap-spot-0", fallbackId: "long-coc" },
    { keywords: ["doan hung", "buoi doan hung", "song lo"], spotId: "district-doan-hung", fallbackId: "den-mau-au-co" },
    { keywords: ["ha hoa", "hien luong"], spotId: "district-ha-hoa", fallbackId: "den-mau-au-co" },
    { keywords: ["thanh son", "thit chua thanh son"], spotId: "district-thanh-son", fallbackId: "long-coc" },
    { keywords: ["tan son"], spotId: "district-tan-son", fallbackId: "long-coc" },
    { keywords: ["lam thao", "chu quyen", "lang dong"], spotId: "district-lam-thao", fallbackId: "hung-lo" },
  ];

  for (const spot of SPOT_KEYWORD_MAP) {
    if (spot.keywords.some((kw) => norm.includes(kw))) {
      const foundSpot = allPlacesPool.find((p) => p.id === spot.spotId) || allPlacesPool.find((p) => p.id === spot.fallbackId);
      if (foundSpot && !matchedMap.has(foundSpot.id)) {
        matchedMap.set(foundSpot.id, foundSpot);
      }
    }
  }

  return Array.from(matchedMap.values());
}

/**
 * Kiểm tra xem người dùng có đang yêu cầu ghép lộ tuyến / ghép lịch trình ngẫu nhiên hay không
 */
export function checkIsRouteCombinerIntent(lower: string): boolean {
  // 1. Chứa từ khóa ghép trực tiếp hoặc kết hợp
  const hasGhep =
    /ghép|ghep|kết hợp|ket hop|liên tuyến|lien tuyen|ghép lộ tuyến|ghep lo tuyen|ghép lịch trình|ghep lich trinh|ghép tour|ghep tour|ghép các điểm|ghep cac diem|ghép tuyến|ghep tuyen|lộ tuyến phù hợp/i.test(lower);

  // 2. Chứa từ khóa ngẫu nhiên
  const hasNgauNhien =
    /ngẫu nhiên|ngau nhien|bất kỳ|bat ky|tuỳ chọn|tuy chon/i.test(lower);

  // 3. Có số người và hỏi lộ tuyến / lịch trình
  const hasPax =
    /\b\d+\s*(?:người|nguoi|khách|khach|thành viên|thanh vien|bạn|ban|pax|mem)\b/i.test(lower) ||
    /cặp đôi|gia đình|đoàn/i.test(lower);
  const hasTour =
    /lộ tuyến|lo tuyen|lịch trình|lich trinh|tour|kế hoạch|chuyến đi|phương án/i.test(lower);

  // 4. Có từ 2 địa danh xuất hiện cùng nhau
  let placeHits = 0;
  const majorKeyPatterns = [
    /đền hùng|den hung|hùng vương/,
    /long cốc|long coc|đồi chè|doi che/,
    /xuân sơn|xuan son/,
    /thanh thủy|thanh thuy|khoáng nóng|onsen/,
    /tam đảo|tam dao/,
    /tây thiên|tay thien/,
    /hùng lô|hung lo|hát xoan/,
    /âu cơ|au co/,
    /ao châu|ao chau/,
    /đảo ngọc xanh|dao ngoc xanh/,
    /vườn vua|vuon vua/,
    /lăng sương|lang suong/,
    /thác chòi|thac choi/,
    /đoan hùng|doan hung/,
    /hạ hòa|ha hoa/,
    /thanh sơn|thanh son/,
    /tân sơn|tan son/,
    /mai châu|mai chau/,
    /hòa bình|hoa binh/,
  ];
  for (const kp of majorKeyPatterns) {
    if (kp.test(lower)) placeHits++;
  }

  if (hasGhep) return true;
  if (hasNgauNhien && (hasPax || hasTour || /du lịch|đi chơi|đi đâu/i.test(lower))) return true;
  if (placeHits >= 2 && (hasTour || /đi|du lịch|gợi ý|tư vấn|sắp xếp|tuyến|cho tôi/i.test(lower))) return true;
  if (hasPax && hasTour && (lower.includes("lộ tuyến") || lower.includes("phù hợp") || lower.includes("ghép"))) return true;

  // Người dùng hỏi trực tiếp câu của user: "chưa thể ghép lộ tuyến", "muốn nó có thể ghép", "ghép các lịch trình ngẫu nhiên"
  if (
    (lower.includes("ghép") && (lower.includes("lộ tuyến") || lower.includes("lịch trình") || lower.includes("tour") || lower.includes("người"))) ||
    (lower.includes("lộ tuyến") && lower.includes("ngẫu nhiên")) ||
    (lower.includes("lịch trình") && lower.includes("ngẫu nhiên"))
  ) {
    return true;
  }

  return false;
}

/**
 * Xử lý ghép lộ tuyến thông minh và đưa ra lộ tuyến phù hợp nhất cho số lượng người ngẫu nhiên
 */
export function handleDynamicRouteCombiner(
  rawText: string,
  survey: AiSurveyState,
  userName?: string
): AiResponseResult | null {
  const lower = rawText.toLowerCase();
  const greeting = userName ? `Chào **${userName}**! ` : "Dạ, ";

  // 1. Trích xuất số lượng người ngẫu nhiên (N)
  let travelers = 4; // Mặc định gia đình/nhóm bạn
  let isExplicitTravelers = false;

  const travMatch = rawText.match(/\b(\d+)\s*(?:người|nguoi|khách|khach|thành viên|thanh vien|bạn|ban|vé|ve|pax|mem)\b/i);
  if (travMatch && travMatch[1]) {
    travelers = Math.max(1, Math.min(200, parseInt(travMatch[1], 10)));
    isExplicitTravelers = true;
  } else if (/cặp đôi|hai người|2 vợ chồng|đôi bạn/i.test(lower)) {
    travelers = 2;
    isExplicitTravelers = true;
  } else if (/solo|1 mình|một mình|đi lẻ/i.test(lower)) {
    travelers = 1;
    isExplicitTravelers = true;
  } else if (/gia đình nhỏ|nhà 3 người/i.test(lower)) {
    travelers = 3;
    isExplicitTravelers = true;
  } else if (/gia đình|nhà 4 người/i.test(lower)) {
    travelers = 4;
    isExplicitTravelers = true;
  } else if (/đoàn đông|công ty|cơ quan/i.test(lower)) {
    travelers = 20;
    isExplicitTravelers = true;
  } else if (survey.travelers && survey.travelers !== 2) {
    travelers = survey.travelers;
    isExplicitTravelers = true;
  } else if (/ngẫu nhiên/i.test(lower)) {
    // Nếu người dùng yêu cầu ngẫu nhiên, ta chọn ngẫu nhiên các số lượng thực tế
    const samplePax = [2, 4, 6, 8, 12, 20];
    travelers = samplePax[Math.floor(Math.random() * samplePax.length)];
  }

  // 2. Trích xuất thời lượng (Số ngày D, số đêm K)
  let durationDays = 2;
  let durationNights = 1;

  if (/\b1\s*(?:ngày|ngay)\b|trong ngày|sáng đi chiều về|di trong ngay/i.test(lower)) {
    durationDays = 1;
    durationNights = 0;
  } else if (/\b3\s*(?:ngày|ngay)\b|3n2d|3n2đ|ba ngày/i.test(lower)) {
    durationDays = 3;
    durationNights = 2;
  } else if (/\b4\s*(?:ngày|ngay)\b|4n3d/i.test(lower)) {
    durationDays = 4;
    durationNights = 3;
  } else if (/\b2\s*(?:ngày|ngay)\b|2n1d|2n1đ|hai ngày/i.test(lower)) {
    durationDays = 2;
    durationNights = 1;
  }

  // 3. Trích xuất danh sách các điểm người dùng muốn ghép
  const extractedPlaces = extractAllMentionedPlaces(rawText);
  let chosenPlaces: Place[] = [];
  let routeTheme = "";
  let routeDescription = "";

  const allPlacesPool: Place[] = [...places, ...getAllDistrictPlaces()];

  if (extractedPlaces.length >= 2) {
    // Người dùng chỉ định từ 2 điểm cụ thể trở lên
    chosenPlaces = [...extractedPlaces];
    routeTheme = `Ghép Tuyến Theo Yêu Cầu (${chosenPlaces.map((p) => p.shortName).join(" – ")})`;
    routeDescription = `Cung đường được tối ưu hóa địa lý kết nối các điểm du lịch bạn đã chọn, hạn chế tối đa việc di chuyển vòng vèo.`;
  } else if (extractedPlaces.length === 1) {
    // Người dùng chỉ định 1 điểm then chốt -> Ghép thêm các điểm vệ tinh đẹp nhất
    const anchor = extractedPlaces[0];
    chosenPlaces.push(anchor);

    if (anchor.id === "den-hung") {
      const pThanhThuy = allPlacesPool.find((p) => p.id === "thanh-thuy") || places[3];
      const pHungLo = allPlacesPool.find((p) => p.id === "hung-lo") || places[5];
      chosenPlaces.push(pHungLo, pThanhThuy);
      routeTheme = `Tuyến Di Sản Cội Nguồn & Suối Khoáng Nóng Thư Giãn`;
      routeDescription = `Kết hợp linh thiêng Đền Hùng, làng cổ Hùng Lô nghe Hát Xoan và nghỉ dưỡng Onsen Radon phục hồi sức khỏe tại Thanh Thủy.`;
    } else if (anchor.id === "long-coc" || anchor.id === "xuan-son") {
      const pLongCoc = allPlacesPool.find((p) => p.id === "long-coc") || places[1];
      const pXuanSon = allPlacesPool.find((p) => p.id === "xuan-son") || places[2];
      chosenPlaces = [pLongCoc, pXuanSon];
      routeTheme = `Tuyến Sinh Thái Đại Ngàn & Săn Mây Ốc Đảo Chè`;
      routeDescription = `Hành trình ngắm bình minh đồi chè bát úp Long Cốc bồng bềnh trong mây và trekking rừng nguyên sinh VQG Xuân Sơn.`;
    } else if (anchor.id === "thanh-thuy") {
      const pDenHung = allPlacesPool.find((p) => p.id === "den-hung") || places[0];
      const pDaoNgoc = allPlacesPool.find((p) => p.id === "dao-ngoc-xanh") || places[7];
      chosenPlaces.push(pDenHung, pDaoNgoc);
      routeTheme = `Tuyến Nghỉ Dưỡng Onsen Khoáng Nóng & Di Sản`;
      routeDescription = `Tận hưởng tắm khoáng nóng Radon chuẩn Nhật Bản, vui chơi công viên nước và chiêm bái di sản cội nguồn.`;
    } else {
      const pDenHung = allPlacesPool.find((p) => p.id === "den-hung") || places[0];
      chosenPlaces.push(pDenHung);
      routeTheme = `Lộ Tuyến Ghép Khám Phá ${anchor.shortName}`;
      routeDescription = `Cung đường tối ưu nối liền các danh lam thắng cảnh tiêu biểu của vùng Đất Tổ.`;
    }
  } else {
    // Người dùng KHÔNG chỉ định điểm nào hoặc yêu cầu GHÉP NGẪU NHIÊN
    // Ta chọn một trong 4 LỘ TUYẾN GHÉP NGẪU NHIÊN KINH ĐIỂN CỦA ĐẤT TỔ
    const RANDOM_ROUTES = [
      {
        theme: "Lộ Tuyến Ghép 1: DI SẢN CỘI NGUỒN & NGHỈ DƯỠNG ONSEN RADON",
        desc: "Cân bằng hoàn hảo giữa hành hương cội nguồn Đền Hùng linh thiêng và tắm khoáng nóng Radon thư thái tại Thanh Thủy.",
        placeIds: ["den-hung", "hung-lo", "thanh-thuy", "dao-ngoc-xanh"],
      },
      {
        theme: "Lộ Tuyến Ghép 2: SINH THÁI ĐẠI NGÀN & SĂN MÂY ỐC ĐẢO CHÈ KỲ THÚ",
        desc: "Khám phá ốc đảo chè bát úp Long Cốc đẹp nhất Việt Nam, thám hiểm hang Lạng và đại ngàn nguyên sinh VQG Xuân Sơn.",
        placeIds: ["long-coc", "xuan-son"],
      },
      {
        theme: "Lộ Tuyến Ghép 3: TÂM LINH ĐẤT MẸ ÂU CƠ & NON NƯỚC 99 NGÁCH ĐẦM AO CHÂU",
        desc: "Về miền đất Mẹ Âu Cơ Hiền Lương, ngồi thuyền thưởng ngoạn đầm Ao Châu và thưởng thức bưởi tiến Vua Đoan Hùng.",
        placeIds: ["den-hung", "dam-ao-chau", "den-mau-au-co"],
      },
      {
        theme: "Lộ Tuyến Ghép 4: LIÊN TUYẾN ĐẤT TỔ PHÚ THỌ – PHỐ NÚI TAM ĐẢO SƯƠNG MÙ",
        desc: "Kết nối di sản cội nguồn Đất Tổ qua cầu Hạc Trì sang phố núi Tam Đảo tận hưởng khí hậu 4 mùa trong ngày.",
        placeIds: ["den-hung", "thanh-thuy", "tam-dao"],
      },
    ];

    // Chọn ngẫu nhiên 1 lộ tuyến tuyệt phẩm
    const chosenPreset = RANDOM_ROUTES[Math.floor(Math.random() * RANDOM_ROUTES.length)];
    routeTheme = chosenPreset.theme;
    routeDescription = chosenPreset.desc;
    chosenPlaces = chosenPreset.placeIds
      .map((id) => allPlacesPool.find((p) => p.id === id))
      .filter((p): p is Place => Boolean(p));
  }

  if (chosenPlaces.length === 0) {
    chosenPlaces = [places[0], places[3]]; // Fallback Đền Hùng & Thanh Thủy
  }

  // Sắp xếp thứ tự các điểm theo cự ly thực tế (Route Optimization)
  // Ưu tiên điểm gần trung tâm TP. Việt Trì hoặc vị trí người dùng trước
  chosenPlaces.sort((a, b) => a.distanceFromVietTri - b.distanceFromVietTri);

  // 4. Phân tích phương tiện & Lưu trú tối ưu theo số lượng người (N)
  let recommendedTransport = "Ô tô riêng";
  let transportReason = "";
  let transportCostEstimate = "";

  if (travelers <= 2) {
    recommendedTransport = "Ô tô riêng / Xe máy du lịch";
    transportReason = "Đoàn 1 – 2 người: Đi xe máy ngắm cảnh rất linh hoạt, hoặc đi xe ô tô 4-5 chỗ / xe khách Limousine đón trả tận nơi.";
    transportCostEstimate = "~150.000đ – 250.000đ/người (tiền xăng hoặc vé Limousine khứ hồi)";
  } else if (travelers <= 5) {
    recommendedTransport = "Ô tô riêng 5 – 7 chỗ";
    transportReason = "Đoàn 3 – 5 người (gia đình nhỏ / nhóm bạn): Rất phù hợp đi xe ô tô 5 hoặc 7 chỗ tự lái, chia sẻ chi phí xăng dầu cầu đường cực kỳ tiết kiệm.";
    transportCostEstimate = "~500.000đ – 700.000đ cả chuyến cho toàn đoàn (~120.000đ – 150.000đ/người)";
  } else if (travelers <= 8) {
    recommendedTransport = "Xe ô tô 7 chỗ lớn / Limousine 9 chỗ";
    transportReason = "Đoàn 6 – 8 người: Đi 1 xe ô tô 7 chỗ lớn hoặc thuê xe Limousine 9 chỗ có tài xế đưa đón, không gian rộng rãi và thoải mái.";
    transportCostEstimate = "~1.200.000đ – 1.600.000đ trọn gói xe cho cả đoàn";
  } else if (travelers <= 16) {
    recommendedTransport = "Thuê xe du lịch 16 chỗ (Ford Transit / Solati)";
    transportReason = `Đoàn ${travelers} người: Thuê trọn gói xe du lịch 16 chỗ có tài xế riêng, vừa an toàn, vừa gắn kết cả đoàn trong suốt hành trình.`;
    transportCostEstimate = "~1.800.000đ – 2.500.000đ trọn gói 2 ngày cho cả đoàn (~150.000đ/người)";
  } else if (travelers <= 29) {
    recommendedTransport = "Thuê xe du lịch 29 chỗ (Hyundai County / Thaco)";
    transportReason = `Đoàn ${travelers} người (cơ quan / hội nhóm): Thuê xe 29 chỗ đời mới điều hòa mát mẻ, khoang hành lý rộng rãi.`;
    transportCostEstimate = "~3.000.000đ – 3.800.000đ trọn gói 2 ngày cho cả đoàn (~130.000đ/người)";
  } else {
    recommendedTransport = "Thuê xe du lịch 45 chỗ Universe cao cấp";
    transportReason = `Đoàn ${travelers} người (đoàn thể lớn / công ty): Xe du lịch 45 chỗ Universe giảm xóc bóng hơi êm ái, bãi đỗ xe tại các danh thắng Đất Tổ đều rất rộng rãi.`;
    transportCostEstimate = "~4.500.000đ – 6.000.000đ trọn gói 2 ngày cho cả đoàn (~120.000đ/người)";
  }

  // Lưu trú đề xuất
  const numRooms = Math.ceil(travelers / 2);
  let stayAdvice = `Cần khoảng **${numRooms} phòng đôi tiêu chuẩn** (2 người/phòng).`;
  if (travelers >= 6 && chosenPlaces.some((p) => p.id === "thanh-thuy")) {
    stayAdvice += ` Hoặc có thể thuê **1 căn biệt thự Shoptel / Villa khoáng nóng nguyên căn** tại Lynn Times Thanh Thủy để cả đoàn sinh hoạt và tắm khoáng riêng tư!`;
  }

  // 5. Dự toán ngân sách chi tiết cho đoàn N người
  let baseCostPerPerson = 1350000;
  if (durationDays === 1) baseCostPerPerson = 650000;
  if (durationDays === 3) baseCostPerPerson = 2250000;

  const totalGroupCost = baseCostPerPerson * travelers;

  // 6. Xây dựng GeneratedItinerary hoàn chỉnh để hiển thị trên web
  const itinerary = buildItinerary({
    anchorPlaceId: chosenPlaces[0].id,
    selectedPlaceIds: chosenPlaces.map((p) => p.id),
    strictSelectedOnly: chosenPlaces.length >= 2,
    durationDays,
    durationNights,
    transport: recommendedTransport,
    budget: "Tiêu chuẩn",
    travelers,
    style: "Ghép tuyến tối ưu",
    userLocation: survey.userLocation,
  });

  // 7. Định dạng nội dung tin nhắn Markdown
  const stopsFormatted = chosenPlaces.map((p, idx) => `**Chặng ${idx + 1}:** ${p.name} *(${p.region})*`).join("\n• ");

  let responseText = `${greeting}Em đã phân tích địa lý và **ghép thành công Phương Án Lộ Tuyến Phù Hợp Nhất** cho đoàn mình! 🌿✨\n\n`;

  responseText += `🗺️ **${routeTheme}**\n`;
  responseText += `📌 *${routeDescription}*\n\n`;

  responseText += `📋 **TỔNG QUAN LỘ TRÌNH GHÉP:**\n`;
  responseText += `• **Thời lượng:** ${durationDays} Ngày ${durationNights > 0 ? `${durationNights} Đêm` : "(đi về trong ngày)"}\n`;
  responseText += `• **Quy mô đoàn:** **${travelers} thành viên** ${!isExplicitTravelers ? `*(Em đang tính toán mẫu cho đoàn ${travelers} người, bạn có thể đổi số người tùy ý nhé)*` : ""}\n`;
  responseText += `• **Tổng cự ly di chuyển:** Khoảng **~${itinerary.totalDistanceKm} km** (${itinerary.totalDriveTime})\n`;
  responseText += `• **Cung đường ghé thăm:**\n• ${stopsFormatted}\n\n`;

  responseText += `---\n\n`;
  responseText += `🧭 **CHI TIẾT LỘ TRÌNH TỪNG KHUNG GIỜ:**\n\n`;

  if (durationDays === 1) {
    responseText += `☀️ **Buổi sáng (07:30 – 11:30):** Khởi hành từ TP. Việt Trì đi **${chosenPlaces[0].name}**. Chiêm bái, ngắm cảnh và chụp ảnh check-in.\n`;
    responseText += `🍲 **Buổi trưa (11:30 – 13:30):** Dùng bữa trưa đặc sản vùng Đất Tổ (thịt chua Thanh Sơn, cá lăng sông Lô, gà đồi). Nghỉ ngơi thư giãn.\n`;
    if (chosenPlaces.length > 1) {
      responseText += `🌤️ **Buổi chiều (13:30 – 16:45):** Di chuyển sang **${chosenPlaces[1].name}**. Trải nghiệm văn hóa bản địa / tắm suối khoáng thư giãn.\n`;
    }
    responseText += `🌆 **Buổi tối (17:00 – 18:30):** Ghé mua đặc sản OCOP làm quà và khởi hành về lại điểm xuất phát an toàn!\n\n`;
  } else {
    responseText += `📅 **NGÀY 1: KHỞI HÀNH – ${chosenPlaces[0].shortName.toUpperCase()}${chosenPlaces.length > 1 ? ` – ${chosenPlaces[1].shortName.toUpperCase()}` : ""}:**\n`;
    responseText += `• **07:30 – 11:30:** Xuất phát từ trung tâm, tham quan & trải nghiệm **${chosenPlaces[0].name}**.\n`;
    responseText += `• **11:30 – 13:00:** Dùng bữa trưa ẩm thực địa phương (cá sông Lô om chuối đậu, gà nhiều cựa, rau sắng bản địa).\n`;
    if (chosenPlaces.length > 1) {
      responseText += `• **13:30 – 16:30:** Di chuyển đến **${chosenPlaces[1].name}**, tham quan danh thắng / tắm khoáng nóng Onsen phục hồi sinh lực.\n`;
    }
    responseText += `• **17:00 – 18:30:** Nhận phòng nghỉ ngơi (${stayAdvice}).\n`;
    responseText += `• **19:00 – 21:30:** Bữa tối tiệc đặc sản, dạo phố đêm / giao lưu lửa trại / ngắm cảnh thư thái.\n\n`;

    responseText += `📅 **NGÀY 2: ${chosenPlaces.length > 2 ? chosenPlaces[2].shortName.toUpperCase() : "CHECK-IN SÁNG"} – MUA ĐẶC SẢN OCOP – KẾT THÚC:**\n`;
    responseText += `• **07:00 – 08:30:** Thưởng thức bữa sáng đặc sản, ngắm cảnh bình minh / săn mây sớm.\n`;
    if (chosenPlaces.length > 2) {
      responseText += `• **08:30 – 11:00:** Khám phá **${chosenPlaces[2].name}**, lưu lại những bức ảnh kỷ niệm tuyệt đẹp.\n`;
    } else {
      responseText += `• **08:30 – 11:00:** Dạo chợ quê truyền thống, trải nghiệm đời sống văn hóa của bà con Đất Tổ.\n`;
    }
    responseText += `• **11:30 – 13:00:** Dùng bữa trưa và làm thủ tục trả phòng khách sạn.\n`;
    responseText += `• **13:30 – 15:30:** Dừng chân tại các điểm OCOP uy tín mua thịt chua, bưởi Đoan Hùng, chè búp, bánh tai làm quà biếu.\n`;
    responseText += `• **15:30 – 17:00:** Lên xe trở về, kết thúc chuyến đi an toàn, vui vẻ và trọn vẹn!\n\n`;
  }

  responseText += `---\n\n`;
  responseText += `👥 **PHƯƠNG ÁN TỐI ƯU CHO ĐOÀN ${travelers} NGƯỜI:**\n`;
  responseText += `🚗 **Phương tiện đề xuất:** **${recommendedTransport}**\n`;
  responseText += `   - *Lý do:* ${transportReason}\n`;
  responseText += `   - *Dự toán di chuyển:* ${transportCostEstimate}\n`;
  responseText += `🏨 **Phân bổ phòng lưu trú:** ${stayAdvice}\n\n`;

  responseText += `💰 **BẢNG DỰ TOÁN KINH PHÍ ĐOÀN (${travelers} NGƯỜI):**\n`;
  responseText += `• 🍲 Tiền ăn uống (${durationDays === 1 ? "1 bữa chính" : `${durationDays * 2 - 1} bữa chính + ăn sáng`}): ~${(baseCostPerPerson * 0.42).toLocaleString("vi-VN")}đ/người\n`;
  responseText += `• 🏨 Tiền phòng lưu trú: ${durationNights > 0 ? `~${(baseCostPerPerson * 0.32).toLocaleString("vi-VN")}đ/người` : "0đ (đi về trong ngày)"}\n`;
  responseText += `• 🎟️ Vé tham quan & tắm khoáng/dịch vụ: ~${(baseCostPerPerson * 0.15).toLocaleString("vi-VN")}đ/người\n`;
  responseText += `• 🚗 Xăng xe / chi phí đi lại: ~${(baseCostPerPerson * 0.11).toLocaleString("vi-VN")}đ/người\n`;
  responseText += `👉 **Dự toán bình quân:** **~${baseCostPerPerson.toLocaleString("vi-VN")} VNĐ / người**\n`;
  responseText += `👉 **TỔNG KINH PHÍ TRỌN GÓI TOÀN ĐOÀN (${travelers} NGƯỜI):** **~${totalGroupCost.toLocaleString("vi-VN")} VNĐ**\n\n`;

  responseText += `👉 *Em đã tải toàn bộ lịch trình chi tiết này vào hệ thống bản đồ số bên dưới. Bạn có thể bấm nút **Xem trên Trang Lịch Trình** để xem bản đồ GPS chỉ đường và thẻ chi tiết từng giờ nhé!*`;

  const options = [
    { label: "👉 Mở Toàn Bộ Lịch Trình Trên Bản Đồ GPS", value: "view_trip_now", icon: "🗺️" },
    { label: "💾 Lưu vào Lịch trình của tôi", value: "save_trip_now", icon: "⭐" },
    { label: "🔄 Đổi Tuyến Sinh Thái Long Cốc – Xuân Sơn", value: "clarify_route_long_coc", icon: "🍃" },
    { label: "🔄 Đổi Tuyến Di Sản Đền Hùng – Thanh Thủy", value: "clarify_route_hung_thuy", icon: "🏛️" },
    { label: `👥 Đổi đoàn thành 2 người`, value: "choose_family_2", icon: "👫" },
    { label: `👥 Đổi đoàn thành 6 người`, value: "choose_family_6", icon: "👨‍👩‍👧‍👦" },
    { label: `👥 Đổi đoàn thành 15 người`, value: "choose_family_15", icon: "🚐" },
  ];

  return {
    text: responseText,
    itinerary,
    options,
    updatedSurvey: {
      ...survey,
      anchorPlaceId: chosenPlaces[0].id,
      selectedPlaceIds: chosenPlaces.map((p) => p.id),
      durationDays,
      durationNights,
      travelers,
      transport: recommendedTransport,
      destinationText: routeTheme,
    },
  };
}

export function isAskingOfficialLongCocXuanSonTour(text: string): boolean {
  const norm = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ]/g, "d");

  // 1. Direct button actions
  if (
    text === "tour_long_coc" ||
    text === "clarify_route_long_coc" ||
    text === "plan_long_coc"
  ) {
    return true;
  }

  // 2. Mentions docx / file / hồ sơ thuyết minh
  const mentionsDocx =
    norm.includes("thuyet minh") ||
    norm.includes("file") ||
    norm.includes("docx") ||
    norm.includes("folder") ||
    norm.includes("forder") ||
    norm.includes("tai lieu") ||
    norm.includes("dung nhu trong file");

  // 3. Mentions both Long Cốc & Xuân Sơn
  const hasLongCoc = norm.includes("long coc");
  const hasXuanSon = norm.includes("xuan son");

  if (hasLongCoc && hasXuanSon) {
    // If explicitly asking for 2-day trip and not 1-day, let 2N1D handler process it
    const isExplicit2Days =
      (norm.includes("2 ngay") || norm.includes("2n1d") || norm.includes("2n1đ")) &&
      !norm.includes("1 ngay");
    if (isExplicit2Days) {
      return false;
    }
    // Any query asking to combine Long Coc & Xuan Son (whether 1 day, san may, viet tri, an sang, an trua, lo tuyen, etc.)
    return true;
  }

  // 4. Mentions docx with Long Coc or Xuan Son
  if ((hasLongCoc || hasXuanSon) && mentionsDocx) {
    return true;
  }

  // 5. Specific prompt indicators from the user request
  if (
    hasLongCoc &&
    (norm.includes("san may") || norm.includes("tony luan") || norm.includes("xom bong")) &&
    (norm.includes("1 ngay") || norm.includes("viet tri") || norm.includes("nghi chan"))
  ) {
    return true;
  }

  return false;
}

export function buildOfficialLongCocXuanSonResponse(
  survey: AiSurveyState,
  greeting: string
): AiResponseResult {
  const itinerary = getOfficialLongCocXuanSonItinerary("vi", survey.userLocation);

  const text =
    `${greeting}Em đã xây dựng cho bạn **Lịch trình du lịch 1 ngày chuẩn xác: TP. Việt Trì – Đồi chè Long Cốc – Vườn quốc gia Xuân Sơn** theo đúng nội dung hồ sơ **"THUYẾT MINH LONG CỐC - XUÂN SƠN"** đã có trong hệ thống! 🍃✨\n\n` +
    `Lịch trình được thiết kế khoa học, tối ưu thời gian di chuyển, ưu tiên khung giờ vàng săn mây và đón bình minh tại Long Cốc, đồng thời bố trí các điểm ăn sáng tại **Homestay Tony Luận (Xóm Bông 1)**, ăn trưa ẩm thực miền núi tại **Nhà hàng Thế Nhé 1 (Bản Dù)** và khám phá văn hóa bản địa trọn vẹn nhất.\n\n` +
    `---\n\n` +
    `📋 **LỘ TUYẾN 1 NGÀY CHUẨN XÁC: VIỆT TRÌ – LONG CỐC – VQG XUÂN SƠN**\n` +
    `*(Khởi hành: 03:00 | Kết thúc: 16:30 | Tổng cự ly: ~180 km khứ hồi | Thời gian lái xe: ~4 giờ)*\n\n` +
    `📍 **1. 03:00 – 05:00 | Chặng 1: Khởi hành từ Việt Trì**\n` +
    `• **Lộ trình:** Đoàn tập trung tại TP. Việt Trì lúc 03:00 sáng, xuất phát sớm theo tuyến Quốc lộ 32 qua ngã ba Thanh Sơn, rẽ vào ĐT316 hướng về xã Long Cốc, huyện Tân Sơn (~70 km, khoảng 1 giờ 30 phút đến 2 giờ lái xe) để kịp đón bình minh và săn biển mây bồng bềnh lúc 05:00.\n` +
    `• **Thuyết minh Trợ lý:** Trợ lý Du lịch Đất Tổ mở đầu hành trình giới thiệu khái quát về cảnh quan, con người và những giá trị văn hóa của quê hương Đất Tổ. Khởi hành sớm lúc bình minh là điều kiện tiên quyết để kịp bắt trọn thời khắc sương mai và biển mây bồng bềnh kỳ ảo.\n\n` +
    `📍 **2. 05:00 – 07:00 | Chặng 2: Tham quan Đồi chè Long Cốc (Săn mây & Đón bình minh)**\n` +
    `• **Địa điểm:** Đồi chè Long Cốc, xã Long Cốc, huyện Tân Sơn (tọa độ ngắm mây đẹp nhất tại đồi Đội 3 hoặc đồi Cầu Mới).\n` +
    `• **Trải nghiệm:** Chiêm ngưỡng "Vịnh Hạ Long trên cạn" của vùng trung du với hàng trăm quả đồi chè tròn xoe nối tiếp nhau như những chiếc bát úp khổng lồ lững lờ giữa biển mây trắng muốt khi ánh bình minh dần xuất hiện.\n` +
    `• **Thuyết minh & Lưu ý:** Tìm hiểu về sự lao động bền bỉ, vun trồng chăm sóc của đồng bào Mường qua từng mùa vụ. Quý khách tự do ngắm cảnh, chụp ảnh; chú ý giữ gìn cảnh quan, không giẫm đạp lên luống chè, không tự ý hái chè và bảo vệ vệ sinh môi trường.\n\n` +
    `📍 **3. 07:00 – 07:45 | Chặng 3: Ăn sáng tại Homestay Tony Luận**\n` +
    `• **Địa điểm:** **Homestay Tony Luận – Xóm Bông 1, xã Long Cốc**.\n` +
    `• **Trải nghiệm & Nghỉ chân:** Dừng chân nghỉ ngơi, nạp năng lượng trong không gian nhà sàn gỗ thoáng mát, mộc mạc bản Mường.\n` +
    `• **Ẩm thực gợi ý:** Bữa sáng ấm nóng với xôi ngũ sắc nếp nương dẻo thơm, măng xào thịt bản, bánh mì trứng ốp la và nhâm nhi ấm trà Shan tuyết cổ thụ Long Cốc nóng hổi có vị chát dịu thanh mát, ngọt hậu sâu lắng.\n\n` +
    `📍 **4. 07:45 – 08:30 | Chặng 4: Tiếp tục khám phá & chụp ảnh tại Long Cốc**\n` +
    `• **Trải nghiệm:** Khi ánh nắng lên cao, sắc xanh của nương chè hiện rõ nét và tươi mới. Thời điểm lý tưởng để lưu giữ những góc nhìn bao quát toàn cảnh bát úp hoặc dạo theo lối đi nương chè.\n` +
    `• **Hoạt động:** Du khách có thể thuê trang phục truyền thống rực rỡ của đồng bào Mường, Dao (30.000 – 50.000đ/bộ) để có những bộ ảnh check-in để đời.\n\n` +
    `📍 **5. 08:30 – 09:30 | Chặng 5: Di chuyển đến Vườn quốc gia Xuân Sơn**\n` +
    `• **Cự ly:** Khoảng 25 km đường liên xã nối từ Long Cốc sang VQG Xuân Sơn (thời gian di chuyển khoảng 45 – 60 phút).\n` +
    `• **Cảnh quan chuyển tiếp:** Quý khách ngắm nhìn cảnh sắc trung du và miền núi thay đổi kỳ thú: từ những đồi chè tròn mềm mại dần chuyển sang những dãy núi đá vôi sừng sững, rừng xanh nguyên sinh và bản làng miền núi.\n\n` +
    `📍 **6. 09:30 – 11:30 | Chặng 6: Tham quan Vườn quốc gia Xuân Sơn**\n` +
    `• **Giới thiệu:** VQG Xuân Sơn được thành lập theo **Quyết định số 49/2002/QĐ-TTg ngày 17/04/2002 của Thủ tướng Chính phủ** – "lá phổi xanh" có ý nghĩa bảo tồn sinh thái, đa dạng sinh học vô giá của Đất Tổ.\n` +
    `• **Trải nghiệm:** Khám phá địa hình núi đá vôi nhiệt đới, rừng nguyên sinh rợp bóng cổ thụ nghìn năm, tham quan Bảo tàng Thiên nhiên, chiêm ngưỡng suối Thác Chín Tầng và thám hiểm hệ thống hang động tự nhiên (Hang Na, Hang Lạng) với thạch nhũ muôn hình vạn trạng.\n` +
    `• **Lưu ý bảo tồn:** Đi theo tuyến đường mòn sinh thái được lát đá an toàn, tuân thủ hướng dẫn, không tự ý đi vào rừng sâu hoặc hang động khi chưa có hướng dẫn, không xả rác để gìn giữ môi trường sống tự nhiên.\n\n` +
    `📍 **7. 11:30 – 13:00 | Chặng 7: Ăn trưa tại Nhà hàng Thế Nhé 1**\n` +
    `• **Địa điểm:** **Nhà hàng Thế Nhé 1 – Khu vực Bản Dù, xã Xuân Sơn**.\n` +
    `• **Ẩm thực đặc sản đại ngàn:** Thưởng thức mâm cỗ lá phong vị miền núi phong phú:\n` +
    `  🍗 **Gà nhiều cựa (Gà chín cựa) nướng than hoa:** Thịt ngọt giòn, săn chắc trứ danh.\n` +
    `  🥓 **Thịt lợn mán nướng lá móc mật:** Thơm bùi đậm đà bản địa.\n` +
    `  🥗 **Rau dớn rừng xào tỏi / nộm rau dớn:** Đặc sản suối rừng giòn ngọt tươi non.\n` +
    `  🐟 **Cá suối chiên giòn & canh măng chua hạt dổi:** Ấm lòng thực khách.\n` +
    `• **Nghỉ ngơi:** Thư giãn bên hiên nhà sàn lộng gió, lắng nghe tiếng suối reo róc rách.\n\n` +
    `📍 **8. 13:00 – 14:30 | Chặng 8: Khám phá Bản Dù & Văn hóa bản địa**\n` +
    `• **Địa điểm:** Bản Dù, VQG Xuân Sơn.\n` +
    `• **Trải nghiệm văn hóa:** Dạo bước qua cầu treo gỗ thơ mộng vào bản làng; tìm hiểu nhịp sống bình dị gắn bó với núi rừng của đồng bào người **Dao Tiền** và người **Mường**; chiêm ngưỡng nghề dệt thổ cẩm truyền thống.\n` +
    `• **Ý nghĩa:** Chuyến đi giúp du khách hiểu rằng phát triển du lịch luôn đi đôi với bảo tồn thiên nhiên và tôn trọng văn hóa bản địa. Quý khách có thể mua mật ong rừng nguyên chất, măng đắng về làm quà.\n\n` +
    `📍 **9. 14:30 – 16:30 | Chặng 9: Khởi hành trở về Việt Trì**\n` +
    `• **Lộ trình:** Đoàn tập trung lên xe, khởi hành từ VQG Xuân Sơn theo Quốc lộ 32 qua Thanh Sơn, Tam Nông trở về trung tâm TP. Việt Trì (~85 km, 2 giờ lái xe).\n` +
    `• **Lời kết:** Trợ lý Du lịch Đất Tổ gửi lời cảm ơn và hẹn gặp lại quý khách ở những chuyến đi tiếp theo!\n\n` +
    `---\n\n` +
    `💰 **BẢNG DỰ TOÁN KINH PHÍ THAM KHẢO (1 NGÀY / NGƯỜI):**\n` +
    `• 🍲 Ăn sáng Homestay Tony Luận (xôi nếp nương, trứng, ấm trà Shan tuyết): ~40.000 – 45.000đ\n` +
    `• 🍗 Ăn trưa Nhà hàng Thế Nhé 1 (mâm cỗ gà chín cựa, lợn mán, rau dớn): ~180.000 – 200.000đ\n` +
    `• 🎟️ Vé tham quan VQG Xuân Sơn: 30.000đ/người (Đồi chè Long Cốc miễn phí vé)\n` +
    `• 📸 Thuê trang phục dân tộc check-in nương chè: ~40.000đ/bộ\n` +
    `• 🚗 Chi phí xăng xe / đi lại: ~60.000 – 80.000đ/người\n` +
    `👉 **Tổng chi phí bình quân:** **Chỉ khoảng ~350.000 – 400.000 VNĐ / người**\n\n` +
    `👉 *Em đã tải sẵn lộ tuyến này vào hệ thống bản đồ số GPS bên dưới. Bạn có thể bấm nút **Xem trên Bản Đồ GPS** để xem bản đồ lộ trình hoặc bấm phát Audio thuyết minh cho từng chặng nhé!*`;

  const options = [
    { label: "👉 Mở Toàn Bộ Lịch Trình Trên Bản Đồ GPS", value: "view_trip_now", icon: "🗺️" },
    { label: "💾 Lưu vào Lịch trình của tôi", value: "save_trip_now", icon: "⭐" },
    { label: "🎙️ Nghe Audio Thuyết Minh Long Cốc", value: "audio_long_coc", icon: "🎙️" },
    { label: "🎙️ Nghe Giọng Bạn Nữ Thuyết Minh", value: "play_sample_voice", icon: "🎧" },
    { label: "🍲 Quán ăn & Đặc sản Tân Sơn", value: "food_district-tan-son", icon: "🥢" },
  ];

  return {
    text,
    itinerary,
    options,
    updatedSurvey: {
      ...survey,
      durationDays: 1,
      durationNights: 0,
      anchorPlaceId: "doi-che-long-coc",
      destinationText: "Việt Trì – Đồi chè Long Cốc – VQG Xuân Sơn (1 Ngày)",
      district: "Xã Long Cốc",
      region: "Phú Thọ",
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

  // 0. OFFICIAL LONG COC - XUAN SON 1-DAY TOUR
  if (isAskingOfficialLongCocXuanSonTour(trimmed)) {
    return buildOfficialLongCocXuanSonResponse(survey, greeting);
  }

  // 1. GREETING & IDENTITY
  const isGreetingQuery =
    /^(?:chào|chao|xin chào|xin chao|hello|alo|hé lô|helo|chào em|chào bạn|chao em|chao ban|ad ơi|ad oi|bạn ơi|ban oi)(?:\s|$|[!.,?])/i.test(lower) ||
    /^hi(?:\s|$|[!.,?])/i.test(lower) ||
    lower === "chào" ||
    lower === "hi" ||
    lower === "hello";

  if (isGreetingQuery && !checkIsRouteCombinerIntent(lower)) {
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

  // 1.05. OFFICIAL DOCX TOUR: VIỆT TRÌ – ĐỒI CHÈ LONG CỐC – VQG XUÂN SƠN (1 NGÀY CHUẨN FILE HỒ SƠ)
  if (isAskingOfficialLongCocXuanSonTour(trimmed)) {
    return buildOfficialLongCocXuanSonResponse(survey, greeting);
  }

  // 1.1. DYNAMIC ROUTE COMBINER & RANDOM ITINERARY GENERATOR
  // Ghép lộ tuyến thông minh và đưa ra lộ tuyến phù hợp nhất khi người dùng muốn ghép các lịch trình ngẫu nhiên cho số lượng người ngẫu nhiên
  if (checkIsRouteCombinerIntent(lower)) {
    const combinedRouteResult = handleDynamicRouteCombiner(trimmed, survey, userName);
    if (combinedRouteResult) {
      return combinedRouteResult;
    }
  }

  // 1.2. SPECIFIC PLACE OR DISTRICT INFORMATION LOOKUP
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

  // 1.21. HANOI TOURISM & GATEWAY KNOWLEDGE HANDLER
  // Hà Nội là cửa ngõ giao thông huyết mạch và là điểm xuất phát chính của du khách về Đất Tổ
  const isAskingHanoi =
    /\b(hà nội|ha noi|thủ đô|thu do)\b/i.test(lower) &&
    !lower.includes("từ hà nội đi") &&
    !lower.includes("hà nội đi") &&
    !lower.includes("hà nội lên") &&
    !lower.includes("hà nội về");

  if (isAskingHanoi) {
    const isFood = /ăn gì|món gì|đặc sản|quán ăn/i.test(lower);
    if (isFood) {
      return {
        text:
          `${greeting}nếu bạn đang ở **Hà Nội** và muốn khám phá ẩm thực Thủ đô, em xin gợi ý những món ngon trứ danh không thể bỏ qua:\n\n` +
          `🍜 **1. Tinh hoa ẩm thực phố cổ Hà Nội:**\n` +
          `• **Phở Hà Nội:** Phở Thìn (Lò Đúc), Phở Bát Đàn, Phở Gia Truyền 49 Bát Đàn.\n` +
          `• **Bún chả:** Bún chả Hương Liên (bún chả Obama - Lê Văn Hưu), Bún chả Đắc Kim (Hàng Mành).\n` +
          `• **Chả cá Lã Vọng:** Chả cá Thăng Long (Đường Thành) hoặc Chả cá Lã Vọng gốc (Chả Cá).\n` +
          `• **Bún đậu mắm tôm:** Ngõ Gạch, ngõ Tràng Tiền hoặc Hàng Khay.\n` +
          `• **Cà phê trứng & Kem:** Cà phê Giảng (Nguyễn Hữu Huân), Kem Tràng Tiền, Kem Thủy Tạ Hồ Gươm.\n\n` +
          `🚗 **Gợi ý đổi gió ẩm thực cuối tuần:**\n` +
          `Từ Hà Nội chỉ mất ~1 giờ chạy xe (60-70km), bạn có thể "đổi vị" với những đặc sản Đất Tổ cực kỳ độc đáo: **Thịt chua Thanh Sơn**, **Cá lăng sông Đà**, **Cá thính Cẩm Khê**, **Bánh tai Phú Thọ** và rau ngọn su su Tam Đảo! 🌿`,
        options: [
          { label: "🍲 Gợi ý đặc sản Phú Thọ", value: "ask_foods", icon: "🥢" },
          { label: "🚗 Lịch trình Hà Nội - Đền Hùng (1 Ngày)", value: "plan_den_hung", icon: "🏛️" },
          { label: "♨️ Hà Nội - Onsen Thanh Thủy (2N1Đ)", value: "plan_thanh_thuy", icon: "💆" },
        ],
        updatedSurvey: survey,
      };
    }

    return {
      text:
        `${greeting}chào bạn! Nếu bạn đang tìm kiếm các **khu du lịch, điểm vui chơi và danh thắng nổi tiếng tại Hà Nội**, em xin gợi ý những điểm đến hấp dẫn và tiêu biểu nhất:\n\n` +
        `🏛️ **1. Di tích Lịch sử & Văn hóa trung tâm Hà Nội:**\n` +
        `• **Quần thể Hồ Gươm (Hồ Hoàn Kiếm):** Tháp Rùa, Đền Ngọc Sơn, Cầu Thê Húc, dạo bộ Phố Cổ 36 phố phường và phố đi bộ cuối tuần.\n` +
        `• **Lăng Chủ tịch Hồ Chí Minh & Chùa Một Cột:** Biểu tượng thiêng liêng của Thủ đô, viếng Lăng Bác, nhà sàn và ao cá Bác Hồ.\n` +
        `• **Văn Miếu – Quốc Tử Giám:** Trường đại học đầu tiên của Việt Nam, kiến trúc truyền thống cổ kính, tôn vinh tinh thần hiếu học.\n` +
        `• **Hoàng Thành Thăng Long & Di tích Nhà tù Hỏa Lò:** Không gian lịch sử ngàn năm văn hiến và trải nghiệm tour đêm Hỏa Lò ấn tượng.\n\n` +
        `🌿 **2. Các Khu du lịch Sinh thái & Ngoại thành Hà Nội:**\n` +
        `• **Vườn Quốc gia Ba Vì:** Đồi thông xanh mát, Nhà kính xương rồng, phế tích nhà thờ Pháp cổ, đền Thượng trên đỉnh Tản Viên (rất gần Phú Thọ qua cầu Đồng Quang).\n` +
        `• **Làng Cổ Đường Lâm (Sơn Tây):** Không gian làng quê Bắc Bộ xưa với cổng làng, cây đa, bến nước, nhà tường đá ong hàng trăm năm tuổi.\n` +
        `• **Làng Gốm Bát Tràng (Gia Lâm):** Tự tay nặn vuốt gốm sứ và check-in Bảo tàng gốm Bát Tràng xoắn ốc độc đáo.\n` +
        `• **Làng Văn hóa - Du lịch các Dân tộc Việt Nam (Đồng Mô):** Chiêm ngưỡng kiến trúc chùa Khmer, tháp Chăm và khám phá văn hóa 54 dân tộc.\n` +
        `• **Khu du lịch Thiên Đường Bảo Sơn:** Công viên giải trí phức hợp với thủy cung, công viên nước, nông trại vui vẻ.\n\n` +
        `🚗 **Gợi ý kết nối tour du lịch Đất Tổ từ Hà Nội:**\n` +
        `Hà Nội là cửa ngõ kết nối giao thông huyết mạch, chỉ cách **Phú Thọ khoảng 60 - 80 km** (~1 giờ chạy xe êm thuận theo Đại lộ Thăng Long hoặc Cao tốc Nội Bài - Lào Cai). Rất nhiều gia đình và bạn trẻ Hà Nội thường chọn lịch trình 1 - 2 ngày cuối tuần kết hợp:\n` +
        `• **Tuyến nghỉ dưỡng:** Hà Nội ➔ Dâng hương Đền Hùng ➔ Nghỉ dưỡng khoáng nóng Onsen Thanh Thủy (Lynn Times / Wyndham).\n` +
        `• **Tuyến thiên nhiên & săn mây:** Hà Nội ➔ Đồi chè Long Cốc ➔ Vườn Quốc gia Xuân Sơn.\n` +
        `• **Tuyến phố núi:** Hà Nội ➔ Tam Đảo & Thiền Viện Trúc Lâm Tây Thiên.`,
      options: [
        { label: "🚗 Lịch trình Hà Nội - Đền Hùng (1 Ngày)", value: "plan_den_hung", icon: "🏛️" },
        { label: "♨️ Hà Nội - Onsen Thanh Thủy (2N1Đ)", value: "plan_thanh_thuy", icon: "💆" },
        { label: "🍃 Hà Nội - Đồi chè Long Cốc (2N1Đ)", value: "plan_long_coc", icon: "📸" },
        { label: "🌫️ Hà Nội - Tam Đảo phố núi (2N1Đ)", value: "plan_tam_dao", icon: "📍" },
      ],
      updatedSurvey: survey,
    };
  }

  // 1.22. OUT-OF-PROVINCE DESTINATIONS QUERY (Đà Nẵng, Nha Trang, Phú Quốc, Sa Pa, Đà Lạt, Sài Gòn...)
  const OTHER_PROVINCES: Record<string, { label: string; highlight: string; analogPhuTho: string; optionValue: string; optionLabel: string }> = {
    "da nang": { label: "Đà Nẵng", highlight: "Bà Nà Hills, Bán đảo Sơn Trà, Cầu Rồng và biển Mỹ Khê", analogPhuTho: "Nếu thích trải nghiệm trên cao mây phủ như Bà Nà, bạn rất nên khám phá **Đỉnh mây Tam Đảo** hoặc **Đồi chè Long Cốc**!", optionValue: "plan_tam_dao", optionLabel: "🌫️ Lên tour Tam Đảo săn mây" },
    "phu quoc": { label: "Phú Quốc", highlight: "Bãi Sao, Hòn Thơm, Grand World và hải sản đảo ngọc", analogPhuTho: "Nếu yêu thích không gian sông nước sinh thái và vui chơi công viên nước, mời bạn trải nghiệm **KDL Đảo Ngọc Xanh** hoặc **Hồ Thung Nai - Vịnh Hạ Long trên núi**!", optionValue: "plan_dao_ngoc_xanh", optionLabel: "🏝️ Khám phá KDL Đảo Ngọc Xanh" },
    "nha trang": { label: "Nha Trang", highlight: "VinWonders, Tháp Bà Ponagar, tắm bùn khoáng và vịnh biển", analogPhuTho: "Nếu muốn tận hưởng ngâm tắm khoáng nóng và thư giãn spa chữa lành, **Suối khoáng nóng Radon Thanh Thủy** (Phú Thọ) hay **Khoáng nóng Kim Bôi** chính là thiên đường nghỉ dưỡng ngay gần bạn!", optionValue: "plan_thanh_thuy", optionLabel: "♨️ Tắm khoáng nóng Thanh Thủy" },
    "sapa": { label: "Sa Pa", highlight: "Đỉnh Fansipan, thung lũng Mường Hoa, đèo Ô Quy Hồ", analogPhuTho: "Nếu muốn săn mây kỳ vĩ và ngắm những cung đường đồi núi Tây Bắc thơ mộng, tuyệt tác **Đồi chè Long Cốc** và **Vườn quốc gia Xuân Sơn** sẽ mang lại cho bạn những bức ảnh cực phẩm!", optionValue: "plan_long_coc", optionLabel: "🍃 Săn mây Đồi chè Long Cốc" },
    "da lat": { label: "Đà Lạt", highlight: "Hồ Xuân Hương, Thung Lũng Tình Yêu, đồi chè Cầu Đất, cà phê mây", analogPhuTho: "Không gian mát lạnh quanh năm của **Tam Đảo** và đồi chè bát úp mờ ảo **Long Cốc** có nét thơ mộng rất tương đồng với Đà Lạt thu nhỏ của miền Bắc!", optionValue: "plan_tam_dao", optionLabel: "🌫️ Khám phá phố núi Tam Đảo" },
    "ninh binh": { label: "Ninh Bình", highlight: "Tràng An, Tam Cốc - Bích Động, Cố đô Hoa Lư, Chùa Bái Đính", analogPhuTho: "Để chiêm bái các ngôi chùa cổ tự và tìm về cội nguồn dân tộc, **Quần thể di tích lịch sử Đền Hùng** và **Thiền viện Trúc Lâm Tây Thiên** là điểm đến tâm linh số 1!", optionValue: "plan_den_hung", optionLabel: "🏛️ Chiêm bái Đền Hùng" },
    "ha long": { label: "Hạ Long", highlight: "Vịnh Hạ Long, du thuyền, hang Sửng Sốt, Sun World Bãi Cháy", analogPhuTho: "Bạn có thể trải nghiệm **Lòng hồ Thung Nai – Sông Đà**, nơi được mệnh danh là 'Vịnh Hạ Long trên núi' với hàng trăm đảo đá vôi nhấp nhô tuyệt đẹp!", optionValue: "plan_thung_nai", optionLabel: "⛵ Du ngoạn Hồ Thung Nai - Sông Đà" },
    "sai gon": { label: "Sài Gòn (TP.HCM)", highlight: "Nhà thờ Đức Bà, Dinh Độc Lập, Chợ Bến Thành, Landmark 81", analogPhuTho: "Nếu bạn có chuyến công tác hoặc du lịch ra miền Bắc, hãy dành 1-2 ngày về thăm **Đất Tổ Phú Thọ** để dâng hương tưởng nhớ các Vua Hùng!", optionValue: "plan_den_hung", optionLabel: "🏛️ Lịch trình Đền Hùng 1 ngày" },
    "tp hcm": { label: "TP. Hồ Chí Minh", highlight: "Nhà thờ Đức Bà, Dinh Độc Lập, Chợ Bến Thành, Landmark 81", analogPhuTho: "Nếu bạn có chuyến công tác hoặc du lịch ra miền Bắc, hãy dành 1-2 ngày về thăm **Đất Tổ Phú Thọ** để dâng hương tưởng nhớ các Vua Hùng!", optionValue: "plan_den_hung", optionLabel: "🏛️ Lịch trình Đền Hùng 1 ngày" },
    "hue": { label: "Huế", highlight: "Đại Nội, lăng tẩm các vua Nguyễn, chùa Thiên Mụ, sông Hương", analogPhuTho: "Về du lịch di sản và cội nguồn lịch sử, **Khu di tích lịch sử Quốc gia đặc biệt Đền Hùng** chính là không gian linh thiêng bậc nhất của người con đất Việt!", optionValue: "plan_den_hung", optionLabel: "🏛️ Hành hương về Đền Hùng" },
    "hoi an": { label: "Hội An", highlight: "Phố cổ Hội An, Chùa Cầu, thả hoa đăng sông Hoài, làng gốm Thanh Hà", analogPhuTho: "Nếu yêu thích nét cổ kính, bạn có thể ghé thăm **Làng cổ Hùng Lô** với đình cổ hơn 300 năm nghe Hát Xoan hoặc **Làng gốm cổ Hương Canh**!", optionValue: "plan_hung_lo", optionLabel: "🏮 Thăm Làng cổ & Đình Hùng Lô" },
  };

  const normForProvince = lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ]/g, "d");

  const matchedProvKey = Object.keys(OTHER_PROVINCES).find((k) => normForProvince.includes(k));
  if (matchedProvKey) {
    const prov = OTHER_PROVINCES[matchedProvKey];
    return {
      text:
        `${greeting}Dạ, em là **Trợ lý Du lịch Đất Tổ**, chuyên gia tư vấn chuyên sâu về các danh lam thắng cảnh, văn hóa cội nguồn của **Phú Thọ và 2 tuyến liên kết (Tam Đảo - Vĩnh Phúc & Mai Châu, Kim Bôi - Hòa Bình)**.\n\n` +
        `Về điểm đến **${prov.label}**, đây là một nơi du lịch rất nổi tiếng với các điểm nhấn như: ${prov.highlight}.\n\n` +
        `💡 ${prov.analogPhuTho}\n\n` +
        `Bạn có muốn em tư vấn lịch trình hoặc gợi ý điểm đến tương ứng tại miền Đất Tổ & vùng lân cận không ạ? 🌿`,
      options: [
        { label: prov.optionLabel, value: prov.optionValue, icon: "✨" },
        { label: "🏛️ Khám phá Đền Hùng", value: "plan_den_hung", icon: "🏛️" },
        { label: "♨️ Khoáng nóng Thanh Thủy", value: "plan_thanh_thuy", icon: "💆" },
        { label: "🍃 Đồi chè Long Cốc", value: "plan_long_coc", icon: "📸" },
      ],
      updatedSurvey: survey,
    };
  }

  // 1.25. INTERACTIVE CLARIFICATION DIALOG:
  // Khi người dùng hỏi tư vấn lịch trình/tour nhưng câu hỏi chưa rõ (thiếu số người, phương tiện, mức giá...)
  // AI sẽ chủ động hỏi lại lịch sự và cung cấp các nút bấm 1 chạm để cá nhân hoá lịch trình chuẩn xác nhất.
  const isTripConsultation =
    /tư vấn|tu van|lịch trình|lich trinh|kế hoạch|ke hoach|gợi ý|goi y|tour|đi đâu|di dau|đi chơi|di choi|phương án|phuong an|muốn đi|muon di|sắp đi|sap di|tổ chức|to chuc/i.test(lower) ||
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

  // 6. HOTELS, RESORTS & HOMESTAYS (Tích hợp Danh bạ 1.508 CSLT Phú Thọ, Vĩnh Phúc & Hòa Bình)
  if (
    lower.includes("nghỉ ở đâu") ||
    lower.includes("khách sạn") ||
    lower.includes("resort") ||
    lower.includes("homestay") ||
    lower.includes("chỗ ở") ||
    lower.includes("thuê phòng") ||
    lower.includes("nghỉ đêm") ||
    lower.includes("cslt") ||
    lower.includes("nhà nghỉ")
  ) {
    // Check if user specified a district or province
    const matchedDistrict = Object.values(DISTRICT_DATABASE).find((d) =>
      lower.includes(d.id) ||
      lower.includes(d.name.toLowerCase()) ||
      lower.includes(d.oldName.toLowerCase()) ||
      d.keywords.some((kw) => lower.includes(kw.toLowerCase()))
    );

    if (matchedDistrict) {
      const topStays = ACCOMMODATIONS_DATABASE
        .filter((it) => it.districtId === matchedDistrict.id)
        .sort((a, b) => b.stars - a.stars || (b.rooms || 0) - (a.rooms || 0))
        .slice(0, 5);
      let distText = `${greeting}Dưới đây là **Các cơ sở lưu trú hàng đầu tại ${matchedDistrict.name} (${matchedDistrict.province})** trích xuất từ Danh bạ chính thức:\n\n`;
      if (topStays.length > 0) {
        topStays.forEach((s, idx) => {
          distText += `🏨 **${idx + 1}. ${s.name}** ${s.stars > 0 ? `(★ ${s.rating})` : `(${s.type})`}\n`;
          distText += `• 📍 Địa chỉ: ${s.address}\n`;
          if (s.rooms) distText += `• 🛏️ Quy mô: ${s.rooms} phòng${s.beds ? ` · ${s.beds} giường` : ""}\n`;
          if (s.phone) distText += `• 📞 Hotline đặt phòng: ${s.phone}\n`;
          if (s.priceEstimate) distText += `• 💰 Giá tham khảo: ~${s.priceEstimate}\n`;
          distText += `\n`;
        });
      } else if (matchedDistrict.recommendedStay) {
        distText += `• Gợi ý: ${matchedDistrict.recommendedStay}\n\n`;
      }
      distText += `💡 *Quý khách có thể mở tab "Lịch trình" > "Danh bạ 1.508 Cơ sở lưu trú" hoặc mở mục "Đặt phòng" trên thanh công cụ để tra cứu chi tiết và gửi yêu cầu đặt phòng trực tiếp!*`;
      return {
        text: distText,
        options: [
          { label: `🏨 Xem lưu trú ${matchedDistrict.name}`, value: `stays_${matchedDistrict.id}`, icon: "🏨" },
          { label: `🗺️ Lên lịch trình ${matchedDistrict.name}`, value: matchedDistrict.comboActionValue, icon: "⭐" },
          { label: "📋 Danh bạ 1.508 CSLT toàn vùng", value: "directory_stays", icon: "📋" },
        ],
        updatedSurvey: survey,
      };
    }

    return {
      text:
        `${greeting}Hệ thống du lịch Đất Tổ tích hợp **Danh bạ chính thức 1.508 cơ sở lưu trú** (Khách sạn 1-5 sao, Resort khoáng nóng, Homestay bản địa & Nhà nghỉ) trên 3 tỉnh Phú Thọ, Vĩnh Phúc và Hòa Bình:\n\n` +
        `♨️ **1. Tỉnh Phú Thọ (387 cơ sở lưu trú):**\n` +
        `• **Khoáng nóng Thanh Thủy:** Wyndham Lynn Times Thanh Thủy (5 sao), Vườn Vua Resort & Villas (5 sao), Tre Nguồn, BamBoo Resort.\n` +
        `• **TP. Việt Trì:** Khách sạn Mường Thanh Luxury Phú Thọ (5 sao), Sài Gòn - Phú Thọ (4 sao), TRU By Hilton, SOJO Hotel Việt Trì.\n` +
        `• **Đồi chè Long Cốc & VQG Xuân Sơn:** Homestay Tony Luận, Long Cốc Ecolodge, Homestay Bản Dù, Homestay Quỳnh Nga.\n\n` +
        `⛰️ **2. Tỉnh Vĩnh Phúc (559 cơ sở lưu trú):**\n` +
        `• **Tam Đảo:** Venus Hotel Tam Đảo (4 sao), Khách sạn Century (3 sao), Tam Đảo Gold Hotel (3 sao), Thế Giới Xanh (2 sao).\n` +
        `• **Vĩnh Yên & Phúc Yên:** Westlake Hotel & Resort (5 sao), DIC Star (5 sao), Crowne Plaza Vĩnh Yên (5 sao), Flamingo Đại Lải Resort (5 sao), FLC Vĩnh Thịnh (5 sao).\n\n` +
        `🌿 **3. Tỉnh Hòa Bình (562 cơ sở lưu trú):**\n` +
        `• **Mai Châu:** Mai Châu Ecolodge (4 sao), Ba Khan Village Resort, Mai Châu Hideaway, Homestay Bản Lác 1 & 2.\n` +
        `• **Kim Bôi & Lương Sơn:** Serena Resort Kim Bôi (4 sao), V-Resort Mường Động, Ivory Villas & Resort Lương Sơn, La Saveur De Hòa Bình.\n` +
        `• **Thung Nai & TP. Hòa Bình:** Cối Xay Gió Thung Nai, SOJO Hotel Hòa Bình, Khách sạn Sakura, Grand Hotel.\n\n` +
        `👉 *Quý khách có thể nhấn nút "Đặt phòng" ở góc phải màn hình hoặc mở tab "Lịch trình" > "Danh bạ 1.508 Cơ sở lưu trú" để tra cứu địa chỉ mới & cũ, lọc theo hạng sao và đặt phòng ngay.*`,
      options: [
        { label: "📋 Mở Danh bạ 1.508 Cơ sở lưu trú", value: "directory_stays", icon: "🏨" },
        { label: "♨️ Tour khoáng nóng Thanh Thủy 2N1Đ", value: "tour_2n1d", icon: "⭐" },
        { label: "🍃 Tour Homestay Long Cốc – Xuân Sơn", value: "tour_long_coc", icon: "🍃" },
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
