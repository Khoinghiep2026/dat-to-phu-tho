import { places, type NearbyItem, type Place } from "@/data/travel";
import { DISTRICT_DATABASE, type DistrictInfo, findDistrictByQuery } from "@/data/districtDirectory";
import {
  getAllPlacesForDistrict,
  getAllDistrictPlaces,
  getDistrictTravelGuide,
} from "./districtPlaceGenerator";
import { TOUR_AUDIO_GUIDES } from "@/data/tourAudioGuides";

export type ItinerarySlot = {
  period: "Sáng" | "Trưa" | "Chiều" | "Tối";
  timeSlot: string;
  title: string;
  type: "visit" | "meal" | "stay" | "travel";
  image?: string;
  place?: Place;
  restaurant?: NearbyItem;
  stay?: NearbyItem;
  activity: string;
  transportAdvice: string;
  travelMinutes: number;
  highlightNote: string;
  estimatedCostPerPerson: number;
  audioScript?: string;
  audioScriptEn?: string;
  isAutoSuggested?: boolean;
  audioUrl?: string;
  audioDuration?: string;
  stopIndex?: number;
};

export type ItineraryDay = {
  dayNumber: number;
  dateLabel: string;
  dayTitle: string;
  daySummary: string;
  slots: ItinerarySlot[];
  dayDistanceKm: number;
  stayForNight?: NearbyItem;
};

export type GeneratedItinerary = {
  id: string;
  title: string;
  subtitle: string;
  targetDestination: string;
  region: string;
  durationDays: number;
  durationLabel: string;
  transport: string;
  style: string;
  travelers: number;
  totalDistanceKm: number;
  totalDriveTime: string;
  estimatedCostPerPerson: number;
  totalCost: number;
  overviewNarrative: string;
  audioGuideScript: string;
  audioGuideScriptEn: string;
  routeAdvice: string;
  cautionAdvice: string;
  days: ItineraryDay[];
  googleMapsUrl: string;
  originName?: string;
  originCoords?: { lat: number; lng: number };
};

export type DistrictGuide = {
  district: string;
  region: string;
  distanceFromHanoi: string;
  travelTime: string;
  recommendedTransport: string;
  bestRoutes: string;
  highlights: string[];
  signatureFoods: string[];
};

export const DISTRICT_TRAVEL_GUIDES: Record<string, DistrictGuide> = {
  "TP. Việt Trì": {
    district: "TP. Việt Trì",
    region: "Phú Thọ",
    distanceFromHanoi: "70 km",
    travelTime: "60 phút",
    recommendedTransport: "Ô tô riêng / Xe khách Mỹ Đình / Tàu hỏa",
    bestRoutes: "Từ Hà Nội theo cao tốc Nội Bài - Lào Cai (rẽ nút giao IC7) hoặc theo trục Quốc lộ 2 qua cầu Vĩnh Thịnh/Hạc Trì.",
    highlights: ["Khu di tích lịch sử Đền Hùng", "Làng cổ & Đình cổ Hùng Lô (hát Xoan)", "Cầu đi bộ Công viên Văn Lang"],
    signatureFoods: ["Cá lăng sông Lô om chuối đậu", "Bánh tai Gia Cẩm", "Thịt chua Thanh Sơn"],
  },
  "Xã Thanh Sơn": {
    district: "Xã Thanh Sơn",
    region: "Phú Thọ",
    distanceFromHanoi: "95 km (55 km từ Việt Trì)",
    travelTime: "1 giờ 45 phút",
    recommendedTransport: "Ô tô riêng / Xe máy du lịch / Xe khách tuyến Hà Nội - Thanh Sơn",
    bestRoutes: "Từ Hà Nội theo Quốc lộ 32 qua Cầu Trung Hà -> Thanh Sơn. Tuyến đường huyết mạch kết nối trực tiếp với Đồi chè Long Cốc, Vườn QG Xuân Sơn và Khoáng nóng Thanh Thủy.",
    highlights: ["Thủ phủ Thịt chua truyền thống trứ danh (Nghị Thịnh / Điệp Đào)", "Khám phá văn hóa bản Mường & Thác Chòi", "Cửa ngõ kết nối Đồi chè Long Cốc và Vườn quốc gia Xuân Sơn"],
    signatureFoods: ["Thịt chua Thanh Sơn gói lá chuối kèm lá sung, ổi, đinh lăng", "Rêu đá xào tỏi Mường", "Cơm lam cá suối nướng than hoa"],
  },
  "Xã Long Cốc": {
    district: "Xã Long Cốc",
    region: "Phú Thọ",
    distanceFromHanoi: "115 km (80 km từ Việt Trì)",
    travelTime: "2 giờ 15 phút",
    recommendedTransport: "Ô tô gầm cao / Xe máy phượt ngắm cảnh",
    bestRoutes: "Từ Việt Trì hoặc Hà Nội đi theo QL32 qua Thanh Sơn, rẽ ĐT316 vào Tân Sơn. Đường nhựa đồi núi uốn lượn phong cảnh hữu tình.",
    highlights: ["Đồi chè Long Cốc (ốc đảo chè đẹp nhất Việt Nam)", "Vườn quốc gia Xuân Sơn (rừng nguyên sinh, hang Lạng)"],
    signatureFoods: ["Gà nhiều cựa Xuân Sơn nướng than", "Lợn lửng xào lăn hạt dổi", "Rau sắng rừng & Xôi ngũ sắc"],
  },
  "Xã Thanh Thủy": {
    district: "Xã Thanh Thủy",
    region: "Phú Thọ",
    distanceFromHanoi: "65 km (40 km từ Việt Trì)",
    travelTime: "1 giờ 15 phút",
    recommendedTransport: "Ô tô riêng / Xe Limousine đón trả tận nơi",
    bestRoutes: "Từ Hà Nội theo Đại lộ Thăng Long qua cầu Đồng Quang hoặc cầu Trung Hà, rẽ ĐT317 chạy thẳng vào trung tâm khoáng nóng.",
    highlights: ["Quần thể nghỉ dưỡng suối khoáng nóng Radon", "Đền Lăng Sương", "Đảo Ngọc Xanh"],
    signatureFoods: ["Cá ngạnh sông Đà nướng riềng mẻ", "Gà đồi Thanh Thủy hấp lá chanh", "Tắm Onsen thư giãn"],
  },
  "Xã Hạ Hòa": {
    district: "Xã Hạ Hòa",
    region: "Phú Thọ",
    distanceFromHanoi: "120 km (65 km từ Việt Trì)",
    travelTime: "1 giờ 20 phút",
    recommendedTransport: "Ô tô riêng / Xe khách cao tốc",
    bestRoutes: "Từ Hà Nội đi thẳng cao tốc Nội Bài - Lào Cai, rẽ nút giao IC10 (Hạ Hòa), chỉ 10 phút sau là tới Đền Mẫu và Đầm Ao Châu.",
    highlights: ["Đền Mẫu Âu Cơ (cội nguồn Mẹ Đất Việt)", "Khu du lịch sinh thái Đầm Ao Châu (99 ngách nước non)"],
    signatureFoods: ["Trám đen kho thịt", "Chuối phấn Hạ Hòa", "Cá đầm Ao Châu nướng giòn"],
  },
  "Xã Tam Đảo": {
    district: "Xã Tam Đảo",
    region: "Vĩnh Phúc",
    distanceFromHanoi: "75 km",
    travelTime: "1 giờ 30 phút",
    recommendedTransport: "Ô tô riêng / Limousine khứ hồi / Xe máy (cần tay lái vững)",
    bestRoutes: "Từ Hà Nội theo cao tốc Nội Bài - Lào Cai rẽ nút giao IC4 -> đường QL2B lên Tam Đảo (đoạn đèo dốc 13km trải nhựa êm, có rào chắn bảo vệ).",
    highlights: ["Khu du lịch sương mù Tam Đảo (khí hậu 4 mùa)", "Quần thể Di tích & Danh thắng Tây Thiên (cáp treo, Thiền viện)"],
    signatureFoods: ["Ngọn su su xào tỏi giòn ngọt", "Gà đồi bọc đất sét nướng than", "Lợn mán gác bếp"],
  },
  "TP. Phúc Yên": {
    district: "TP. Phúc Yên",
    region: "Vĩnh Phúc",
    distanceFromHanoi: "45 km (cách sân bay Nội Bài 15km)",
    travelTime: "45 phút",
    recommendedTransport: "Ô tô riêng / Taxi sân bay / Xe buýt",
    bestRoutes: "Từ Hà Nội qua Cầu Nhật Tân -> đường Võ Nguyên Giáp -> QL2 hoặc ĐT301 chạy thẳng vào khu vực Hồ Đại Lải.",
    highlights: ["Hồ Đại Lải thơ mộng", "Flamingo Đại Lải Resort & Bảo tàng nghệ thuật trong rừng", "Đảo Ngọc"],
    signatureFoods: ["Thịt trâu nhúng mẻ / xào rau muống", "Cá hồ Đại Lải nướng", "Thịt lợn quay giòn"],
  },
  "TP. Vĩnh Yên": {
    district: "TP. Vĩnh Yên",
    region: "Vĩnh Phúc",
    distanceFromHanoi: "55 km",
    travelTime: "50 phút",
    recommendedTransport: "Ô tô riêng / Tàu hỏa / Xe buýt liên tỉnh",
    bestRoutes: "Theo cao tốc Nội Bài - Lào Cai rẽ IC3 hoặc đi đường Quốc lộ 2 qua cầu Thăng Long.",
    highlights: ["Chùa Hà Tiên linh thiêng", "Đầm Vạc", "Quảng trường Hồ Chí Minh"],
    signatureFoods: ["Tép dầu Đầm Vạc chiên giòn", "Chè kho Tứ Yên", "Gỏi cá mè Vĩnh Yên"],
  },
  "Xã Bình Nguyên": {
    district: "Xã Bình Nguyên",
    region: "Vĩnh Phúc",
    distanceFromHanoi: "50 km (kề cận Vĩnh Yên)",
    travelTime: "45 phút",
    recommendedTransport: "Ô tô riêng / Xe buýt",
    bestRoutes: "Chạy dọc Quốc lộ 2 hoặc nút giao cao tốc Bình Xuyên.",
    highlights: ["Làng gốm sành cổ Hương Canh 300 năm di sản", "Tháp gốm Bình Sơn"],
    signatureFoods: ["Bánh hòn Hương Canh", "Cháo se Hương Canh"],
  },
  "Xã Mai Châu": {
    district: "Xã Mai Châu",
    region: "Hòa Bình",
    distanceFromHanoi: "135 km",
    travelTime: "3 giờ 30 phút",
    recommendedTransport: "Ô tô riêng / Limousine đón tận homestay / Xe máy phượt",
    bestRoutes: "Từ Hà Nội theo Đại lộ Thăng Long -> Cao tốc Hòa Lạc - Hòa Bình -> Quốc lộ 6 vượt Đèo Thung Khe (Đèo Đá Trắng) xuống thung lũng Mai Châu.",
    highlights: ["Bản Lác & Thung lũng Mai Châu thơ mộng", "Điểm săn mây & Chợ phiên Pà Cò", "Đèo Đá Trắng Thung Khe"],
    signatureFoods: ["Cơm lam nếp nương nướng than", "Thịt lợn mán hạt dổi xứ Mường", "Cá suối chiên giòn & Rượu cần"],
  },
  "Xã Bo": {
    district: "Xã Bo",
    region: "Hòa Bình",
    distanceFromHanoi: "75 km",
    travelTime: "1 giờ 45 phút",
    recommendedTransport: "Ô tô riêng / Xe Limousine / Xe khách",
    bestRoutes: "Từ Hà Nội theo QL6 qua xã Xuân Mai tới ngã ba Bãi Chạo (Lương Sơn), rẽ vào đường ATK Bãi Chạo chạy thẳng vào thung lũng khoáng nóng.",
    highlights: ["Suối khoáng nóng tự nhiên Kim Bôi (36°C giàu khoáng chất)", "Serena Resort Kim Bôi"],
    signatureFoods: ["Gà đồi nướng mọi", "Măng đắng xào thịt bò", "Rau rừng đồ chấm lòng cá"],
  },
  "Xã Thung Nai": {
    district: "Xã Thung Nai",
    region: "Hòa Bình",
    distanceFromHanoi: "88 km",
    travelTime: "2 giờ",
    recommendedTransport: "Ô tô riêng / Xe du lịch",
    bestRoutes: "Từ Hà Nội đi cao tốc Hòa Lạc - Hòa Bình, qua TP. Hòa Bình theo QL6 chừng 12km tới xã Cao Phong, rẽ vào bến cảng Thung Nai.",
    highlights: ["Lòng hồ sông Đà Thung Nai (du thuyền Vịnh Hạ Long trên núi)", "Đền Bà Chúa Thác Bờ linh thiêng"],
    signatureFoods: ["Cá lăng sông Đà nướng than lá chuối", "Cam Cao Phong lòng vàng", "Gà thả đồi nướng"],
  },
  "TP. Hòa Bình": {
    district: "TP. Hòa Bình",
    region: "Hòa Bình",
    distanceFromHanoi: "75 km",
    travelTime: "1 giờ 15 phút",
    recommendedTransport: "Ô tô riêng / Xe khách Mỹ Đình/Yên Nghĩa",
    bestRoutes: "Đi thẳng Đại lộ Thăng Long kết nối cao tốc Hòa Lạc - Hòa Bình (CT08), đường rộng 4 làn xe chạy rất nhanh và êm ái.",
    highlights: ["Nhà máy Thủy điện Hòa Bình kỳ vĩ", "Bảo tàng Không gian Văn hóa Mường", "Tượng đài Bác Hồ núi Ông Tượng"],
    signatureFoods: ["Cỗ lá Mường truyền thống", "Chả cuốn lá bưởi thơm lừng", "Cá chiên sông Đà"],
  },
};

export type UserLocation = {
  lat: number;
  lng: number;
  label?: string;
};

