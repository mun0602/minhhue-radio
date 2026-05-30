import re
import sys
import json
import time
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://vi.minghui.org/"
}

TARGET_CATEGORIES = [
    {
        "name": "Trừ bỏ chấp trước vào điện thoại",
        "slug": "tru-bo-chap-truoc-vao-dien-thoai",
        "url": "https://vi.minghui.org/news/category/tru-bo-chap-truoc-vao-dien-thoai"
    },
    {
        "name": "Ngày Pháp Luân Đại Pháp Thế giới",
        "slug": "ngay-phap-luan-dai-phap-the-gioi-radio",
        "url": "https://vi.minghui.org/news/category/ngay-phap-luan-dai-phap-the-gioi-radio"
    },
    {
        "name": "Pháp hội Trung Quốc",
        "slug": "phap-hoi-trung-quoc-radio",
        "url": "https://vi.minghui.org/news/category/phap-hoi-trung-quoc-radio"
    },
    {
        "name": "Tin tức tại Đại Lục",
        "slug": "tin-tuc-tai-dai-luc",
        "url": "https://vi.minghui.org/news/category/tin-tuc-tai-dai-luc"
    },
    {
        "name": "Tin tức trên thế giới",
        "slug": "tin-tuc-tren-the-gioi",
        "url": "https://vi.minghui.org/news/category/tin-tuc-tren-the-gioi"
    },
    {
        "name": "Thiên Âm Tịnh Nhạc",
        "slug": "thien-am-tinh-nhac",
        "url": "https://vi.minghui.org/news/category/thien-am-tinh-nhac"
    },
    {
        "name": "Kiên trì học thuộc Pháp",
        "slug": "kien-tri-hoc-thuoc-phap",
        "url": "https://vi.minghui.org/news/category/kien-tri-hoc-thuoc-phap"
    },
    {
        "name": "Tin tức tổng hợp",
        "slug": "tin-tuc",
        "url": "https://vi.minghui.org/news/category/tin-tuc"
    },
    {
        "name": "Câu chuyện tu luyện",
        "slug": "cau-chuyen-tu-luyen",
        "url": "https://vi.minghui.org/news/category/cau-chuyen-tu-luyen"
    },
    {
        "name": "Giải thể văn hóa đảng",
        "slug": "giai-the-van-hoa-dang",
        "url": "https://vi.minghui.org/news/category/giai-the-van-hoa-dang"
    },
    {
        "name": "Hồi ức về Sư Phụ",
        "slug": "radio-hoi-uc-ve-su-phu",
        "url": "https://vi.minghui.org/news/category/radio-hoi-uc-ve-su-phu"
    },
    {
        "name": "Tiểu đệ tử Đại Pháp",
        "slug": "tuyen-tap-bai-chia-se-cua-tieu-de-tu-dai-phap",
        "url": "https://vi.minghui.org/news/category/tuyen-tap-bai-chia-se-cua-tieu-de-tu-dai-phap"
    },
    {
        "name": "Đệ tử Đại Pháp trẻ tuổi",
        "slug": "tuyen-tap-cac-bai-chia-se-cua-de-tu-dai-phap-tre-tuoi",
        "url": "https://vi.minghui.org/news/category/tuyen-tap-cac-bai-chia-se-cua-de-tu-dai-phap-tre-tuoi"
    },
    {
        "name": "Tu luyện Chính Pháp",
        "slug": "tuyen-tap-cac-bai-chia-se-tu-luyen-chinh-phap",
        "url": "https://vi.minghui.org/news/category/tuyen-tap-cac-bai-chia-se-tu-luyen-chinh-phap"
    },
    {
        "name": "Đột phá giả tướng nghiệp bệnh",
        "slug": "dot-pha-gia-tuong-nghiep-benh",
        "url": "https://vi.minghui.org/news/category/dot-pha-gia-tuong-nghiep-benh"
    },
    {
        "name": "Một niệm giữa thiện và ác",
        "slug": "mot-niem-giua-thien-va-ac",
        "url": "https://vi.minghui.org/news/category/mot-niem-giua-thien-va-ac"
    },
    {
        "name": "Cuộc sống và hy vọng đã quay trở lại",
        "slug": "cuoc-song-va-hy-vong-da-quay-tro-lai",
        "url": "https://vi.minghui.org/news/category/cuoc-song-va-hy-vong-da-quay-tro-lai"
    },
    {
        "name": "Bài chia sẻ có lời bình của Sư phụ",
        "slug": "bai-chia-se-co-loi-binh-cua-su-phu",
        "url": "https://vi.minghui.org/news/category/bai-chia-se-co-loi-binh-cua-su-phu"
    }
]

