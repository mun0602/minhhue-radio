import { Category } from "../types/radio";

export const CATEGORIES: Category[] = [
  { id: "all", name: "Tất cả phát thanh", path: "#", group: "minh-hue" },
  { id: "tru-bo-chap-truoc-vao-dien-thoai", name: "Trừ bỏ chấp trước vào điện thoại", path: "/news/category/tru-bo-chap-truoc-vao-dien-thoai", group: "minh-hue" },
  { id: "ngay-phap-luan-dai-phap-the-gioi-radio", name: "Ngày Pháp Luân Đại Pháp Thế giới", path: "/news/category/ngay-phap-luan-dai-phap-the-gioi", group: "minh-hue" },
  { id: "phap-hoi-trung-quoc-radio", name: "Pháp hội Trung Quốc", path: "/news/category/phap-hoi-trung-quoc", group: "minh-hue" },
  { id: "tin-tuc-tai-dai-luc", name: "Tin tức tại Đại Lục", path: "/news/category/tin-tuc-tai-dai-luc", group: "minh-hue" },
  { id: "tin-tuc-tren-the-gioi", name: "Tin tức trên thế giới", path: "/news/category/tin-tuc-tren-the-gioi", group: "minh-hue" },
  { id: "thien-am-tinh-nhac", name: "Thiên Âm Tịnh Nhạc", path: "/news/category/thien-am-tinh-nhac", group: "minh-hue" },
  { id: "kien-tri-hoc-thuoc-phap", name: "Kiên trì học thuộc Pháp", path: "/news/category/kien-tri-hoc-thuoc-phap", group: "minh-hue" },
  { id: "tin-tuc-tong-hop", name: "Tin tức tổng hợp", path: "/news/category/tin-tuc", group: "minh-hue" },
  { id: "cau-chuyen-tu-luyen", name: "Câu chuyện tu luyện", path: "/news/category/cau-chuyen-tu-luyen", group: "minh-hue" },
  { id: "giai-the-van-hoa-dang", name: "Giải thể văn hóa đảng (Số 25)", path: "/news/category/giai-the-van-hoa-dang", group: "minh-hue" },
  
  // Nhóm Tứ kiếm
  { id: "all-tu-kiem", name: "Tất cả sách Tứ kiếm", path: "#", group: "tu-kiem" },
  { id: "cuu-binh", name: "Cửu Bình - Chín bài bình luận về ĐCS", path: "/news/category/cuu-binh", group: "tu-kiem" },
  { id: "giai-the-van-hoa-dang-sach", name: "Giải thể văn hóa đảng (Sách)", path: "/news/category/giai-the-van-hoa-dang-sach", group: "tu-kiem" },
  { id: "muc-dich-cuoi-cung-cua-chu-nghia-cong-san", name: "Mục đích cuối cùng của CNCS (Audio)", path: "/news/category/muc-dich-cuoi-cung-cua-chu-nghia-cong-san", group: "tu-kiem" },
  { id: "muc-dich-cuoi-cung-cua-chu-nghia-cong-san-video", name: "Mục đích cuối cùng của CNCS (Video)", path: "/news/category/muc-dich-cuoi-cung-cua-chu-nghia-cong-san-video", group: "tu-kiem" },
  { id: "ma-quy-dang-thong-tri-the-gioi-cua-chung-ta", name: "Ma quỷ đang thống trị thế giới của chúng ta", path: "/news/category/ma-quy-dang-thong-tri-the-gioi-cua-chung-ta", group: "tu-kiem" },
  
  { id: "radio-hoi-uc-ve-su-phu", name: "Hồi ức về Sư Phụ", path: "/news/category/radio-hoi-uc-ve-su-phu", group: "minh-hue" },
  { id: "tuyen-tap-bai-chia-se-cua-tieu-de-tu-dai-phap", name: "Tiểu đệ tử Đại Pháp", path: "/news/category/tuyen-tap-bai-chia-se-cua-tieu-de-tu-dai-phap", group: "minh-hue" },
  { id: "tuyen-tap-cac-bai-chia-se-cua-de-tu-dai-phap-tre-tuoi", name: "Đệ tử Đại Pháp trẻ tuổi", path: "/news/category/tuyen-tap-cac-bai-chia-se-cua-de-tu-dai-phap-tre-tuoi", group: "minh-hue" },
  { id: "tuyen-tap-cac-bai-chia-se-tu-luyen-chinh-phap", name: "Tu luyện Chính Pháp", path: "/news/category/tuyen-tap-cac-bai-chia-se-tu-luyen-chinh-phap", group: "minh-hue" },
  { id: "dot-pha-gia-tuong-nghiep-benh", name: "Đột phá giả tướng nghiệp bệnh", path: "/news/category/dot-pha-gia-tuong-nghiep-benh", group: "minh-hue" },
  { id: "mot-niem-giua-thien-va-ac", name: "Một niệm giữa thiện và ác", path: "/news/category/mot-niem-giua-thien-va-ac", group: "minh-hue" },
  { id: "cuoc-song-va-hy-vong-da-quay-tro-lai", name: "Cuộc sống và hy vọng đã quay trở lại", path: "/news/category/cuoc-song-va-hy-vong-da-quay-tro-lai", group: "minh-hue" },
  { id: "bai-chia-se-co-loi-binh-cua-su-phu", name: "Bài chia sẻ có lời bình của Sư phụ", path: "/news/category/bai-chia-se-co-loi-binh-cua-su-phu", group: "minh-hue" }
];

export const SPEEDS = [1.0, 1.25, 1.5];
export const ITEM_HEIGHT = 52;
export const BUFFER = 10;

export function removeTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .toLowerCase();
}

export function cleanTitle(title: string) {
  return title
    .replace(/\[\d{2}-\d{2}-\d{4}\]/g, "")
    .replace(/Phát thanh Minh Huệ:\s*/g, "")
    .replace(/Phát thanh Minh Huệ\s*\(.*?\):\s*/g, "")
    .trim();
}

export const formatTime = (secs: number) => {
  if (isNaN(secs) || !isFinite(secs)) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}
