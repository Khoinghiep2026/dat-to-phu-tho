/**
 * DANH BẠ TOÀN DIỆN CƠ SỞ LƯU TRÚ DU LỊCH (CSLT)
 * Tỉnh Phú Thọ, Vĩnh Phúc (cũ 7.2026) & Hòa Bình (cũ đến 2.2026)
 * Trích xuất từ 2 file dữ liệu chính thức Sở Văn hóa, Thể thao và Du lịch:
 * 1. DS CSLT Vĩnh Phúc & Phú Thọ cũ 7.2026.xlsx
 * 2. DS CSLTDL Hòa Bình cũ (đến tháng 2.2026).xls
 */

import accommodationsRaw from "./accommodationsDirectory.json";

export interface AccommodationItem {
  id: string;
  name: string;
  type: string;
  rating: string;
  stars: number;
  province: string;
  districtId: string;
  districtName: string;
  commune: string;
  address: string;
  newAddress?: string | null;
  oldAddress?: string | null;
  phone?: string;
  owner?: string | null;
  rooms?: number | null;
  beds?: number | null;
  priceEstimate?: string;
}

export const ACCOMMODATIONS_DATABASE: AccommodationItem[] = accommodationsRaw as AccommodationItem[];