def count_articles_in_page(soup):
    # Đếm số lượng bài viết phát thanh thực tế nằm trong .main-category-articles-list
    ul = soup.find("ul", class_="main-category-articles-list")
    if not ul:
        # Dự phòng nếu không tìm thấy ul cụ thể, tìm các thẻ a trỏ tới /news/
        seen = set()
        count = 0
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "/news/" in href and href.endswith(".html") and not href.includes("/category/"):
                if href not in seen:
                    seen.add(href)
                    count += 1
        return count
    
    # Đếm số lượng thẻ li chứa bài viết
    lis = ul.find_all("li")
    return len(lis)

def get_last_page_number(soup):
    # Phân tích thanh phân trang để lấy số trang lớn nhất
    pagenavi = soup.find("div", class_="wp-pagenavi")
    if not pagenavi:
        return 1
    
    # Tìm nút trang cuối "Cuối »"
    last_btn = pagenavi.find("a", class_="last")
    if last_btn and "href" in last_btn.attrs:
        href = last_btn["href"]
        match = re.search(r'/page/(\d+)', href)
        if match:
            return int(match.group(1))
            
    # Dự phòng nếu không có nút .last, tìm tất cả thẻ a.page để lấy số lớn nhất
    pages = []
    for a in pagenavi.find_all("a", class_="page"):
        match = re.search(r'/page/(\d+)', a.get("href", ""))
        if match:
            pages.append(int(match.group(1)))
            
    if pages:
        return max(pages)
        
    return 1

def run_counting():
    print("📋 ĐANG ĐẾM TỔNG SỐ AUDIO TRÊN TỪNG CHUYÊN MỤC CỦA MINH HUỆ NET...")
    print("="*80)
    
    results = []
    grand_total = 0
    
    for idx, cat in enumerate(TARGET_CATEGORIES):
        print(f"🔄 [{idx+1}/{len(TARGET_CATEGORIES)}] Đang phân tích chuyên mục: {cat['name']}...")
        
        try:
            # Tải trang 1
            res = requests.get(cat['url'], headers=HEADERS, timeout=15)
            if not res.ok:
                print(f"   ❌ Lỗi tải trang 1 (Status: {res.status_code})")
                continue
                
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Đếm số bài ở trang 1
            p1_count = count_articles_in_page(soup)
            
            # Tìm số trang cuối cùng
            last_page = get_last_page_number(soup)
            
            total_count = 0
            if last_page > 1:
                # Tải trang cuối cùng để đếm số bài trang cuối
                last_url = f"{cat['url']}/page/{last_page}"
                last_res = requests.get(last_url, headers=HEADERS, timeout=15)
                if last_res.ok:
                    last_soup = BeautifulSoup(last_res.text, 'html.parser')
                    last_page_count = count_articles_in_page(last_soup)
                    # Tính toán tổng: (số trang trước * 15) + số bài trang cuối
                    total_count = (last_page - 1) * 15 + last_page_count
                    print(f"   -> Tìm thấy {last_page} trang. Trang cuối có {last_page_count} bài.")
                else:
                    # Ước lượng nếu lỗi tải trang cuối
                    total_count = last_page * 15
                    print(f"   -> Tìm thấy {last_page} trang. (Lỗi tải trang cuối, ước lượng)")
            else:
                total_count = p1_count
                print(f"   -> Chỉ có 1 trang với {p1_count} bài.")
                
            print(f"   => ✅ TỔNG CỘNG: {total_count} audio.")
            
            results.append({
                "name": cat["name"],
                "slug": cat["slug"],
                "total": total_count,
                "pages": last_page
            })
            grand_total += total_count
            
        except Exception as e:
            print(f"   ❌ Lỗi phân tích: {e}")
            
        time.sleep(0.5)  # Delay tránh spam server
        
    print("\n" + "="*80)
    print(f"🎉 HOÀN THÀNH THỐNG KÊ!")
    print(f"📊 TỔNG CỘNG TẤT CẢ CÁC CHUYÊN MỤC CÓ: {grand_total} AUDIO.")
    print("="*80)
    
    # Ghi ra tệp JSON báo cáo
    with open("audio-counts-report.json", "w", encoding="utf-8") as f:
        json.dump({"grand_total": grand_total, "categories": results}, f, ensure_ascii=False, indent=2)
        
    print("💾 Kết quả thống kê đã lưu tại: 'audio-counts-report.json'")

if __name__ == "__main__":
    run_counting()