export type PlannerOptions = {
  anchorPlaceId?: string;
  selectedPlaceIds?: string[];
  strictSelectedOnly?: boolean;
  district?: string;
  region?: string;
  durationDays: number;
  durationNights?: number;
  transport: string;
  budget: string;
  customBudgetTotal?: number;
  customBudgetPerPerson?: number;
  style: string;
  travelers: number;
  lang?: string;
  userLocation?: UserLocation;
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildItinerary(options: PlannerOptions): GeneratedItinerary {
  const {
    anchorPlaceId,
    selectedPlaceIds = [],
    strictSelectedOnly = false,
    district,
    region,
    durationDays = 2,
    durationNights,
    transport = "Ô tô riêng",
    budget = "Tiêu chuẩn",
    customBudgetTotal,
    customBudgetPerPerson,
    style = "Văn hóa & cội nguồn",
    travelers = 2,
    lang = "vi",
    userLocation,
  } = options;

  // Master place pool combining handcrafted places and all 32 districts' spots
  const allAvailablePlaces: Place[] = [...places, ...getAllDistrictPlaces()];

  // Detect target district if specified by district name or district-based anchor
  let targetDistrictInfo: DistrictInfo | undefined;
  if (district && district !== "Tất cả") {
    targetDistrictInfo = findDistrictByQuery(district);
  }
  if (!targetDistrictInfo && anchorPlaceId) {
    const cleanId = anchorPlaceId.replace(/^district-/, "").split("-spot-")[0];
    targetDistrictInfo = DISTRICT_DATABASE[cleanId] || findDistrictByQuery(anchorPlaceId);
  }
  if (!targetDistrictInfo && selectedPlaceIds.length > 0) {
    for (const pid of selectedPlaceIds) {
      const cleanId = pid.replace(/^district-/, "").split("-spot-")[0];
      if (DISTRICT_DATABASE[cleanId]) {
        targetDistrictInfo = DISTRICT_DATABASE[cleanId];
        break;
      }
    }
  }

  // 1. Xác định danh sách các điểm được người dùng ưu tiên ghép
  const userChosenPlaces: Place[] = [];
  const chosenPlaceIdSet = new Set<string>();
  if (selectedPlaceIds.length > 0) {
    for (const pid of selectedPlaceIds) {
      const found = allAvailablePlaces.find((p) => p.id === pid);
      if (found && !chosenPlaceIdSet.has(found.id)) {
        userChosenPlaces.push(found);
        chosenPlaceIdSet.add(found.id);
      }
    }
  }

  // Nếu không chọn mảng điểm, tìm điểm neo khởi đầu
  let anchor: Place;
  if (userChosenPlaces.length > 0) {
    anchor = userChosenPlaces[0];
  } else if (targetDistrictInfo) {
    const distPlaces = getAllPlacesForDistrict(targetDistrictInfo.id);
    anchor = distPlaces[0] || allAvailablePlaces.find((p) => p.id === anchorPlaceId) || places[0];
  } else if (anchorPlaceId) {
    anchor = allAvailablePlaces.find((p) => p.id === anchorPlaceId) || places[0];
  } else if (district) {
    anchor = allAvailablePlaces.find((p) => p.district === district) || places[0];
  } else if (region && region !== "Tất cả") {
    anchor = allAvailablePlaces.find((p) => p.region === region) || places[0];
  } else {
    anchor = places[0]; // Default Đền Hùng
  }

  // 2. Gom cụm các điểm đến phù hợp theo cự ly và chủ đề
  const autoSuggestedIds = new Set<string>();
  const chosenPlaces: Place[] = [...userChosenPlaces];

  if (!chosenPlaces.some((p) => p.id === anchor.id)) {
    chosenPlaces.unshift(anchor);
  }

  // CHỈ TỰ ĐỘNG BỔ SUNG ĐIỂM NẾU NGƯỜI DÙNG KHÔNG BẬT "strictSelectedOnly"
  if (!strictSelectedOnly) {
    const neededStops = Math.max(durationDays * 2, userChosenPlaces.length);

    // Nếu người dùng chọn huyện cụ thể, ưu tiên đưa các điểm tham quan thực tế của huyện đó vào
    if (targetDistrictInfo && chosenPlaces.length < neededStops) {
      const distPlaces = getAllPlacesForDistrict(targetDistrictInfo.id);
      for (const dp of distPlaces) {
        if (chosenPlaces.length >= neededStops) break;
        if (!chosenPlaces.some((p) => p.id === dp.id)) {
          chosenPlaces.push(dp);
          if (!chosenPlaceIdSet.has(dp.id)) {
            autoSuggestedIds.add(dp.id);
          }
        }
      }
    }

    // Nếu vẫn chưa đủ điểm cho số ngày, tự động bổ sung các điểm lân cận
    if (chosenPlaces.length < neededStops) {
      const existingIds = new Set(chosenPlaces.map((p) => p.id));
      const pool = allAvailablePlaces.filter((p) => !existingIds.has(p.id));

      // Ưu tiên cùng huyện trước, sau đó cùng vùng, sau đó theo cự ly
      pool.sort((a, b) => {
        const lastPlace = chosenPlaces[chosenPlaces.length - 1] || anchor;
        if (district && a.district === district && b.district !== district) return -1;
        if (district && b.district === district && a.district !== district) return 1;
        if (targetDistrictInfo && a.district === targetDistrictInfo.name && b.district !== targetDistrictInfo.name) return -1;
        if (targetDistrictInfo && b.district === targetDistrictInfo.name && a.district !== targetDistrictInfo.name) return 1;
        if (a.region === lastPlace.region && b.region !== lastPlace.region) return -1;
        if (b.region === lastPlace.region && a.region !== lastPlace.region) return 1;
        const distA = haversineDistance(lastPlace.lat, lastPlace.lng, a.lat, a.lng);
        const distB = haversineDistance(lastPlace.lat, lastPlace.lng, b.lat, b.lng);
        return distA - distB;
      });

      for (const candidate of pool) {
        if (chosenPlaces.length >= neededStops) break;
        chosenPlaces.push(candidate);
        if (!chosenPlaceIdSet.has(candidate.id)) {
          autoSuggestedIds.add(candidate.id);
        }
      }
    }
  }

  // 3. Xây dựng từng ngày
  const days: ItineraryDay[] = [];
  let totalDistanceKm = 0;
  let totalMinutes = 0;

  for (let dayIdx = 0; dayIdx < durationDays; dayIdx++) {
    const dayNum = dayIdx + 1;
    const morningPlace = chosenPlaces[dayIdx * 2] || anchor;
    const afternoonPlace = chosenPlaces[dayIdx * 2 + 1] || morningPlace;

    const isFirstDay = dayNum === 1;
    const isLastDay = dayNum === durationDays;

    // Khoảng cách di chuyển trong ngày
    const distBetween = haversineDistance(
      morningPlace.lat,
      morningPlace.lng,
      afternoonPlace.lat,
      afternoonPlace.lng
    );

    const distFromOrigin = isFirstDay && userLocation
      ? haversineDistance(userLocation.lat, userLocation.lng, morningPlace.lat, morningPlace.lng)
      : morningPlace.distanceFromVietTri;

    const returnDistToOrigin = isLastDay && userLocation
      ? haversineDistance(afternoonPlace.lat, afternoonPlace.lng, userLocation.lat, userLocation.lng)
      : 0;

    const dayDistance = isFirstDay && userLocation
      ? Math.round(distFromOrigin + distBetween + (isLastDay ? returnDistToOrigin : 10))
      : Math.round(distBetween + 20 + (isLastDay && userLocation ? returnDistToOrigin : 0));
    totalDistanceKm += dayDistance;

    const morningMinutes = isFirstDay && userLocation
      ? Math.max(15, Math.round(distFromOrigin * (transport.includes("Xe máy") ? 1.6 : 1.35)))
      : Math.max(20, Math.round(morningPlace.distanceFromVietTri * 1.5));
    const afternoonMinutes = Math.max(15, Math.round(distBetween * 1.6));
    const returnMinutes = isLastDay && userLocation
      ? Math.max(15, Math.round(returnDistToOrigin * 1.4))
      : 0;
    totalMinutes += morningMinutes + afternoonMinutes + returnMinutes;

    // Chọn nhà hàng
    const lunchRestaurant =
      morningPlace.restaurants[0] || afternoonPlace.restaurants[0] || places[0].restaurants[0];
    const dinnerRestaurant =
      afternoonPlace.restaurants[1] || afternoonPlace.restaurants[0] || places[0].restaurants[1];

    // Chọn nơi nghỉ đêm (nếu không phải ngày cuối)
    const nightStay = isLastDay
      ? undefined
      : afternoonPlace.stays[0] || morningPlace.stays[0] || places[0].stays[0];

    const slot1Title = (() => {
      if (isFirstDay && userLocation) {
        if (lang === "en") return `Depart from your location → ${morningPlace.shortName}`;
        if (lang === "zh") return `从您的定位出发前往 ${morningPlace.shortName}`;
        if (lang === "ko") return `현재 위치에서 출발 → ${morningPlace.shortName}`;
        if (lang === "ja") return `現在地から出発 → ${morningPlace.shortName}`;
        return `Khởi hành từ vị trí của bạn → ${morningPlace.shortName}`;
      }
      if (lang === "en") return `Depart & Discover ${morningPlace.shortName}`;
      if (lang === "zh") return `出发前往并探索 ${morningPlace.shortName}`;
      if (lang === "ko") return `출발 및 ${morningPlace.shortName} 탐방`;
      if (lang === "ja") return `出発・${morningPlace.shortName} 見学`;
      return `Khởi hành & Khám phá ${morningPlace.shortName}`;
    })();

    const slot2Title = (() => {
      if (lang === "en") return `Savor local specialties at ${lunchRestaurant.name}`;
      if (lang === "zh") return `在 ${lunchRestaurant.name} 品鉴特色美食`;
      if (lang === "ko") return `${lunchRestaurant.name}에서 현지 미식 즐기기`;
      if (lang === "ja") return `${lunchRestaurant.name} で郷土料理を堪能`;
      return `Thưởng thức ẩm thực tại ${lunchRestaurant.name}`;
    })();

    const slot3Title = (() => {
      if (lang === "en") return `Experience & Check-in at ${afternoonPlace.shortName}`;
      if (lang === "zh") return `体验与打卡 ${afternoonPlace.shortName}`;
      if (lang === "ko") return `${afternoonPlace.shortName} 체험 및 포토존`;
      if (lang === "ja") return `${afternoonPlace.shortName} を体験・散策`;
      return `Trải nghiệm & Check-in ${afternoonPlace.shortName}`;
    })();

    const slot4Title = (() => {
      if (isLastDay) {
        if (userLocation) {
          if (lang === "en") return `Specialty dinner at ${dinnerRestaurant.name} & Return home`;
          if (lang === "zh") return `在 ${dinnerRestaurant.name} 享用特色晚餐并启程返程`;
          if (lang === "ko") return `${dinnerRestaurant.name} 특선 석식 및 귀가`;
          if (lang === "ja") return `${dinnerRestaurant.name} でディナー＆帰路へ`;
          return `Bữa tối đặc sản tại ${dinnerRestaurant.name} & Trở về điểm xuất phát`;
        }
        if (lang === "en") return `Specialty dinner at ${dinnerRestaurant.name} & Tour conclusion`;
        if (lang === "zh") return `在 ${dinnerRestaurant.name} 享用特色晚餐并结束旅程`;
        if (lang === "ko") return `${dinnerRestaurant.name} 특선 석식 및 여정 마무리`;
        if (lang === "ja") return `${dinnerRestaurant.name} でディナー＆ツアー終了`;
        return `Bữa tối đặc sản tại ${dinnerRestaurant.name} & Kết thúc tour`;
      }
      if (lang === "en") return `Specialty dinner & stay at ${nightStay?.name || afternoonPlace.shortName}`;
      if (lang === "zh") return `特色晚餐与夜宿于 ${nightStay?.name || afternoonPlace.shortName}`;
      if (lang === "ko") return `특선 석식 및 ${nightStay?.name || afternoonPlace.shortName} 숙박`;
      if (lang === "ja") return `名物ディナー＆ ${nightStay?.name || afternoonPlace.shortName} で宿泊`;
      return `Ăn tối đặc sản & Nghỉ đêm tại ${nightStay?.name || afternoonPlace.shortName}`;
    })();

    const slots: ItinerarySlot[] = [
      // BUỔI SÁNG
      {
        period: "Sáng",
        timeSlot: "07:30 – 11:30",
        title: slot1Title,
        type: "visit",
        place: morningPlace,
        activity: isFirstDay && userLocation
          ? `Xuất phát từ vị trí thiết bị (${userLocation.label || "vị trí của bạn"}), khởi hành đi ${morningPlace.name}. Tham quan các điểm nhấn tiêu biểu: ${morningPlace.highlights.slice(0, 2).join(", ")}. Chụp ảnh lưu niệm và tìm hiểu văn hóa lịch sử.`
          : `Tham quan các điểm nhấn tiêu biểu: ${morningPlace.highlights.slice(0, 2).join(", ")}. Chụp ảnh lưu niệm và tìm hiểu văn hóa lịch sử.`,
        transportAdvice: isFirstDay && userLocation
          ? `Di chuyển bằng ${transport} từ vị trí của bạn (~${Math.round(distFromOrigin)} km, ước tính ${morningMinutes} phút lái xe). ${morningPlace.transportTips?.routeAdvice || "Đi theo lộ trình dẫn đường trực tiếp trên Google Maps."}`
          : `Di chuyển bằng ${transport}. Thời gian di chuyển ước tính ${morningMinutes} phút. ${morningPlace.transportTips?.routeAdvice || "Đi theo chỉ dẫn đường chính, đường đi thuận lợi."}`,
        travelMinutes: morningMinutes,
        highlightNote: morningPlace.highlights[0] || "Điểm đến biểu tượng",
        estimatedCostPerPerson: morningPlace.price.includes("miễn phí") ? 50000 : 120000,
        isAutoSuggested: autoSuggestedIds.has(morningPlace.id),
      },
      // BUỔI TRƯA
      {
        period: "Trưa",
        timeSlot: "11:30 – 13:30",
        title: slot2Title,
        type: "meal",
        restaurant: lunchRestaurant,
        activity: `Ăn trưa và nghỉ ngơi giữa ngày. Thực đơn gợi ý: ${lunchRestaurant.note}.`,
        transportAdvice: `Cách điểm tham quan sáng ${lunchRestaurant.distance} (${lunchRestaurant.travelTime}). Có bãi đỗ xe rộng rãi.`,
        travelMinutes: 10,
        highlightNote: lunchRestaurant.taste || "Hương vị đặc sản đậm đà",
        estimatedCostPerPerson: 180000,
      },
      // BUỔI CHIỀU
      {
        period: "Chiều",
        timeSlot: "13:30 – 17:30",
        title: slot3Title,
        type: "visit",
        place: afternoonPlace,
        activity: `Tham quan ${afternoonPlace.name}. Trải nghiệm ${afternoonPlace.highlights.slice(0, 2).join(", ")}. Ngắm cảnh hoàng hôn.`,
        transportAdvice: `Di chuyển từ nhà hàng sang ${afternoonPlace.shortName} mất khoảng ${afternoonMinutes} phút (${Math.round(distBetween)} km). ${afternoonPlace.transportTips?.caution || "Chú ý quan sát biển báo giao thông."}`,
        travelMinutes: afternoonMinutes,
        highlightNote: afternoonPlace.highlights[1] || afternoonPlace.highlights[0],
        estimatedCostPerPerson: afternoonPlace.price.includes("miễn phí") ? 40000 : 100000,
        isAutoSuggested: autoSuggestedIds.has(afternoonPlace.id),
      },
      // BUỔI TỐI
      {
        period: "Tối",
        timeSlot: isLastDay ? "18:00 – 20:30" : "18:00 – 22:00",
        title: slot4Title,
        type: isLastDay ? "meal" : "stay",
        restaurant: dinnerRestaurant,
        stay: nightStay,
        activity: isLastDay
          ? `Thưởng thức bữa tối sum vầy với ${dinnerRestaurant.note}. Mua sắm đặc sản làm quà và chuẩn bị lên xe trở về.`
          : `Thưởng thức bữa tối đặc sản tại ${dinnerRestaurant.name}. Sau đó nhận phòng nghỉ ngơi tại ${nightStay?.name}. Dạo bộ tận hưởng không khí buổi tối yên bình.`,
        transportAdvice: isLastDay
          ? (userLocation
              ? `Ăn tối xong khởi hành trở về điểm xuất phát ban đầu (${userLocation.label || "vị trí của bạn"}, cự ly ~${Math.round(returnDistToOrigin)} km) bằng ${transport}. Lái xe an toàn và kiểm tra kỹ hành lý.`
              : `Ăn tối xong khởi hành trở về bằng ${transport}. Lái xe an toàn và kiểm tra kỹ hành lý.`)
          : `Về khách sạn/resort chỉ cách 5–10 phút di chuyển. Nơi nghỉ có lễ tân 24/7 và dịch vụ chu đáo.`,
        travelMinutes: 15,
        highlightNote: isLastDay
          ? "Bữa tối ấm cúng trọn vẹn hành trình"
          : nightStay?.note || "Không gian nghỉ ngơi thư thái",
        estimatedCostPerPerson: isLastDay ? 200000 : 450000,
      },
    ];

    const dayTitle = (() => {
      if (lang === "en") return `Explore ${morningPlace.shortName} – ${afternoonPlace.shortName}`;
      if (lang === "zh") return `探索 ${morningPlace.shortName} – ${afternoonPlace.shortName}`;
      if (lang === "ko") return `${morningPlace.shortName} – ${afternoonPlace.shortName} 탐방`;
      if (lang === "ja") return `${morningPlace.shortName} – ${afternoonPlace.shortName} を巡る`;
      return `Khám phá ${morningPlace.shortName} – ${afternoonPlace.shortName}`;
    })();

    const dateLabel = (() => {
      if (lang === "en") return `Day ${dayNum}`;
      if (lang === "zh") return `第 ${dayNum} 天`;
      if (lang === "ko") return `${dayNum}일차`;
      if (lang === "ja") return `${dayNum}日目`;
      return `Ngày ${dayNum}`;
    })();

    days.push({
      dayNumber: dayNum,
      dateLabel,
      dayTitle,
      daySummary: `${morningPlace.highlights[0]} kết hợp trải nghiệm ẩm thực và danh thắng ${afternoonPlace.shortName}.`,
      slots,
      dayDistanceKm: dayDistance,
      stayForNight: nightStay,
    });
  }

  // Ước tính chi phí bám sát tiêu chuẩn ngân sách
  const isBudgetLow = budget.includes("Tiết kiệm");
  const isBudgetHigh = budget.includes("Cao cấp") || budget.includes("Nghỉ dưỡng");
  let baseCostPerPerson: number;
  if (customBudgetPerPerson && customBudgetPerPerson > 0) {
    baseCostPerPerson = customBudgetPerPerson;
  } else if (customBudgetTotal && customBudgetTotal > 0 && travelers > 0) {
    baseCostPerPerson = Math.round(customBudgetTotal / travelers);
  } else if (transport.includes("Xe máy") && durationDays === 1) {
    baseCostPerPerson = 280000;
  } else {
    baseCostPerPerson = isBudgetLow
      ? durationDays * 450000
      : isBudgetHigh
      ? durationDays * 1950000
      : durationDays * 950000;
  }

  const totalCost = baseCostPerPerson * travelers;

  const districtGuide = targetDistrictInfo
    ? getDistrictTravelGuide(targetDistrictInfo.id) || DISTRICT_TRAVEL_GUIDES[targetDistrictInfo.name]
    : district
    ? DISTRICT_TRAVEL_GUIDES[district] || getDistrictTravelGuide(district)
    : null;

  const actualNights = durationNights !== undefined ? durationNights : (durationDays > 1 ? durationDays - 1 : 0);

  const shortDn = (() => {
    if (lang === "en") return durationDays > 1 ? `${durationDays}D${actualNights}N` : "1-Day";
    if (lang === "zh") return durationDays > 1 ? `${durationDays}天${actualNights}晚` : "1日";
    if (lang === "ko") return durationDays > 1 ? `${actualNights}박${durationDays}일` : "당일";
    if (lang === "ja") return durationDays > 1 ? `${actualNights}泊${durationDays}日` : "日帰り";
    return `${durationDays}N${actualNights > 0 ? `${actualNights}Đ` : ""}`;
  })();

  let displayTitle = "";
  if (targetDistrictInfo && userChosenPlaces.length <= 1) {
    const districtTagline = targetDistrictInfo.title.includes("–")
      ? targetDistrictInfo.title.split("–")[1]?.trim()
      : targetDistrictInfo.title;
    if (lang === "en") displayTitle = `${shortDn} Itinerary: Discover ${targetDistrictInfo.name}`;
    else if (lang === "zh") displayTitle = `${shortDn}行程：探索 ${targetDistrictInfo.name}`;
    else if (lang === "ko") displayTitle = `${shortDn} 여정: ${targetDistrictInfo.name} 탐방`;
    else if (lang === "ja") displayTitle = `${shortDn}の旅程：${targetDistrictInfo.name}を巡る`;
    else displayTitle = `Hành trình ${shortDn}: Khám phá ${targetDistrictInfo.name} – ${districtTagline}`;
  } else if (userChosenPlaces.length > 1) {
    const stopsList = userChosenPlaces.slice(0, 3).map(p => p.shortName).join(" – ") + (userChosenPlaces.length > 3 ? ` (+${userChosenPlaces.length - 3})` : "");
    if (lang === "en") displayTitle = `${shortDn} Route: ${stopsList}`;
    else if (lang === "zh") displayTitle = `${shortDn}连线游：${stopsList}`;
    else if (lang === "ko") displayTitle = `${shortDn} 연계 루트: ${stopsList}`;
    else if (lang === "ja") displayTitle = `${shortDn}周遊ルート：${stopsList}`;
    else displayTitle = `Hành trình ${shortDn}: Ghép tuyến ${stopsList}`;
  } else {
    if (lang === "en") displayTitle = `${shortDn} Itinerary: Discover ${anchor.shortName}`;
    else if (lang === "zh") displayTitle = `${shortDn}行程：探索 ${anchor.shortName}`;
    else if (lang === "ko") displayTitle = `${shortDn} 여정: ${anchor.shortName} 탐방`;
    else if (lang === "ja") displayTitle = `${shortDn}の旅程：${anchor.shortName}を巡る`;
    else displayTitle = `Hành trình ${shortDn}: Khám phá ${anchor.shortName}`;
  }

  const effectiveDistrictName = targetDistrictInfo ? targetDistrictInfo.name : district;
  const effectiveRegion = targetDistrictInfo ? targetDistrictInfo.province : anchor.region;

  const displaySubtitle = (() => {
    if (lang === "en") return `${effectiveDistrictName ? `${effectiveDistrictName} · ` : ""}${effectiveRegion} · Transport: ${transport} · ${style}`;
    if (lang === "zh") return `${effectiveDistrictName ? `${effectiveDistrictName} · ` : ""}${effectiveRegion} · 交通：${transport} · ${style}`;
    if (lang === "ko") return `${effectiveDistrictName ? `${effectiveDistrictName} · ` : ""}${effectiveRegion} · 이동: ${transport} · ${style}`;
    if (lang === "ja") return `${effectiveDistrictName ? `${effectiveDistrictName} · ` : ""}${effectiveRegion} · 移動手段：${transport} · ${style}`;
    return `${effectiveDistrictName ? `${effectiveDistrictName} · ` : ""}${effectiveRegion} · Phương tiện ${transport} · ${style}`;
  })();

  const dNLabel = (() => {
    if (lang === "en") return durationDays > 1 ? `${durationDays} days ${actualNights} nights` : "1 day (Day trip)";
    if (lang === "zh") return durationDays > 1 ? `${durationDays}天${actualNights}晚` : "1日游（当天往返）";
    if (lang === "ko") return durationDays > 1 ? `${actualNights}박 ${durationDays}일` : "당일치기";
    if (lang === "ja") return durationDays > 1 ? `${actualNights}泊${durationDays}日` : "日帰り";
    return `${durationDays} ngày ${actualNights > 0 ? `${actualNights} đêm` : "(trong ngày)"}`;
  })();

  // Lời thoại hướng dẫn viên ảo (Tiếng Việt & English)
  const audioGuideScript = targetDistrictInfo
    ? `Chào mừng quý khách đến với hành trình khám phá ${targetDistrictInfo.name}, ${targetDistrictInfo.title}. Tôi là trợ lý du lịch số, rất vui được đồng hành cùng quý khách trong chuyến đi ${durationDays} ngày này. ${targetDistrictInfo.intro} Lịch trình được thiết kế tối ưu, kết hợp tham quan các danh lam tiêu biểu như ${targetDistrictInfo.attractions.map((a) => a.name.split("(")[0].trim()).join(", ")}, trải nghiệm văn hóa bản địa, thưởng thức đặc sản ${targetDistrictInfo.culinary.map((c) => c.dish.split("(")[0].trim()).join(", ")} và nghỉ dưỡng tiện nghi. Kính chúc quý khách có một chuyến đi an toàn, thư thái và trọn vẹn!`
    : `Chào mừng quý khách đến với hành trình du lịch ${anchor.shortName} và vùng đất cội nguồn Phú Thọ – Vĩnh Phúc – Hòa Bình. Tôi là trợ lý hướng dẫn viên số, rất vui được đồng hành cùng quý khách trong chuyến đi ${durationDays} ngày này. Lịch trình đã được tối ưu cân đối giữa thời gian tham quan, thưởng thức ẩm thực đặc sản và nghỉ dưỡng phục hồi sức khỏe. Kính chúc quý khách một chuyến đi trọn vẹn, an toàn và nhiều trải nghiệm đáng nhớ!`;

  const audioGuideScriptEn = targetDistrictInfo
    ? `Welcome to your journey exploring ${targetDistrictInfo.name} in ${targetDistrictInfo.province}. I am your digital tour guide, delighted to accompany you on this ${durationDays}-day trip. This itinerary is carefully optimized for sightseeing, authentic regional gastronomy, and relaxing stays. Wishing you a wonderful, safe, and memorable trip!`
    : `Welcome to your journey exploring ${anchor.shortName} and the northern cultural heritage of Phu Tho, Vinh Phuc, and Hoa Binh. I am your digital tour guide, delighted to accompany you on this ${durationDays}-day trip. This itinerary is carefully optimized for sightseeing, authentic regional gastronomy, and relaxing stays. Wishing you a wonderful, safe, and memorable trip in Vietnam!`;

  const overviewNarrative = targetDistrictInfo
    ? `Hành trình ${durationDays} ngày ${actualNights > 0 ? `${actualNights} đêm` : "(trong ngày)"} khám phá trọn vẹn ${targetDistrictInfo.name} (${targetDistrictInfo.province}) được tối ưu hóa cung đường di chuyển bằng ${transport}. Lịch trình kết nối các danh lam thắng cảnh đặc sắc như ${targetDistrictInfo.attractions.map((a) => a.name.split("(")[0].trim()).join(", ")}, thưởng thức ẩm thực đặc sản ${targetDistrictInfo.culinary.map((c) => c.dish.split("(")[0].trim()).join(", ")} và nghỉ ngơi tại ${targetDistrictInfo.recommendedStay || "khách sạn địa phương chu đáo"}.`
    : `Hành trình ${durationDays} ngày ${actualNights > 0 ? `${actualNights} đêm` : "(trong ngày)"} được thiết kế tối ưu hóa lộ trình di chuyển bằng ${transport}, kết nối những tinh hoa đặc sắc nhất của ${anchor.region}: từ di sản tâm linh, cảnh quan mây núi đến ẩm thực đặc sản bản địa. Lịch trình phân bổ nhịp nhàng giữa thời gian tham quan, thưởng thức ẩm thực và nghỉ ngơi tái tạo năng lượng.`;

  // Tạo Google Maps URL đa điểm bắt đầu từ vị trí của người dùng (nếu có)
  const allStops: string[] = [];
  if (userLocation) {
    allStops.push(`${userLocation.lat},${userLocation.lng}`);
  }
  chosenPlaces.forEach((p) => {
    allStops.push(`${p.lat},${p.lng}`);
  });
  if (userLocation && chosenPlaces.length > 0) {
    allStops.push(`${userLocation.lat},${userLocation.lng}`);
  }
  const googleMapsUrl = `https://www.google.com/maps/dir/${allStops.join("/")}`;

  // Thời gian di chuyển định dạng
  const hoursDrive = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  let totalDriveTime = `${hoursDrive > 0 ? `${hoursDrive} giờ ` : ""}${remMinutes} phút lái xe`;
  if (lang === "en") {
    totalDriveTime = `${hoursDrive > 0 ? `${hoursDrive}h ` : ""}${remMinutes}m drive`;
  } else if (lang === "zh") {
    totalDriveTime = `${hoursDrive > 0 ? `${hoursDrive}小时` : ""}${remMinutes}分钟车程`;
  } else if (lang === "ko") {
    totalDriveTime = `${hoursDrive > 0 ? `${hoursDrive}시간 ` : ""}${remMinutes}분 운전`;
  } else if (lang === "ja") {
    totalDriveTime = `${hoursDrive > 0 ? `${hoursDrive}時間` : ""}${remMinutes}分ドライブ`;
  }

  const defaultRouteAdvice = districtGuide
    ? `${districtGuide.bestRoutes} (Cự ly ~${districtGuide.distanceFromHanoi}, thời gian ~${districtGuide.travelTime}).`
    : (anchor.transportTips?.routeAdvice || "Cung đường liên huyện và cao tốc bằng phẳng, dễ di chuyển.");

  return {
    id: `plan-${Date.now()}`,
    title: displayTitle,
    subtitle: displaySubtitle,
    targetDestination: targetDistrictInfo
      ? `${targetDistrictInfo.name} (${targetDistrictInfo.province})`
      : userChosenPlaces.length > 1
      ? userChosenPlaces.map((p) => p.shortName).join(", ")
      : anchor.name,
    region: targetDistrictInfo ? targetDistrictInfo.province : userChosenPlaces.length > 1 ? "Liên tuyến đa điểm" : anchor.region,
    durationDays,
    durationLabel: dNLabel,
    transport,
    style,
    travelers,
    totalDistanceKm,
    totalDriveTime,
    estimatedCostPerPerson: baseCostPerPerson,
    totalCost,
    overviewNarrative,
    audioGuideScript,
    audioGuideScriptEn,
    routeAdvice: defaultRouteAdvice,
    cautionAdvice: targetDistrictInfo
      ? `Đoàn cần chú ý giữ gìn vệ sinh môi trường, chuẩn bị trang phục phù hợp khi tham quan các danh thắng tại ${targetDistrictInfo.name} và tuân thủ tốc độ khi lái xe.`
      : (anchor.warning || "Chú ý theo dõi thời tiết và chuẩn bị trang phục phù hợp với từng điểm đến."),
    days,
    googleMapsUrl,
    originName: userLocation?.label || (userLocation ? "Vị trí thiết bị của bạn" : "TP. Việt Trì"),
    originCoords: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : undefined,
  };
}

/**
 * Lịch trình du lịch chuẩn 2N1Đ: Việt Trì – Đền Hùng – Thanh Thủy – Tam Đảo
 * Biên soạn và chuẩn hóa chính xác theo hồ sơ "lịch trình du lịch.docx"
 */
export function getOfficialDocxItinerary(lang: string = "vi", userLocation?: UserLocation): GeneratedItinerary {
  const denHungPlace = places.find((p) => p.id === "den-hung") || places[0];
  const thanhThuyPlace = places.find((p) => p.id === "thanh-thuy") || places[3] || places[0];
  const tamDaoPlace = places.find((p) => p.id === "tam-dao") || places[0];

  const distFromUser = userLocation
    ? Math.round(haversineDistance(userLocation.lat, userLocation.lng, denHungPlace.lat, denHungPlace.lng))
    : 10;
  const userMorningMinutes = userLocation
    ? Math.max(15, Math.round(distFromUser * 1.4))
    : 15;

  const day1Slot0Title = userLocation
    ? (lang === "en" ? "Depart from your location → Hung Temple" : "Khởi hành từ vị trí của bạn → Đền Hùng")
    : "Xuất phát từ trung tâm Việt Trì";

  const day1Slot0Activity = userLocation
    ? `Khởi hành từ vị trí thiết bị (${userLocation.label || "vị trí của bạn"}), di chuyển hướng về Khu di tích lịch sử Quốc gia đặc biệt Đền Hùng.`
    : "Đoàn tập trung tại trung tâm thành phố Việt Trì, khởi hành hướng về Khu di tích lịch sử Quốc gia đặc biệt Đền Hùng.";

  const day1Slot0Transport = userLocation
    ? `Di chuyển bằng ô tô / xe máy từ vị trí của bạn (~${distFromUser} km, khoảng ${userMorningMinutes} phút lái xe). Đường đi theo lộ trình tối ưu trên bản đồ Google Maps.`
    : "Di chuyển theo Đại lộ Hùng Vương / Quốc lộ 2 thẳng tới xã Hy Cương (~10 km, thời gian lái xe khoảng 15 phút). Đường đô thị rộng thoáng, biển chỉ dẫn rõ ràng.";

  const lynnTimesStay: NearbyItem = {
    name: "Lynn Times Thanh Thủy Resort & Khoáng Nóng",
    type: "stay",
    distance: "Trung tâm xã Thanh Thủy",
    travelTime: "Ngay trung tâm",
    note: "Tổ hợp nghỉ dưỡng khoáng nóng Radon tiêu chuẩn 5 sao, Shoptel tiện nghi với bồn tắm khoáng tại phòng",
    address: "Khu 2, Xã Bảo Yên (xã Thanh Thủy), Tỉnh Phú Thọ",
    hours: "Mở cửa 24/24 đón khách",
    phone: "0210 6268 688",
    rating: 4.9,
    reviewCount: 1280,
    image: "/images/places/thanh-thuy.jpg",
    priceRange: "600.000 – 800.000đ/người (phòng/combo)",
  };

  const day1Slots: ItinerarySlot[] = [
    {
      period: "Sáng",
      timeSlot: "07:00 – 07:25",
      title: userLocation ? day1Slot0Title : "Xuất phát từ TP. Việt Trì → Đền Hùng (~12 km)",
      type: "travel",
      image: "/images/places/viet-tri.jpg",
      activity: day1Slot0Activity,
      transportAdvice: userLocation
        ? `Di chuyển bằng ô tô / xe máy từ vị trí của bạn (~${distFromUser} km, khoảng ${userMorningMinutes} phút lái xe).`
        : "Đoàn xuất phát từ trung tâm TP. Việt Trì đi theo Đại lộ Hùng Vương / QL2 (~12 km, 25 phút lái xe ô tô hoặc xe máy). Đường đô thị rộng thoáng, biển chỉ dẫn rõ ràng.",
      travelMinutes: userLocation ? userMorningMinutes : 25,
      highlightNote: userLocation ? "Khởi hành từ vị trí của bạn" : "Khởi hành hành trình Cội Nguồn Đất Tổ (12 km ~ 25 phút)",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["viet-tri"]?.audioFile,
      audioDuration: "00:36",
      audioScript: userLocation
        ? `Xin chào bạn! Tôi là Trợ lý Du lịch Đất Tổ. Hành trình hôm nay xuất phát trực tiếp từ vị trí của bạn, đưa bạn đến với cội nguồn dân tộc tại Đền Hùng, tiếp đó là không gian khoáng nóng thư thái tại Thanh Thủy và săn mây Tam Đảo. Chúc bạn có chuyến đi tràn đầy niềm vui!`
        : TOUR_AUDIO_GUIDES.tour2n1d["viet-tri"]?.text || "Xin chào bạn! Tôi là Trợ lý Du lịch Đất Tổ...",
      audioScriptEn: "Hello! I am your Ancestral Land Travel Assistant. Today, I will accompany you on a 2-day, 1-night journey exploring Phu Tho: returning to ancestral roots at Hung Kings Temple, unwinding in Thanh Thuy hot springs, and concluding with a cloud-hunting day in Tam Dao. Let's begin our journey!",
    },
    {
      period: "Sáng",
      timeSlot: "07:30 – 08:15",
      title: "Ăn sáng tại Nhà hàng Mai Anh",
      type: "meal",
      restaurant: {
        name: "Nhà hàng Mai Anh – Hy Cương",
        type: "restaurant",
        distance: "Gần cổng vào Đền Hùng",
        travelTime: "5 phút",
        note: "Bún bò Huế, phở bò gia truyền tái chín, bánh cuốn chả nóng hổi, cà phê sáng tràn đầy năng lượng",
        address: "Đường Hùng Vương, xã Hy Cương, Tỉnh Phú Thọ",
        hours: "06:00 – 21:00",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        taste: "Bún bò, phở cội nguồn thơm ngọt đậm đà",
      },
      activity: "Thưởng thức bữa sáng nóng sốt, chuẩn bị thể lực dồi dào trước khi bước vào hành trình leo núi viếng Đền Hùng.",
      transportAdvice: "Nằm ngay mặt đường Hùng Vương giáp quần thể di tích, sân đỗ xe rộng rãi.",
      travelMinutes: 5,
      highlightNote: "Nạp năng lượng chuẩn bị leo núi Nghĩa Lĩnh (40.000–60.000đ/người)",
      estimatedCostPerPerson: 50000,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["mai-anh"]?.audioFile,
      audioDuration: "00:28",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["mai-anh"]?.text || "Để chuẩn bị thể lực dồi dào cho hành trình leo núi Nghĩa Lĩnh, đoàn dừng chân tại Nhà hàng Mai Anh...",
      audioScriptEn: "Energize yourself before the ascent up Mount Nghia Linh with a hot bowl of traditional beef pho or Hue beef noodles at Mai Anh Restaurant right by the entrance.",
    },
    {
      period: "Sáng",
      timeSlot: "08:15 – 10:45",
      title: "Hành hương chiêm bái Quần thể Di tích Đền Hùng",
      type: "visit",
      place: denHungPlace,
      activity: "Lộ trình hành hương tuần tự tôn nghiêm: Cổng Đền → Đền Hạ (nơi Mẹ Âu Cơ sinh bọc trăm trứng) → Đền Trung (nơi Vua Hùng cùng lạc hầu, lạc tướng bàn việc nước) → Đền Thượng (đỉnh núi Nghĩa Lĩnh linh thiêng dâng hương trời đất) → Lăng Hùng Vương → Đền Giếng (nơi công chúa Tiên Dung & Ngọc Hoa soi gương vấn tóc) → Tham quan Bảo tàng Hùng Vương chiêm ngưỡng hiện vật thời đại đồ đồng Đông Sơn và trống đồng cổ.",
      transportAdvice: "Gửi xe tại bãi đỗ xe Đền Hùng, đi bộ men theo các bậc đá rợp bóng mát cây cổ thụ ngàn năm.",
      travelMinutes: 15,
      highlightNote: "Đền Hạ → Đền Trung → Đền Thượng → Đền Giếng → Bảo tàng Hùng Vương (Miễn phí vào cổng)",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["den-hung"]?.audioFile,
      audioDuration: "00:42",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["den-hung"]?.text || "Bạn hãy bắt đầu hành trình tại Cổng chính Khu di tích lịch sử Đền Hùng...",
      audioScriptEn: "Begin at the Main Gate constructed in 1917 inscribed with 'Cao Son Canh Hanh'. Climb stone steps to Ha Temple, commemorating Mother Au Co's hundred-egg sac and the roots of national solidarity. Next door sits Thien Quang Pagoda with an 800-year-old cycad tree marking Ho Chi Minh's 1954 historic visit. Ascend 159 steps to Trung Temple, where Kings deliberated with generals and Lang Liêu crafted square earth and round sky cakes. Continue 100 steps to the summit at Thuong Temple - Kinh Thien Linh Dien, epicenter of the UNESCO-inscribed Ancestral Worship rites. Descend to the 6th King's Mausoleum, Gieng Temple with Princesses Tien Dung and Ngoc Hoa's reflection well, and conclude at Hung Kings Museum examining prehistoric Bronze Age Dong Son drums.",
    },
    {
      period: "Trưa",
      timeSlot: "10:45 – 11:00",
      title: "Xuống núi và di chuyển đến nhà hàng",
      type: "travel",
      activity: "Xuống núi Nghĩa Lĩnh, nghỉ ngơi lấy lại sức và di chuyển sang nhà hàng ẩm thực đất Tổ.",
      transportAdvice: "Khoảng cách ~2 km, di chuyển bằng ô tô riêng hoặc xe máy mất khoảng 5–10 phút.",
      travelMinutes: 10,
      highlightNote: "Nghỉ chân chuẩn bị bữa trưa đặc sản vùng Đất Tổ",
      estimatedCostPerPerson: 0,
      audioScript: "Sau khi chiêm bái trọn vẹn các ngôi đền trên núi Nghĩa Lĩnh và Bảo tàng Hùng Vương, chúng ta cùng thong thả xuống núi, nghỉ ngơi lấy lại sức và di chuyển đến nhà hàng thưởng thức bữa trưa đặc sản Đất Tổ.",
      audioScriptEn: "Descending Mount Nghia Linh, take a relaxing breather before driving over to savor authentic regional specialties.",
    },
    {
      period: "Trưa",
      timeSlot: "11:00 – 12:15",
      title: "Ăn trưa tại Nhà Hàng Giang Lan Đền Hùng",
      type: "meal",
      restaurant: {
        name: "Nhà Hàng Giang Lan Đền Hùng",
        type: "restaurant",
        distance: "Khu vực Đền Hùng (cách 1.5 km)",
        travelTime: "5 phút",
        note: "Mâm cơm phong vị Đất Tổ: Cá lăng om chuối đậu, gà đồi hấp lá chanh, thịt chua Thanh Sơn ăn kèm lá sung, canh rau sắng, xôi nếp nương",
        address: "Khu 1, xã Hy Cương, Tỉnh Phú Thọ",
        hours: "09:00 – 22:00",
        phone: "0983 234 567",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        taste: "Cá lăng tươi ngọt béo ngậy, gà đồi chắc thịt thơm phức",
      },
      activity: "Dùng bữa trưa thịnh soạn với các món ăn đặc sản truyền thống Phú Thọ trong không gian sân vườn mát mẻ, thoáng đãng.",
      transportAdvice: "Nhà hàng có bãi đậu xe ô tô rộng rãi, đón tiếp đoàn đông chu đáo.",
      travelMinutes: 5,
      highlightNote: "Ẩm thực truyền thống Đất Tổ (120.000–180.000đ/người)",
      estimatedCostPerPerson: 150000,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["giang-lan"]?.audioFile,
      audioDuration: "00:30",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["giang-lan"]?.text || "Nhà hàng Giang Lan Đền Hùng là địa điểm phù hợp để thưởng thức các món đặc sản Phú Thọ sau hành trình tham quan Đền Hùng...",
      audioScriptEn: "Giang Lan Restaurant is an ideal stop to taste Phu Tho culinary specialties after exploring Hung Temple. It serves authentic local delicacies including Da River fish stewed with green banana, steamed free-range hill chicken, and Thanh Son fermented pork.",
    },
    {
      period: "Chiều",
      timeSlot: "12:15 – 13:15",
      title: "Di chuyển Đền Hùng → Thanh Thủy (~35 km)",
      type: "travel",
      activity: "Rời khu di tích Đền Hùng, xe lăn bánh theo đường tỉnh 317 ven đê sông Đà thơ mộng hướng về khu du lịch nghỉ dưỡng khoáng nóng Thanh Thủy.",
      transportAdvice: "Cung đường ĐT317 trải nhựa êm thuận, cự ly ~35 km, thời gian di chuyển khoảng 50–60 phút. Hai bên đường là khung cảnh đồng quê xanh ngát và dòng sông Đà hùng vĩ.",
      travelMinutes: 60,
      highlightNote: "Cung đường ven sông Đà nối Đất Tổ với thiên đường khoáng nóng (35 km ~ 60 phút)",
      estimatedCostPerPerson: 0,
      audioScript: "Rời Đền Hùng, xe lăn bánh theo đường tỉnh 317 ven đê sông Đà thơ mộng hướng về khu nghỉ dưỡng khoáng nóng Thanh Thủy. Tuyến đường 35 km êm thuận với khung cảnh đồng quê thanh bình, đưa bạn đến với miền khoáng nóng trứ danh của Phú Thọ.",
      audioScriptEn: "Departing Hung Temple, scenic Provincial Road 317 winds along the romantic Da River dyke for 35 km towards the geothermal mineral springs of Thanh Thuy.",
    },
    {
      period: "Chiều",
      timeSlot: "13:15 – 14:00",
      title: "Đến Lynn Times Thanh Thủy, gửi hành lý",
      type: "stay",
      place: thanhThuyPlace,
      stay: lynnTimesStay,
      activity: "Đến sảnh chính khu nghỉ dưỡng 5 sao Lynn Times Thanh Thủy, nhân viên đón tiếp trà hoa thảo mộc chào mừng và hỗ trợ gửi hành lý.",
      transportAdvice: "Xe dừng đỗ thuận tiện tại sảnh chính tòa nhà lễ tân.",
      travelMinutes: 5,
      highlightNote: "Check-in sảnh đón tiếp sang trọng và nhận trà đón tiếp",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["thanh-thuy"]?.audioFile,
      audioDuration: "00:45",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["thanh-thuy"]?.text || "Chào mừng bạn đến với Lynn Times Thanh Thủy!...",
      audioScriptEn: "Welcome to Lynn Times Thanh Thuy! Arrive at the 5-star grand reception hall, enjoy welcome herbal tea, and store luggage before room check-in.",
    },
    {
      period: "Chiều",
      timeSlot: "14:00 – 14:30",
      title: "Nhận phòng Shoptel & nghỉ ngơi lấy lại sức",
      type: "stay",
      stay: lynnTimesStay,
      activity: "Nhận phòng căn hộ Shoptel tiện nghi chuẩn 5 sao, cất đồ đạc, thay trang phục thư giãn và ngắm view nội khu xanh mát.",
      transportAdvice: "Thang máy tốc độ cao hoặc xe điện đưa đón trong khuôn viên khu nghỉ dưỡng.",
      travelMinutes: 5,
      highlightNote: "Căn hộ Shoptel cao cấp có nguồn khoáng nóng dẫn trực tiếp vào phòng (600.000–800.000đ/người)",
      estimatedCostPerPerson: 700000,
      audioScript: "Quý khách nhận phòng căn hộ Shoptel 5 sao tiện nghi, nơi có nguồn khoáng nóng tự nhiên dẫn trực tiếp vào phòng tắm. Thư giãn ngắm nhìn khung cảnh núi non Ba Vì và sông Đà yên bình phía xa.",
      audioScriptEn: "Check into your stylish 5-star Shoptel suite featuring an in-room natural mineral tub. Relax and take in peaceful vistas of the Da River and distant Ba Vi peaks.",
    },
    {
      period: "Chiều",
      timeSlot: "14:30 – 16:00",
      title: "Tắm khoáng nóng Radon tại Ohayo Onsen & Spa",
      type: "visit",
      place: thanhThuyPlace,
      activity: "Ngâm mình thư giãn trong nguồn nước khoáng nóng Radon quý hiếm độc nhất miền Bắc: ngâm bể khoáng ngoài trời hòa mình vào thiên nhiên, massage thủy lực tại bể Jacuzzi, ngâm bồn thảo dược và xông hơi Sauna đá muối Himalaya giải tỏa mọi căng thẳng mệt mỏi.",
      transportAdvice: "Tản bộ qua công viên khoáng nóng Ohayo Onsen nằm ngay trung tâm quần thể.",
      travelMinutes: 5,
      highlightNote: "Suối khoáng Radon quý hiếm & xông hơi đá muối Himalaya (Đã bao gồm trong combo phòng)",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["thanh-thuy"]?.audioFile,
      audioDuration: "00:45",
      audioScript: "Lynn Times Thanh Thủy là một khu nghỉ dưỡng khoáng nóng mang đậm phong cách Nhật Bản, nơi dịch vụ được xây dựng như một câu chuyện văn hóa tinh tế...",
      audioScriptEn: "Lynn Times Thanh Thuy is a Japanese-style hot mineral resort where wellness is crafted like refined cultural storytelling.",
    },
    {
      period: "Chiều",
      timeSlot: "16:00 – 17:30",
      title: "Dạo phố đi bộ sinh thái, vườn cảnh quan, hồ cá Koi & check-in café",
      type: "visit",
      place: thanhThuyPlace,
      activity: "Dạo bước trên các tuyến phố đi bộ rực rỡ sắc màu, ngắm đàn cá Koi tung tăng bơi lội, check-in tại các tiểu cảnh hoa anh đào, thưởng thức trà chiều hoặc cà phê giải khát.",
      transportAdvice: "Khuôn viên phố đi bộ an toàn, khép kín, xe điện nội khu hỗ trợ khi cần.",
      travelMinutes: 5,
      highlightNote: "Check-in phố hoa, hồ cá Koi và thư giãn trà chiều (Tùy chi tiêu cá nhân)",
      estimatedCostPerPerson: 50000,
      audioScript: "Điểm nhấn đặc biệt là khu phố Nhật ngay trong khuôn viên, nơi tái hiện khung cảnh truyền thống với đèn lồng, mái ngói cong, tạo nên không gian check-in độc đáo...",
      audioScriptEn: "A standout highlight is the on-site Japanese walking street recreating traditional architectures with hanging paper lanterns and curved tiled roofs.",
    },
    {
      period: "Tối",
      timeSlot: "17:30 – 18:30",
      title: "Nghỉ ngơi, thư giãn tại phòng",
      type: "stay",
      stay: lynnTimesStay,
      activity: "Trở về phòng nghỉ ngơi, tắm tráng nước ấm, ngắm hoàng hôn buông xuống núi Ba Vì phía xa và chuẩn bị trang phục cho bữa tiệc tối.",
      transportAdvice: "Nội khu phòng nghỉ.",
      travelMinutes: 0,
      highlightNote: "Khoảng lặng thư thái tái tạo năng lượng",
      estimatedCostPerPerson: 0,
      audioScript: "Khoảng lặng êm đềm tại phòng nghỉ Shoptel để du khách tắm tráng nước ấm, ngắm hoàng hôn nhuộm hồng đỉnh núi Ba Vì phía xa và chuẩn bị trang phục cho bữa tối đặc sắc.",
      audioScriptEn: "Enjoy a tranquil downtime in your room, watching the sunset glow over Mount Ba Vi and freshening up for the upcoming dinner feast.",
    },
    {
      period: "Tối",
      timeSlot: "18:30 – 19:45",
      title: "Ăn tối tại Nhà hàng Tinh Hoa Bắc Bộ & Chả Cá Sông Đà",
      type: "meal",
      restaurant: {
        name: "Nhà hàng Tinh Hoa Bắc Bộ & Chả Cá Sông Đà – Lynn Times",
        type: "restaurant",
        distance: "Phố đi bộ Lynn Times Thanh Thủy",
        travelTime: "2 phút đi bộ",
        note: "Chả cá lăng sông Đà nướng thơm lừng xèo xèo trên chảo mỡ, ăn kèm thì là hành hoa, bún rối, lạc rang và mắm tôm chuẩn vị; cá ngạnh om chuối đậu",
        address: "Khu phố đi bộ Lynn Times Thanh Thủy, Tỉnh Phú Thọ",
        hours: "10:30 – 22:30",
        phone: "0210 6268 888",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        taste: "Chả cá sông Đà thơm béo, đậm đà tinh hoa ẩm thực truyền thống Bắc Bộ",
      },
      activity: "Thưởng thức bữa tối ẩm thực đặc sắc với món Chả cá sông Đà trứ danh trong không gian nhà hàng lung linh ánh đèn ấm cúng.",
      transportAdvice: "Đi bộ 2–3 phút từ khu phòng ở sang nhà hàng ẩm thực.",
      travelMinutes: 5,
      highlightNote: "Thưởng thức Chả cá sông Đà nóng hổi trứ danh (150.000–250.000đ/người)",
      estimatedCostPerPerson: 200000,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["tinh-hoa-bac-bo"]?.audioFile,
      audioDuration: "00:35",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["tinh-hoa-bac-bo"]?.text || "Nhà hàng Tinh Hoa Bắc Bộ & Chả Cá Sông Đà tại Lynn Times Thanh Thủy...",
      audioScriptEn: "Tinh Hoa Bac Bo & Cha Ca Song Da Restaurant at Lynn Times celebrates northern culinary identity. The star highlight is grilled Da River fish patties.",
    },
    {
      period: "Tối",
      timeSlot: "19:45 – 21:15",
      title: "Dạo quảng trường Sakura & Hokkaido, café & check-in đêm",
      type: "visit",
      place: thanhThuyPlace,
      activity: "Hòa mình vào không khí lung linh về đêm tại quảng trường Sakura & Hokkaido, thưởng thức âm nhạc acoustic nhẹ nhàng, uống cà phê và check-in phố đèn lồng rực rỡ.",
      transportAdvice: "Tản bộ dạo đêm nội khu resort.",
      travelMinutes: 5,
      highlightNote: "Phố đêm lung linh ánh đèn và thưởng thức cà phê ngắm cảnh (Tùy chi tiêu)",
      estimatedCostPerPerson: 50000,
      audioScript: "Hòa mình vào không khí lung linh về đêm tại quảng trường Sakura & Hokkaido, nhâm nhi tách cà phê ấm nóng, thưởng thức âm nhạc acoustic nhẹ nhàng và check-in bên những dãy phố đèn lồng đỏ rực rỡ.",
      audioScriptEn: "Soak in the illuminated nighttime charm at Sakura & Hokkaido Squares, sip evening coffee with gentle acoustic tunes, and capture memories along radiant lantern-lit promenades.",
    },
    {
      period: "Tối",
      timeSlot: "21:15",
      title: "Nghỉ đêm tại Lynn Times Thanh Thủy Resort",
      type: "stay",
      stay: lynnTimesStay,
      activity: "Ngâm bồn khoáng ấm thư giãn tại phòng, tận hưởng giấc ngủ sâu và êm ái giữa không gian tĩnh lặng, trong lành của vùng đất khoáng nóng.",
      transportAdvice: "Nghỉ ngơi tại phòng.",
      travelMinutes: 0,
      highlightNote: "Nghỉ ngơi phục hồi sức khỏe trọn vẹn",
      estimatedCostPerPerson: 0,
      audioScript: "Ngâm bồn khoáng ấm thư giãn ngay tại phòng, tận hưởng giấc ngủ sâu và êm ái giữa không gian tĩnh lặng, trong lành của miền đất khoáng nóng, chuẩn bị năng lượng cho chuyến khám phá Tam Đảo ngày mai.",
      audioScriptEn: "Immerse in your private in-room warm mineral tub for deeply restorative sleep amidst the serene countryside atmosphere, getting well-rested for tomorrow's Tam Dao ascent.",
    },
  ];

  const day2Slots: ItinerarySlot[] = [
    {
      period: "Sáng",
      timeSlot: "07:30 – 08:15",
      title: "Ăn sáng buffet tại Lynn Times Thanh Thủy",
      type: "meal",
      restaurant: {
        name: "Nhà hàng Buffet Lynn Times Thanh Thủy",
        type: "restaurant",
        distance: "Tầng 2 nhà hàng trung tâm",
        travelTime: "Ngay tại resort",
        note: "Buffet phong phú với hơn 40 món: bún thang, phở cuốn, bánh mì nóng, thịt nguội, cháo sườn, hoa quả nhiệt đới tươi ngon và cà phê",
        address: "Khu 2, Xã Bảo Yên (xã Thanh Thủy), Tỉnh Phú Thọ",
        hours: "06:30 – 09:30",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        taste: "Thực đơn dinh dưỡng đa dạng chuẩn phong cách nghỉ dưỡng 5 sao",
      },
      activity: "Thưởng thức bữa sáng buffet thơm ngon, ngắm nhìn ánh nắng ban mai chiếu rọi qua rặng cây và hồ bơi ngoài trời.",
      transportAdvice: "Đi thang máy xuống nhà hàng buffet trung tâm.",
      travelMinutes: 5,
      highlightNote: "Buffet sáng tiêu chuẩn cao cấp (Đã bao gồm trong combo phòng)",
      estimatedCostPerPerson: 0,
      audioScript: "Chào ngày mới! Quý khách thưởng thức bữa sáng buffet thơm ngon với hơn 40 món ăn phong phú tại nhà hàng trung tâm Lynn Times Thanh Thủy, ngắm nhìn ánh ban mai chiếu rọi qua rặng cây, nạp năng lượng sẵn sàng cho chặng vượt đèo lên Tam Đảo.",
      audioScriptEn: "Good morning! Savor a bountiful breakfast buffet with over 40 delicacies at the central restaurant, soaking in the morning sunshine before driving up to misty Tam Dao.",
    },
    {
      period: "Sáng",
      timeSlot: "08:15 – 08:45",
      title: "Dạo quanh khu nghỉ dưỡng, chụp ảnh kỷ niệm",
      type: "visit",
      place: thanhThuyPlace,
      activity: "Tản bộ hít thở bầu không khí tươi mới buổi sáng, chụp những bức hình kỷ niệm rạng rỡ giữa các góc tiểu cảnh xanh mát của resort.",
      transportAdvice: "Đi bộ dạo quanh khuôn viên.",
      travelMinutes: 5,
      highlightNote: "Check-in khung cảnh ban mai thư thái (0đ)",
      estimatedCostPerPerson: 0,
      audioScript: "Tận hưởng bầu không khí trong lành buổi sớm mai, thong thả tản bộ qua các tiểu cảnh vườn Nhật, hồ cá Koi và lưu giữ những bức hình kỷ niệm rạng rỡ trước khi rời khu nghỉ dưỡng.",
      audioScriptEn: "Enjoy the fresh morning breeze, stroll through Zen gardens and Koi ponds, and capture radiant keepsake photos before departing the resort.",
    },
    {
      period: "Sáng",
      timeSlot: "08:45 – 09:00",
      title: "Check-out trả phòng",
      type: "stay",
      stay: lynnTimesStay,
      activity: "Hoàn tất thủ tục trả phòng tại quầy lễ tân, nhân viên bellman hỗ trợ chuyển hành lý lên xe.",
      transportAdvice: "Tập trung tại sảnh chính tòa nhà lễ tân.",
      travelMinutes: 5,
      highlightNote: "Tạm biệt Lynn Times Thanh Thủy, sẵn sàng cho chặng Tam Đảo",
      estimatedCostPerPerson: 0,
      audioScript: "Quý khách hoàn tất thủ tục trả phòng tại quầy lễ tân, nhân viên hỗ trợ chuyển hành lý lên xe, chuẩn bị cho hành trình khám phá thị xã trên mây Tam Đảo.",
      audioScriptEn: "Complete check-out formalities at reception, with luggage transferred to your vehicle, ready for the scenic ascent to cloud-kissed Tam Dao.",
    },
    {
      period: "Sáng",
      timeSlot: "09:00 – 10:30",
      title: "Di chuyển Thanh Thủy → Tam Đảo (~65 km)",
      type: "travel",
      activity: "Khởi hành rời Thanh Thủy, qua cầu Đồng Quang / cầu Văn Lang, theo tuyến Quốc lộ 2B vượt cung đèo thông reo uốn lượn hướng lên đỉnh mây Tam Đảo.",
      transportAdvice: "Khoảng cách ~65 km (~1 giờ 30 phút). Đoạn đèo Tam Đảo dài 13 km uốn lượn phong cảnh hữu tình, tài xế lưu ý giữ tốc độ ổn định và đi số thấp.",
      travelMinutes: 90,
      highlightNote: "Cung đường đèo mây ngoạn mục dẫn lên vùng mây trong sương (65 km ~ 90 phút)",
      estimatedCostPerPerson: 0,
      audioScript: "Rời Thanh Thủy, xe qua cầu kết nối sang Quốc lộ 2B vượt cung đèo thông reo uốn lượn dài 13 km hướng lên Tam Đảo. Khi xe lên đến độ cao gần 1.000 mét, không khí chuyển sang mát lạnh đặc trưng và mây mù giăng mắc quanh sườn núi kỳ vĩ.",
      audioScriptEn: "Departing Thanh Thuy across the river, ascend the 13-km pine-clad scenic winding pass along National Route 2B towards Tam Dao, as crisp highland breezes replace valley warmth.",
    },
    {
      period: "Sáng",
      timeSlot: "10:30 – 11:00",
      title: "Check-in Quảng trường Tam Đảo",
      type: "visit",
      place: tamDaoPlace,
      activity: "Dạo bước tại quảng trường trung tâm Tam Đảo rực rỡ với đài phun nước, bậc thang đá biểu tượng, ngắm nhìn biển mây bồng bềnh và lâu đài cổ tích phía xa.",
      transportAdvice: "Đậu xe tại bãi đỗ trung tâm xã Tam Đảo, tản bộ ngắm cảnh quanh quảng trường.",
      travelMinutes: 5,
      highlightNote: "Biểu tượng trung tâm du lịch Tam Đảo mây mù bồng bềnh (0đ)",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-quang-truong"]?.audioFile,
      audioDuration: "00:34",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-quang-truong"]?.text || "Quảng trường Tam Đảo nằm ngay trung tâm xã Tam Đảo...",
      audioScriptEn: "Tam Dao Central Square is the beating heart of this misty mountain resort.",
    },
    {
      period: "Trưa",
      timeSlot: "11:00 – 11:30",
      title: "Tham quan Nhà thờ đá cổ Tam Đảo",
      type: "visit",
      place: tamDaoPlace,
      activity: "Chiêm bái và check-in kiệt tác kiến trúc Gothic bằng đá xanh sừng sững xây dựng từ năm 1906 thời Pháp. Từ các vòm cửa đá nhìn xuống thung lũng mây trập trùng tựa chốn bồng lai tiên cảnh.",
      transportAdvice: "Cách Quảng trường trung tâm chỉ 200m đi bộ dọc con dốc đá.",
      travelMinutes: 5,
      highlightNote: "Kiệt tác Gothic đá xanh cổ kính & góc ngắm thung lũng mây huyền thoại (0đ)",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-nha-tho"]?.audioFile,
      audioDuration: "00:36",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-nha-tho"]?.text || "Nhà thờ đá Tam Đảo là một công trình mang tính biểu tượng...",
      audioScriptEn: "Tam Dao Stone Church is an iconic French Gothic monument built from bluish stones in the early 20th century.",
    },
    {
      period: "Trưa",
      timeSlot: "11:30 – 12:45",
      title: "Ăn trưa tại Nhà Hàng TAM ĐẢO NÚI",
      type: "meal",
      restaurant: {
        name: "Nhà Hàng TAM ĐẢO NÚI",
        type: "restaurant",
        distance: "Khu 1, xã Tam Đảo",
        travelTime: "3 phút đi bộ",
        note: "Đặc sản vùng cao: Ngọn su su xào tỏi giòn ngọt xanh mướt, gà đồi bọc đất nướng than hoa thơm lừng, thịt lợn mán xiên nướng lá móc mật, xôi nếp nương muối vừng",
        address: "Khu 1, xã Tam Đảo, Tỉnh Phú Thọ",
        hours: "09:00 – 22:30",
        phone: "0978 123 888",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        taste: "Rau su su tươi giòn hái tại vườn núi, thịt gà đồi săn chắc đậm vị thiên nhiên",
      },
      activity: "Thưởng thức mâm cơm đặc sản núi rừng trọn vị giữa tiết trời se lạnh mát dịu đặc trưng của Tam Đảo.",
      transportAdvice: "Nằm ngay khu ẩm thực trung tâm xã Tam Đảo, có chỗ đỗ xe thuận tiện.",
      travelMinutes: 5,
      highlightNote: "Ẩm thực ngọn su su xanh non & gà đồi nướng than (150.000–250.000đ/người)",
      estimatedCostPerPerson: 200000,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-nui"]?.audioFile,
      audioDuration: "00:30",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-nui"]?.text || "Nhà hàng Tam Đảo Núi là một điểm dừng chân ẩm thực độc đáo...",
      audioScriptEn: "Tam Dao Nui Restaurant offers a memorable culinary stop enveloped by grand mountain landscapes.",
    },
    {
      period: "Chiều",
      timeSlot: "12:45 – 14:00",
      title: "Café, nghỉ ngơi & ngắm cảnh tại Tam Đảo café trên cả cổng trời",
      type: "meal",
      restaurant: {
        name: "Tam Đảo cafe trên cả cổng trời",
        type: "cafe",
        distance: "Dốc Cổng Trời Tam Đảo",
        travelTime: "5 phút",
        note: "Quán cà phê săn mây view panorama triệu đô ôm trọn thung lũng mây Tam Đảo, lâu đài châu Âu cổ tích và rặng thông ngút ngàn",
        address: "Dốc Cổng Trời, Khu 1, xã Tam Đảo, Tỉnh Phú Thọ",
        hours: "07:00 – 23:00",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
        taste: "Cà phê trứng béo ngậy ấm nồng, trà đào cam sả thanh mát ngắm biển mây",
      },
      activity: "Ngồi nhâm nhi tách đồ uống ấm nóng, ngắm biển mây vần vũ lướt qua vai và chụp những bức ảnh 'sống ảo' triệu view để đời.",
      transportAdvice: "Xe đưa lên dốc Cổng Trời hoặc tản bộ ngắn từ khu trung tâm.",
      travelMinutes: 10,
      highlightNote: "Tọa độ săn mây ngắm trọn thung lũng từ đỉnh trời (60.000–100.000đ/người)",
      estimatedCostPerPerson: 80000,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-cong-troi"]?.audioFile,
      audioDuration: "00:32",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-cong-troi"]?.text || "Tam Đảo Café trên Cổng Trời là một điểm dừng chân rất đặc biệt...",
      audioScriptEn: "Tam Dao Cafe tren Cong Troi occupies the highest vantage point at Heaven's Gate.",
    },
    {
      period: "Chiều",
      timeSlot: "14:00 – 15:00",
      title: "Dạo trung tâm, check-in & mua đặc sản Tam Đảo",
      type: "visit",
      place: tamDaoPlace,
      activity: "Ghé chợ trung tâm Tam Đảo mua những bó ngọn su su tươi non vừa cắt trong sương sớm, chuối mật rừng, măng khô, bánh tro mật mía và trà hoa vàng làm quà cho người thân, bạn bè.",
      transportAdvice: "Tản bộ quanh khu chợ truyền thống trung tâm xã Tam Đảo.",
      travelMinutes: 5,
      highlightNote: "Mua quà đặc sản ngọn su su & nông sản tươi ngon (Tùy chi tiêu cá nhân)",
      estimatedCostPerPerson: 100000,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-ket-thuc"]?.audioFile,
      audioDuration: "00:38",
      audioScript: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-ket-thuc"]?.text || "Sau khi tham quan các địa điểm nổi tiếng như Nhà thờ đá hay lên Cổng Trời...",
      audioScriptEn: "Return to Tam Dao town center to stroll through bustling local markets, picking up fresh chayote bundles, mountain honey bananas, and dried bamboo shoots as gifts.",
    },
    {
      period: "Chiều",
      timeSlot: "15:00 – 15:45",
      title: "Tự do vui chơi, chụp ảnh check-in các góc phố thơ mộng",
      type: "visit",
      place: tamDaoPlace,
      activity: "Tự do lang thang qua những con dốc hoa sim tím, bậc thang đá phong cách châu Âu, lưu giữ những kỷ niệm đẹp cuối cùng tại vùng mây Tam Đảo.",
      transportAdvice: "Đi bộ tự do trong bán kính trung tâm.",
      travelMinutes: 5,
      highlightNote: "Khoảng thời gian tự do khám phá và chụp ảnh kỷ niệm (Tùy chi tiêu)",
      estimatedCostPerPerson: 50000,
      audioScript: "Khoảng thời gian tự do khám phá, tản bộ qua những con dốc quanh co ngập tràn sắc hoa và sương mù, lưu lại những bức ảnh kỷ niệm cuối cùng tại xứ sở trong mây.",
      audioScriptEn: "Enjoy free time wandering through romantic flower slopes and stone steps, taking final memorable snapshots of misty Tam Dao.",
    },
    {
      period: "Chiều",
      timeSlot: "15:45 – 16:00",
      title: "Tập trung chuẩn bị rời Tam Đảo",
      type: "travel",
      activity: "Đoàn tập trung tại xe, sắp xếp hành lý và các túi đặc sản, kiểm tra tư trang sẵn sàng cho chặng về.",
      transportAdvice: "Tập trung tại bãi đỗ xe trung tâm xã Tam Đảo.",
      travelMinutes: 5,
      highlightNote: "Kiểm tra hành lý và chuẩn bị xuống núi",
      estimatedCostPerPerson: 0,
      audioScript: "Đoàn tập trung tại xe, sắp xếp hành lý và các phần quà đặc sản vùng cao, kiểm tra tư trang chuẩn bị cho chặng đường về trung tâm thành phố Việt Trì.",
      audioScriptEn: "Gather at the vehicle, arrange luggage and local gifts, and prepare for the scenic return drive to Viet Tri.",
    },
    {
      period: "Chiều",
      timeSlot: "16:00 – 17:30",
      title: userLocation
        ? `Di chuyển Tam Đảo → Vị trí của bạn (~${Math.round(haversineDistance(tamDaoPlace.lat, tamDaoPlace.lng, userLocation.lat, userLocation.lng))} km)`
        : "Di chuyển Tam Đảo → Việt Trì (~75 km)",
      type: "travel",
      activity: userLocation
        ? `Xe khởi hành xuống đèo Tam Đảo, di chuyển trở về vị trí thiết bị ban đầu của quý khách (${userLocation.label || "vị trí của bạn"}).`
        : "Xe khởi hành xuống đèo Tam Đảo, rẽ vào Quốc lộ 2B nối sang Quốc lộ 2, qua cầu Hạc Trì / cầu Việt Trì trở về trung tâm thành phố ngã ba sông.",
      transportAdvice: userLocation
        ? `Cự ly ~${Math.round(haversineDistance(tamDaoPlace.lat, tamDaoPlace.lng, userLocation.lat, userLocation.lng))} km. Đi xe êm ái, theo chỉ dẫn lộ trình Google Maps.`
        : "Cự ly ~75 km (~1 giờ 30 phút). Đi xe êm ái, ngắm hoàng hôn rực rỡ buông xuống đôi bờ sông Hồng, sông Lô.",
      travelMinutes: userLocation
        ? Math.max(30, Math.round(haversineDistance(tamDaoPlace.lat, tamDaoPlace.lng, userLocation.lat, userLocation.lng) * 1.4))
        : 90,
      highlightNote: userLocation ? "Hành trình trở về an toàn đến vị trí của bạn" : "Hành trình trở về an toàn và ngắm hoàng hôn đồng bằng Bắc Bộ",
      estimatedCostPerPerson: 0,
      audioScript: userLocation
        ? `Xe khởi hành xuống đèo Tam Đảo, di chuyển trở về điểm xuất phát ban đầu. Quý khách thư giãn ngắm hoàng hôn thanh bình và hoàn tất hành trình.`
        : "Xe khởi hành xuống đèo Tam Đảo, rẽ vào Quốc lộ 2B nối sang Quốc lộ 2, qua cầu Hạc Trì trở về trung tâm thành phố ngã ba sông Việt Trì. Quý khách thư giãn ngắm hoàng hôn buông xuống đôi bờ sông Hồng và sông Lô thanh bình.",
      audioScriptEn: "Drive down the winding mountain pass along scenic routes back towards your location, admiring the peaceful sunset.",
    },
    {
      period: "Chiều",
      timeSlot: "~17:30",
      title: userLocation ? "Kết thúc hành trình tại vị trí của bạn" : "Kết thúc hành trình tại Việt Trì",
      type: "visit",
      activity: userLocation
        ? `Đoàn về đến vị trí của quý khách an toàn. Hướng dẫn viên cảm ơn và chia tay quý khách, kết thúc chuyến du lịch 2 ngày 1 đêm 'Đền Hùng – Thanh Thủy – Tam Đảo' xuất phát từ vị trí của bạn thành công tốt đẹp, đầy ắp kỷ niệm đáng nhớ.`
        : "Đoàn về đến trung tâm thành phố Việt Trì an toàn. Hướng dẫn viên cảm ơn và chia tay quý khách, kết thúc chuyến du lịch 2 ngày 1 đêm 'Việt Trì – Đền Hùng – Thanh Thủy – Tam Đảo' thành công tốt đẹp, đầy ắp kỷ niệm đáng nhớ.",
      transportAdvice: "Kết thúc tour tại điểm đón ban đầu.",
      travelMinutes: 0,
      highlightNote: "Hoàn thành trọn vẹn hành trình Di Sản – Khoáng Nóng – Mây Núi",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tour2n1d["tam-dao-ket-thuc"]?.audioFile,
      audioDuration: "00:38",
      audioScript: "Như vậy, hành trình du lịch 2 ngày 1 đêm đã khép lại với những trải nghiệm đáng nhớ: từ không gian linh thiêng của Đền Hùng, sự thư giãn tại suối khoáng nóng Thanh Thủy, cho đến vẻ đẹp mờ sương lãng mạn của Tam Đảo với Nhà thờ đá, Quảng trường trung tâm và Cổng Trời. Trợ lý du lịch Phú Thọ rất hân hạnh được đồng hành cùng bạn. Xin chào và hẹn gặp lại ở những chuyến đi tiếp theo!",
      audioScriptEn: "Our 2-day 1-night journey has concluded with unforgettable memories: from the sacred heritage of Hung Kings Temple, deep relaxation at Thanh Thuy radon mineral springs, to the romantic highland beauty of Tam Dao. It has been an honor accompanying you. Wishing you safe travels and see you again!",
    },
  ];

  const isEnLang = lang === "en";
  const isZhLang = lang === "zh";
  const isKoLang = lang === "ko";
  const isJaLang = lang === "ja";

  const day1DateLabel = isEnLang ? "Day 1" : isZhLang ? "第1天" : isKoLang ? "1일차" : isJaLang ? "1日目" : "Ngày 1";
  const day1Title = isEnLang
    ? "Day 1: Sacred Roots Pilgrimage to Hung Temple & Thanh Thuy Hot Springs"
    : isZhLang
    ? "第1天：雄王古庙朝圣之旅 & 清水天然温泉度假"
    : isKoLang
    ? "1일차: 훙왕 신전 근원 순례 & 탄투이 천연 온천 힐링"
    : isJaLang
    ? "1日目：フン王廟への巡礼＆タントゥイ天然ラドン温泉リゾート"
    : "Hành hương Cội Nguồn Đền Hùng & Nghỉ dưỡng Khoáng nóng Thanh Thủy";
  const day1Summary = isEnLang
    ? "Depart Viet Tri, visit Hung Kings Temple UNESCO heritage site, savor local fish specialties, check into 5-star Shoptel at Lynn Times Thanh Thuy, indulge in Japanese radon Onsen and Da River fish dinner."
    : isZhLang
    ? "从越池出发，瞻仰联合国教科文组织非遗雄王庙，品尝江兰餐厅特色河鲜，入住清水林奈温泉度假区五星级套房，体验稀有氡温泉与特色河鱼宴。"
    : isKoLang
    ? "비엣찌 출발, 유네스코 인류유산 훙왕 사원 참배, 강란 향토 생선 요리 오찬, 린타임스 탄투이 5성급 숍텔 체크인, 천연 라돈 온천욕 및 전통 만찬."
    : isJaLang
    ? "ヴィエッチー出発、ユネスコ無形文化遺産フン王廟巡礼、川魚料理の昼食、リンタイムズ・タントゥイ5つ星リゾート宿泊、天然ラドン温泉と名物ディナー。"
    : "Khởi hành từ trung tâm Việt Trì lúc 07:00, ăn sáng Mai Anh, dâng hương tri ân công đức các Vua Hùng qua 4 đền linh thiêng và Bảo tàng Hùng Vương. Thưởng thức bữa trưa cá sông tại nhà hàng Giang Lan. Buổi chiều di chuyển về Lynn Times Thanh Thủy nhận phòng Shoptel 5 sao, ngâm khoáng Radon quý hiếm tại Ohayo Onsen, dạo phố đi bộ sinh thái và thưởng thức bữa tối Chả cá sông Đà & Tinh hoa Bắc Bộ.";

  const day2DateLabel = isEnLang ? "Day 2" : isZhLang ? "第2天" : isKoLang ? "2일차" : isJaLang ? "2日目" : "Ngày 2";
  const day2Title = isEnLang
    ? "Day 2: Highland Cloud Paradise Tam Dao & Return to Viet Tri"
    : isZhLang
    ? "第2天：云雾之城三岛漫游 & 启程返回越池"
    : isKoLang
    ? "2일차: 땀다오 운해의 낙원 탐방 & 비엣찌 귀환"
    : isJaLang
    ? "2日目：霧の高原タムダオ散策＆ヴィエッチー帰還"
    : "Thiên đường mây Tam Đảo & Trở về Việt Trì";
  const day2Summary = isEnLang
    ? "Morning pass drive to misty Tam Dao, Central Square, French stone church, chayote lunch, mountain cafe above the clouds, local market shopping and scenic drive back to Viet Tri."
    : isZhLang
    ? "穿越13公里蜿蜒山路前往避暑胜地三岛，游览中央广场与百年哥特式石教堂，品尝山珍佛手瓜，在云海咖啡馆俯瞰全景，逛特产集市后返回越池。"
    : isKoLang
    ? "구름 속 고원 마을 땀다오로 이동, 중앙 광장과 프랑스식 고딕 석조 성당 탐방, 차요테 순과 토종닭 오찬, 운해 전망 카페, 특산품 쇼핑 후 비엣찌 귀환."
    : isJaLang
    ? "霧深き避暑地タムダオへ。中央広場、1906年建造の石造り教会、名物ハヤトウリ料理、雲海を望む絶景カフェ、特産品市場を巡りヴィエッチーへ帰還。"
    : "Thưởng thức buffet sáng tại resort, vượt cung đèo mây lên xã Tam Đảo trong sương. Check-in Quảng trường trung tâm, chiêm ngưỡng Nhà thờ đá Gothic cổ kính, thưởng thức bữa trưa đặc sản rau su su và gà đồi tại nhà hàng Tam Đảo Núi. Thưởng thức cà phê ngắm biển mây tại Cổng Trời, dạo chợ mua quà đặc sản và trở về Việt Trì lúc chiều muộn.";

  const days: ItineraryDay[] = [
    {
      dayNumber: 1,
      dateLabel: day1DateLabel,
      dayTitle: day1Title,
      daySummary: day1Summary,
      slots: day1Slots,
      dayDistanceKm: 55,
      stayForNight: lynnTimesStay,
    },
    {
      dayNumber: 2,
      dateLabel: day2DateLabel,
      dayTitle: day2Title,
      daySummary: day2Summary,
      slots: day2Slots,
      dayDistanceKm: 140,
    },
  ];

  const totalCostPerPerson = 1630000;
  const travelers = 2;

  const itineraryTitle = isEnLang
    ? "Viet Tri – Hung King Temple – Thanh Thuy – Tam Dao (2D1N)"
    : isZhLang
    ? "越池 – 雄王庙 – 清水 – 三岛（2天1晚）"
    : isKoLang
    ? "비엣찌 – 훙왕 신전 – 탄투이 – 땀다오 (1박2일)"
    : isJaLang
    ? "ヴィエッチー – フン王廟 – タントゥイ – タムダオ（1泊2日）"
    : "Việt Trì – Đền Hùng – Thanh Thủy – Tam Đảo (2N1Đ)";

  const itinerarySubtitle = isEnLang
    ? "Standard Heritage Route: Ancestral Roots, Mineral Onsen & Misty Mountain Peaks"
    : isZhLang
    ? "标准经典行程：民族源头文化遗产、天然氡温泉与高山云海摄影"
    : isKoLang
    ? "공식 표준 일정: 민족의 시원 문화유산, 라돈 온천 휴양 & 땀다오 운해"
    : isJaLang
    ? "公式標準ツアー：祖先の地・世界遺産、天然ラドン温泉＆霧のタムダオ絶景"
    : "Lịch trình chuẩn theo tài liệu hồ sơ: Di sản Cội Nguồn, Khoáng nóng Onsen & Săn mây núi ngàn";

  const itineraryDurationLabel = isEnLang ? "2 days 1 night" : isZhLang ? "2天1晚" : isKoLang ? "1박 2일" : isJaLang ? "1泊2日" : "2 ngày 1 đêm";

  // Full accurate Google Maps Route with all key stops:
  const officialGoogleMapsUrl = userLocation
    ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/Nhà+hàng+Mai+Anh+Hy+Cương/Khu+di+tích+lịch+sử+Đền+Hùng/Nhà+hàng+Giang+Lan+Đền+Hùng/Lynn+Times+Thanh+Thủy/Nhà+hàng+Tinh+Hoa+Bắc+Bộ+Thanh+Thủy/Quảng+trường+Tam+Đảo/Nhà+thờ+đá+Tam+Đảo/Nhà+hàng+Tam+Đảo+Núi/Cổng+Trời+Tam+Đảo/${userLocation.lat},${userLocation.lng}`
    : "https://www.google.com/maps/dir/TP.+Việt+Trì/Nhà+hàng+Mai+Anh+Hy+Cương/Khu+di+tích+lịch+sử+Đền+Hùng/Nhà+hàng+Giang+Lan+Đền+Hùng/Lynn+Times+Thanh+Thủy/Nhà+hàng+Tinh+Hoa+Bắc+Bộ+Thanh+Thủy/Quảng+trường+Tam+Đảo/Nhà+thờ+đá+Tam+Đảo/Nhà+hàng+Tam+Đảo+Núi/Cổng+Trời+Tam+Đảo/TP.+Việt+Trì";

  return {
    id: "plan-viet-tri-den-hung-thanh-thuy-tam-dao-2n1d",
    title: itineraryTitle,
    subtitle: itinerarySubtitle,
    targetDestination: "Việt Trì – Đền Hùng – Thanh Thủy – Tam Đảo",
    region: "Phú Thọ",
    durationDays: 2,
    durationLabel: itineraryDurationLabel,
    transport: "Ô tô riêng / Xe máy",
    style: "Di sản & Nghỉ dưỡng",
    travelers,
    totalDistanceKm: userLocation
      ? Math.round(distFromUser + 35 + 65 + haversineDistance(tamDaoPlace.lat, tamDaoPlace.lng, userLocation.lat, userLocation.lng))
      : 195,
    totalDriveTime: userLocation ? "Lộ trình tối ưu từ thiết bị" : "4 giờ 15 phút lái xe",
    estimatedCostPerPerson: totalCostPerPerson,
    totalCost: totalCostPerPerson * travelers,
    overviewNarrative: userLocation
      ? `Hành trình du lịch 2 ngày 1 đêm được thiết kế chuẩn xác kết nối từ vị trí của bạn: khám phá di sản linh thiêng Đền Hùng, không gian nghỉ dưỡng khoáng nóng Radon 5 sao Lynn Times Thanh Thủy và săn mây Tam Đảo. Toàn bộ lộ trình di chuyển, quãng đường và thời gian đã được tự động tối ưu hóa từ vị trí thiết bị của quý khách.`
      : "Hành trình du lịch 2 ngày 1 đêm được thiết kế chuẩn xác theo tài liệu lịch trình: kết nối trọn vẹn di sản linh thiêng Đền Hùng, không gian nghỉ dưỡng khoáng nóng Radon 5 sao Lynn Times Thanh Thủy và vùng săn mây thơ mộng Tam Đảo. Lộ trình tối ưu từng khung giờ từ 07:00 sáng ngày 1 đến 17:30 chiều ngày 2, kết hợp hoàn hảo giữa tâm linh, ẩm thực đặc sản bản địa (cá sông Lô, chả cá sông Đà, ngọn su su Tam Đảo) và chăm sóc sức khỏe phục hồi sinh lực.",
    audioGuideScript: userLocation
      ? `Xin chào bạn! Tôi là Trợ lý Du lịch Đất Tổ. Hôm nay, tôi sẽ đồng hành cùng bạn trong hành trình 2 ngày 1 đêm khám phá Đất Tổ: khởi hành trực tiếp từ vị trí của bạn, đưa bạn trở về cội nguồn dân tộc tại Quần thể di tích Đền Hùng, thư giãn tại khu nghỉ dưỡng khoáng nóng Lynn Times Thanh Thủy và kết thúc bằng một ngày khám phá Tam Đảo trong sương. Chúc bạn có chuyến đi tràn đầy sức sống và niềm vui!`
      : "Xin chào bạn! Tôi là Trợ lý Du lịch Đất Tổ. Hôm nay, tôi sẽ đồng hành cùng bạn trong hành trình 2 ngày 1 đêm khám phá Đất Tổ: khởi hành từ trung tâm Việt Trì, trở về cội nguồn dân tộc tại Quần thể di tích Đền Hùng, thư giãn tại khu nghỉ dưỡng khoáng nóng Lynn Times Thanh Thủy và kết thúc bằng một ngày khám phá Tam Đảo trong sương. Tại Đền Hùng, chúng ta bắt đầu từ Cổng chính xây năm 1917 với lời nhắc 'Cao sơn cảnh hành', bước lên Đền Hạ nơi Mẹ Âu Cơ sinh bọc trăm trứng khơi nguồn hai tiếng 'đồng bào', viếng Chùa Thiên Quang với cây vạn tuế 800 năm tuổi gắn dấu mốc ngày 19/9/1954 Bác Hồ về thăm. Vượt 159 bậc đá lên Đền Trung – Hùng Vương Tổ Miếu gắn với sự tích bánh chưng bánh giầy Lang Liêu, leo tiếp 100 bậc lên đỉnh Nghĩa Lĩnh viếng Đền Thượng Kính Thiên Lĩnh Điện – trung tâm Tín ngưỡng thờ cúng Hùng Vương được UNESCO vinh danh Di sản nhân loại, rồi xuống viếng Lăng Hùng Vương thứ sáu, Đền Giếng giếng cổ Ngọc Tỉnh và Bảo tàng Hùng Vương trên Đồi Công Quán. Sau bữa trưa đặc sản cá sông Lô tại Nhà hàng Giang Lan, đoàn xuôi dòng sông Đà về Lynn Times Thanh Thủy tận hưởng làn khoáng nóng Radon quý hiếm, dạo phố Nhật, ngắm hồ cá Koi và thưởng thức bữa tối Chả cá sông Đà trứ danh tại Nhà hàng Tinh Hoa Bắc Bộ. Ngày thứ hai, đoàn vượt cung đèo mây 13 km lên đỉnh Tam Đảo, dạo bước Quảng trường trung tâm, chiêm ngưỡng Nhà thờ đá Gothic xây từ năm 1906, thưởng thức bữa trưa ngọn su su và gà đồi tại Nhà hàng Tam Đảo Núi, nhâm nhi cà phê săn mây tại Tam Đảo Café trên Cổng Trời và dạo chợ mua đặc sản phố núi trước khi trở về Việt Trì trong sự thư thái trọn vẹn. Chúc bạn có một chuyến đi tuyệt vời!",
    audioGuideScriptEn: userLocation
      ? `Welcome! I am your Ancestral Land Travel Assistant. Today, I accompany you on our 2-day 1-night journey starting right from your device location: visiting Hung Kings Temple, rejuvenating in radon hot mineral springs at Lynn Times Thanh Thuy, and concluding with a cloud-hunting day in misty Tam Dao. Wishing you safe travels!`
      : "Welcome! I am your Ancestral Land Travel Assistant. Today, I accompany you on our official 2-day 1-night journey: departing Viet Tri, returning to sacred roots at Hung Kings Temple, rejuvenating in radon hot mineral springs at Lynn Times Thanh Thuy, and concluding with a cloud-hunting day in misty Tam Dao. At Mount Nghia Linh, we start from the 1917 Main Gate, visit Ha Temple honoring Mother Au Co's hundred-egg sac, Thien Quang Pagoda with its 800-year-old cycad tree, ascend 159 steps to Trung Temple honoring Lang Liêu's cakes, and 100 steps to Thuong Temple atop the summit for UNESCO Ancestral Worship rites, followed by the 6th King's Mausoleum, Gieng Temple, and the Bronze Age museum. After lunch at Giang Lan Restaurant, we follow the Da River to Lynn Times Thanh Thuy for therapeutic radon Onsen bathing, Zen gardens, Koi ponds, and a dinner of sizzling Da River fish patties. On Day 2, we drive up the 13-km winding pass to misty Tam Dao, exploring the Central Square, French Gothic Stone Church, dining at Tam Dao Nui Restaurant, sipping clouds-view coffee at Cong Troi, and gathering local gifts before our scenic return to Viet Tri.",
    routeAdvice: userLocation
      ? `Cung đường khởi hành trực tiếp từ vị trí của bạn tới Đền Hùng (~${distFromUser} km) → theo ĐT317 ven sông Đà tới Thanh Thủy (~35 km) → qua cầu kết nối sang QL2B vượt dốc đèo lên Tam Đảo (~65 km) → trở về vị trí của bạn (~${Math.round(haversineDistance(tamDaoPlace.lat, tamDaoPlace.lng, userLocation.lat, userLocation.lng))} km).`
      : "Cung đường di chuyển rất thuận lợi: TP. Việt Trì qua Đại lộ Hùng Vương tới Đền Hùng (~12 km) → theo ĐT317 ven sông Đà tới Thanh Thủy (~35 km) → qua cầu Đồng Quang / cầu Văn Lang kết nối Quốc lộ 2B vượt dốc đèo lên Tam Đảo (~65 km) → theo QL2B và QL2 trở về trung tâm Việt Trì (~75 km). Đoạn đèo Tam Đảo dài 13 km uốn lượn có cảnh quan rất đẹp, tài xế lưu ý giữ khoảng cách an toàn và đi số thấp.",
    cautionAdvice: "Khi tham quan Đền Hùng nên đi giày thể thao hoặc giày đế bệt êm chân do có nhiều bậc đá; trang phục lịch sự, kín đáo nơi đền miếu. Tại Lynn Times Thanh Thủy nên mang đồ bơi hoặc đồ tắm phù hợp để trải nghiệm Onsen trọn vẹn. Lên Tam Đảo nên mang theo áo khoác mỏng hoặc khăn choàng vì thời tiết se lạnh vào chiều tối.",
    days,
    googleMapsUrl: officialGoogleMapsUrl,
    originName: userLocation?.label || (userLocation ? "Vị trí thiết bị của bạn" : "TP. Việt Trì"),
    originCoords: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : undefined,
  };
}

/**
 * Lịch trình du lịch chuẩn 1 ngày: Việt Trì – Đồi chè Long Cốc – VQG Xuân Sơn
 * Biên soạn và chuẩn hóa chính xác theo hồ sơ "THUYẾT MINH LONG CỐC - XUÂN SƠN.docx"
 */
export function getOfficialLongCocXuanSonItinerary(lang: string = "vi", userLocation?: UserLocation): GeneratedItinerary {
  const longCocPlace = places.find((p) => p.id === "doi-che-long-coc") || places.find((p) => p.id.includes("long-coc")) || places[1] || places[0];
  const xuanSonPlace = places.find((p) => p.id === "vqg-xuan-son") || places.find((p) => p.id.includes("xuan-son")) || places[2] || places[0];

  const distFromUser = userLocation
    ? Math.round(haversineDistance(userLocation.lat, userLocation.lng, longCocPlace.lat, longCocPlace.lng))
    : 70;
  const userMorningMinutes = userLocation
    ? Math.max(30, Math.round(distFromUser * 1.3))
    : 90;

  const day1Slots: ItinerarySlot[] = [
    {
      period: "Sáng",
      timeSlot: "03:00 – 05:00",
      title: userLocation
        ? `Khởi hành từ vị trí của bạn → Đồi chè Long Cốc (~${distFromUser} km)`
        : "Khởi hành TP. Việt Trì → Đồi chè Long Cốc (~70 km)",
      type: "travel",
      image: "/images/places/long-coc.jpg",
      activity: userLocation
        ? `Đoàn tập trung, xuất phát sớm từ vị trí thiết bị (${userLocation.label || "vị trí của bạn"}), di chuyển theo Quốc lộ 32 và Tỉnh lộ 316 hướng về huyện Tân Sơn để kịp đón sương sớm và biển mây bồng bềnh tại đồi chè.`
        : "Đoàn tập trung tại TP. Việt Trì lúc 03:00 sáng, xuất phát sớm theo tuyến QL32 qua Thanh Sơn, rẽ vào ĐT316 hướng về xã Long Cốc, huyện Tân Sơn (~70 km, khoảng 1h30 – 2 giờ lái xe) để kịp đón bình minh và săn mây sớm lúc 05:00.",
      transportAdvice: "Di chuyển bằng ô tô riêng hoặc xe máy. Đường đồi núi quanh co nhưng đã trải nhựa êm thuận.",
      travelMinutes: userMorningMinutes,
      highlightNote: "Khởi hành sớm 03:00 đón bình minh & săn mây ốc đảo chè",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-khoi-hanh"]?.audioFile,
      audioDuration: "00:28",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-khoi-hanh"]?.text,
      audioScriptEn: "Departing early morning from Viet Tri towards Long Coc tea hills and Xuan Son National Park.",
    },
    {
      period: "Sáng",
      timeSlot: "05:00 – 07:00",
      title: "Tham quan đồi chè Long Cốc (Săn mây & Bình minh)",
      type: "visit",
      place: longCocPlace,
      activity: "Chiêm ngưỡng 'Vịnh Hạ Long trên cạn' của vùng trung du trong ánh bình minh: hàng trăm quả đồi chè tròn xoe nhấp nhô như những chiếc bát úp khổng lồ lững lờ giữa biển mây trắng muốt. Tự do ngắm cảnh, chụp ảnh khoảnh khắc sương sớm. Lưu ý không giẫm đạp lên luống chè và không tự ý hái chè.",
      transportAdvice: "Gửi xe dưới chân đồi, tản bộ lên đỉnh đồi chè Cầu Mới hoặc đồi Đội 3 ngắm toàn cảnh 360 độ.",
      travelMinutes: 10,
      highlightNote: "Tọa độ săn mây & bình minh tuyệt đẹp nhất miền Bắc (Miễn phí vé tham quan)",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-doi-che"]?.audioFile,
      audioDuration: "00:35",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-doi-che"]?.text,
      audioScriptEn: "Catch the magical sunrise and floating mist carpets over undulating tea mounds at Long Coc.",
    },
    {
      period: "Sáng",
      timeSlot: "07:00 – 07:45",
      title: "Ăn sáng tại Homestay Tony Luận (Xóm Bông 1, Long Cốc)",
      type: "meal",
      restaurant: {
        name: "Homestay Tony Luận – Long Cốc",
        type: "restaurant",
        distance: "Dưới chân đồi chè Long Cốc",
        travelTime: "5 phút",
        note: "Bữa sáng mộc mạc bản Mường: Bánh mì trứng ốp la, xôi ngũ sắc nếp nương dẻo thơm, măng xào thịt bản và ấm trà Shan tuyết cổ thụ Long Cốc nóng hổi",
        address: "Xóm Bông 1, xã Long Cốc, Huyện Tân Sơn, Tỉnh Phú Thọ",
        hours: "06:00 – 22:00",
        phone: "0968 123 456",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        taste: "Trà Shan tuyết chát dịu ngọt hậu sâu, xôi nếp nương thơm dẻo ngút ngàn",
      },
      activity: "Dừng chân nghỉ ngơi tại không gian nhà sàn thoáng mát ở xóm Bông 1, nạp thêm năng lượng với bữa sáng nóng sốt và nhâm nhi tách trà Shan tuyết đặc sản trước khi tiếp tục hành trình.",
      transportAdvice: "Nằm ngay khu dân cư trung tâm xã Long Cốc, có sân đỗ xe rộng rãi.",
      travelMinutes: 5,
      highlightNote: "Thưởng thức trà Shan tuyết Long Cốc & xôi ngũ sắc nếp nương (35.000–50.000đ/người)",
      estimatedCostPerPerson: 45000,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-tony-luan"]?.audioFile,
      audioDuration: "00:26",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-tony-luan"]?.text,
      audioScriptEn: "Savor local breakfast with highland sticky rice and Long Coc Shan Tuyet green tea at Tony Luan Homestay.",
    },
    {
      period: "Sáng",
      timeSlot: "07:45 – 08:30",
      title: "Tiếp tục khám phá & chụp ảnh tại Long Cốc",
      type: "visit",
      place: longCocPlace,
      activity: "Khi ánh nắng lên cao, sắc xanh của đồi chè càng trở nên rõ nét và tươi mới. Du khách tự do chọn các góc chụp bao quát toàn cảnh bát úp hoặc dạo theo lối đi nương chè lưu giữ những khuôn hình kỷ niệm tuyệt đẹp.",
      transportAdvice: "Tản bộ thong thả giữa các luống chè.",
      travelMinutes: 5,
      highlightNote: "Thuê trang phục truyền thống & check-in nương chè (30.000–50.000đ/bộ)",
      estimatedCostPerPerson: 40000,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-kham-pha"]?.audioFile,
      audioDuration: "00:28",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-kham-pha"]?.text,
      audioScriptEn: "Wander through lush green tea trails, try on traditional Muong and Dao costumes for unique keepsake photography.",
    },
    {
      period: "Sáng",
      timeSlot: "08:30 – 09:30",
      title: "Di chuyển Long Cốc → Vườn quốc gia Xuân Sơn (~25 km)",
      type: "travel",
      activity: "Rời đồi chè Long Cốc mềm mại, xe đưa đoàn di chuyển theo đường liên xã nối sang VQG Xuân Sơn. Trên đường đi, ngắm nhìn cảnh sắc trung du và miền núi thay đổi kỳ thú sang núi đá vôi và đại ngàn nguyên sinh.",
      transportAdvice: "Khoảng cách ~25 km, thời gian di chuyển khoảng 45–60 phút đường đèo núi đã thảm nhựa êm ái.",
      travelMinutes: 50,
      highlightNote: "Cung đường chuyển tiếp giữa nương chè bát úp và đại ngàn núi đá vôi hùng vĩ",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["xuan-son-chuyen-tiep"]?.audioFile,
      audioDuration: "00:26",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["xuan-son-chuyen-tiep"]?.text,
      audioScriptEn: "Scenic transit along limestone cliffs connecting Long Coc to Xuan Son National Park.",
    },
    {
      period: "Trưa",
      timeSlot: "09:30 – 11:30",
      title: "Tham quan Vườn quốc gia Xuân Sơn (Rừng nguyên sinh & Hang động)",
      type: "visit",
      place: xuanSonPlace,
      activity: "Khám phá VQG Xuân Sơn (thành lập theo QĐ 49/2002/QĐ-TTg của Thủ tướng Chính phủ) – lá phổi xanh quý giá của Phú Thọ. Khám phá địa hình núi đá vôi nối tiếp, rừng xanh, hệ thống hang động tự nhiên (Hang Na, Hang Lạng), suối thác Chín Tầng và tìm hiểu văn hóa người Dao, người Mường.",
      transportAdvice: "Đậu xe tại cổng trung tâm VQG, đi bộ theo đường mòn sinh thái có hướng dẫn, tuân thủ quy định bảo tồn rừng.",
      travelMinutes: 10,
      highlightNote: "Hệ sinh thái rừng nhiệt đới trên núi đá vôi & hang động thạch nhũ kỳ thú (Vé vào cổng: 30.000đ/người)",
      estimatedCostPerPerson: 30000,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["vqg-xuan-son"]?.audioFile,
      audioDuration: "00:32",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["vqg-xuan-son"]?.text,
      audioScriptEn: "Explore Xuan Son National Park's pristine karst rainforest, Thac Chin Tang waterfalls, and prehistoric stalactite caves.",
    },
    {
      period: "Trưa",
      timeSlot: "11:30 – 13:00",
      title: "Ăn trưa đặc sản tại Nhà hàng Thế Nhé 1 (Bản Dù, Xuân Sơn)",
      type: "meal",
      restaurant: {
        name: "Nhà hàng Thế Nhé 1 – VQG Xuân Sơn",
        type: "restaurant",
        distance: "Bản Dù, VQG Xuân Sơn",
        travelTime: "5 phút",
        note: "Mâm cỗ lá đại ngàn Xuân Sơn: Gà nhiều cựa nướng than hoa thơm lừng, thịt lợn mán nướng lá móc mật, rau dớn rừng xào tỏi, cá suối chiên giòn rụm và canh măng chua hạt dổi",
        address: "Khu Bản Dù, Xã Xuân Sơn, Huyện Tân Sơn, Tỉnh Phú Thọ",
        hours: "09:00 – 22:00",
        phone: "0975 678 910",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        taste: "Gà nhiều cựa giòn ngọt thịt săn chắc, rau dớn rừng tươi mơn mởn",
      },
      activity: "Đoàn dừng chân tại Nhà hàng Thế Nhé 1 ở Bản Dù dùng bữa trưa ấm cúng. Thưởng thức các món ăn mang hương vị miền núi phong phú, chế biến từ sản vật địa phương và nghỉ ngơi bên hiên nhà sàn.",
      transportAdvice: "Có bãi đỗ xe ô tô và xe máy rộng rãi ngay cổng nhà hàng.",
      travelMinutes: 5,
      highlightNote: "Ẩm thực Gà nhiều cựa & Rau dớn rừng tiến Vua (150.000–200.000đ/người)",
      estimatedCostPerPerson: 180000,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["xuan-son-the-nhe"]?.audioFile,
      audioDuration: "00:28",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["xuan-son-the-nhe"]?.text,
      audioScriptEn: "Savor a feast of legendary multi-spurred hill chicken, wild ferns, and crisp stream fish at The Nhe 1 Restaurant.",
    },
    {
      period: "Chiều",
      timeSlot: "13:00 – 14:30",
      title: "Khám phá khu vực Bản Dù & Văn hóa địa phương",
      type: "visit",
      place: xuanSonPlace,
      activity: "Dành thời gian tìm hiểu nhịp sống gần gũi với thiên nhiên tại Bản Dù. Gặp gỡ đồng bào Dao Tiền, Mường, tìm hiểu phong tục tập quán, nghề dệt thổ cẩm và cảm nhận ý nghĩa phát triển du lịch gắn liền với bảo tồn thiên nhiên.",
      transportAdvice: "Tản bộ ngắm cảnh trong khuôn viên bản làng văn hóa Bản Dù. Tôn trọng sinh hoạt của người dân.",
      travelMinutes: 5,
      highlightNote: "Trải nghiệm văn hóa bản địa mộc mạc & mua quà mật ong rừng nguyên chất",
      estimatedCostPerPerson: 50000,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["ban-du-van-hoa"]?.audioFile,
      audioDuration: "00:30",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["ban-du-van-hoa"]?.text,
      audioScriptEn: "Stroll across wooden suspension bridges into Ban Du village to experience Dao Tien brocade weaving and indigenous traditions.",
    },
    {
      period: "Chiều",
      timeSlot: "14:30 – 16:30",
      title: userLocation
        ? `Khởi hành trở về vị trí của bạn (~${Math.round(haversineDistance(xuanSonPlace.lat, xuanSonPlace.lng, userLocation.lat, userLocation.lng))} km)`
        : "Khởi hành VQG Xuân Sơn → TP. Việt Trì (~85 km)",
      type: "travel",
      activity: userLocation
        ? `Đoàn tập trung, lên xe khởi hành trở về điểm xuất phát ban đầu (${userLocation.label || "vị trí của bạn"}). Kết thúc chuyến du lịch sinh thái 1 ngày 'Long Cốc – Xuân Sơn' trọn vẹn và an toàn.`
        : "Đoàn tập trung lên xe, khởi hành từ VQG Xuân Sơn theo QL32 trở về trung tâm TP. Việt Trì (~85 km, 2 giờ di chuyển). Kết thúc hành trình sinh thái 1 ngày đầy ắp kỷ niệm đẹp.",
      transportAdvice: userLocation
        ? `Cự ly ~${Math.round(haversineDistance(xuanSonPlace.lat, xuanSonPlace.lng, userLocation.lat, userLocation.lng))} km. Lái xe an toàn theo lộ trình Google Maps.`
        : "Cự ly ~85 km (~2 giờ). Đường qua Thanh Sơn, Tam Nông về Việt Trì rộng rãi, êm ái.",
      travelMinutes: userLocation
        ? Math.max(45, Math.round(haversineDistance(xuanSonPlace.lat, xuanSonPlace.lng, userLocation.lat, userLocation.lng) * 1.4))
        : 120,
      highlightNote: "Hành trình trở về an toàn, kết thúc chuyến du lịch sinh thái tuyệt vời",
      estimatedCostPerPerson: 0,
      audioUrl: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-ve-viet-tri"]?.audioFile,
      audioDuration: "00:32",
      audioScript: TOUR_AUDIO_GUIDES.tourLongCocXuanSon["long-coc-ve-viet-tri"]?.text,
      audioScriptEn: "Scenic return drive to Viet Tri concluding our 1-day eco-discovery adventure.",
    },
  ];

  const days: ItineraryDay[] = [
    {
      dayNumber: 1,
      dateLabel: lang === "en" ? "Day 1" : "Ngày 1",
      dayTitle: "Khám phá Ốc Đảo Chè Long Cốc & Đại Ngàn VQG Xuân Sơn",
      daySummary: "Khởi hành sớm từ Việt Trì lúc 03:00 sáng, săn mây và đón bình minh trên đồi chè bát úp Long Cốc (05:00 – 07:00), ăn sáng tại Homestay Tony Luận (Xóm Bông 1). Tiếp tục chụp ảnh nương chè rồi di chuyển sang VQG Xuân Sơn tham quan rừng nguyên sinh trên núi đá vôi, hang động tự nhiên. Dùng bữa trưa tại Nhà hàng Thế Nhé 1 (Bản Dù), khám phá văn hóa Dao Tiền – Mường trước khi trở về lúc 14:30 – 16:30.",
      slots: day1Slots,
      dayDistanceKm: 180,
    },
  ];

  const totalCostPerPerson = 345000;
  const travelers = 2;

  const officialGoogleMapsUrl = userLocation
    ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/Đồi+chè+Long+Cốc/Homestay+Tony+Luận/Vườn+quốc+gia+Xuân+Sơn/Nhà+hàng+Thế+Nhé+Xuân+Sơn/Bản+Dù+Xuân+Sơn/${userLocation.lat},${userLocation.lng}`
    : "https://www.google.com/maps/dir/TP.+Việt+Trì/Đồi+chè+Long+Cốc/Homestay+Tony+Luận/Vườn+quốc+gia+Xuân+Sơn/Nhà+hàng+Thế+Nhé+Xuân+Sơn/Bản+Dù+Xuân+Sơn/TP.+Việt+Trì";

  return {
    id: "plan-viet-tri-long-coc-xuan-son-1ngay",
    title: "Việt Trì – Đồi chè Long Cốc – VQG Xuân Sơn (1 Ngày)",
    subtitle: "Lịch trình sinh thái: Bình minh Ốc Đảo Chè & Đại ngàn Rừng Cổ Thụ",
    targetDestination: "Long Cốc – VQG Xuân Sơn",
    region: "Phú Thọ",
    durationDays: 1,
    durationLabel: "1 ngày",
    transport: "Ô tô riêng / Xe máy",
    style: "Sinh thái & Săn mây",
    travelers,
    totalDistanceKm: userLocation
      ? Math.round(distFromUser + 25 + haversineDistance(xuanSonPlace.lat, xuanSonPlace.lng, userLocation.lat, userLocation.lng))
      : 180,
    totalDriveTime: "4 giờ lái xe",
    estimatedCostPerPerson: totalCostPerPerson,
    totalCost: totalCostPerPerson * travelers,
    overviewNarrative: "Hành trình du lịch sinh thái 1 ngày trọn vẹn khám phá 2 kỳ quan thiên nhiên nổi bật nhất đất Phú Thọ: đón bình minh và biển mây bồng bềnh tại 'Vịnh Hạ Long trên cạn' Đồi chè Long Cốc, thưởng thức đặc sản trà Shan tuyết cổ thụ và gà chín cựa nướng than hoa, sau đó hòa mình vào cánh rừng nguyên sinh đại ngàn và văn hóa bản Mường, bản Dao tại Vườn quốc gia Xuân Sơn.",
    audioGuideScript: "Xin chào quý khách! Tôi là Trợ lý Du lịch Đất Tổ. Hôm nay, tôi rất hân hạnh đồng hành cùng quý khách trong hành trình khám phá hai viên ngọc sinh thái của Phú Thọ: Đồi chè bát úp Long Cốc và Vườn quốc gia Xuân Sơn. Tại Long Cốc, chúng ta đón bình minh trên những ốc đảo chè xanh ngát bồng bềnh mây sương, thưởng thức bữa sáng ấm nồng trà Shan tuyết cổ thụ. Tiếp đó, cung đường rừng dẫn ta tới VQG Xuân Sơn với hệ sinh thái núi đá vôi kỳ vĩ, thác Chín Tầng, hang động thạch nhũ và mâm cỗ gà chín cựa nướng tại Bản Dù. Chúc quý khách một chuyến đi tràn đầy sức sống và trải nghiệm khó quên!",
    audioGuideScriptEn: "Welcome to our 1-day eco adventure exploring Long Coc tea hills and Xuan Son National Park! Enjoy sunrise cloud-hunting over rolling green tea mounds and immerse in pristine karst rainforests and Dao ethnic culture.",
    routeAdvice: "Cung đường: TP. Việt Trì qua QL32 → TT. Thanh Sơn → ĐT316 vào Đồi chè Long Cốc (~70 km) → đường liên xã sang VQG Xuân Sơn (~25 km) → theo QL32 trở về Việt Trì (~85 km). Đường đồi núi quanh co nhưng đã trải nhựa êm thuận, xe máy và ô tô gầm thấp đều đi tốt.",
    cautionAdvice: "Nên khởi hành sớm lúc 05:30 để ngắm bình minh và săn mây đẹp nhất lúc 06:30–07:30. Mang theo áo khoác nhẹ vì vùng đồi và rừng Xuân Sơn sáng sớm se lạnh. Đi giày thể thao có độ bám tốt để đi dạo nương chè và đường mòn rừng.",
    days,
    googleMapsUrl: officialGoogleMapsUrl,
    originName: userLocation?.label || (userLocation ? "Vị trí thiết bị của bạn" : "TP. Việt Trì"),
    originCoords: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : undefined,
  };
}

