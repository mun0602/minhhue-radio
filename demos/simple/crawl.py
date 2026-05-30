import os
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://vi.minghui.org/"
}

# Cấu hình các chuyên mục chính và URL tương ứng của Minh Huệ Net
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
        "slug": "bai-chia-se-co-lo-binh-cua-su-phu",
        "url": "https://vi.minghui.org/news/category/bai-chia-se-co-lo-binh-cua-su-phu"
    }
]

# Phân loại chuyên mục con dựa trên tiêu đề
def refine_category_slug(title, parent_slug):
    title_lower = title.lower()
    
    # 1. Các chủ đề con của Ngày Pháp Luân Đại Pháp
    if parent_slug == "ngay-phap-luan-dai-phap-the-gioi-radio":
        if "2025" in title_lower:
            return "ngay-phap-luan-dai-phap-the-gioi-2025"
        elif "2024" in title_lower:
            return "ngay-phap-luan-dai-phap-the-gioi-2024"
        elif "2023" in title_lower:
            return "ngay-phap-luan-dai-phap-the-gioi-2023"
        elif "2022" in title_lower:
            return "ngay-phap-luan-dai-phap-the-gioi-2022"
            
    # 2. Các chủ đề con của Pháp hội Trung Quốc
    if parent_slug == "phap-hoi-trung-quoc-radio":
        if "22" in title_lower or "thứ hai mươi hai" in title_lower:
            return "phap-hoi-trung-quoc-22"
        elif "21" in title_lower or "thứ hai mươi mốt" in title_lower:
            return "phap-hoi-trung-quoc-21"
        elif "20" in title_lower or "thứ hai mươi" in title_lower:
            return "phap-hoi-trung-quoc-20"
        elif "19" in title_lower or "thứ mười chín" in title_lower:
            return "phap-hoi-trung-quoc-19"
            
    return parent_slug

def get_last_page_number(soup):
    pagenavi = soup.find("div", class_="wp-pagenavi")
    if not pagenavi:
        return 1
    
    last_btn = pagenavi.find("a", class_="last")
    if last_btn and "href" in last_btn.attrs:
        href = last_btn["href"]
        match = re.search(r'/page/(\d+)', href)
        if match:
            return int(match.group(1))
            
    pages = []
    for a in pagenavi.find_all("a", class_="page"):
        match = re.search(r'/page/(\d+)', a.get("href", ""))
        if match:
            pages.append(int(match.group(1)))
            
    if pages:
        return max(pages)
        
    return 1

def extract_articles_from_page(soup, base_url):
    ul = soup.find("ul", class_="main-category-articles-list")
    articles = []
    if not ul:
        # Dự phòng
        seen = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            title = a.get_text(strip=True)
            is_valid_title = any(kw in title for kw in ["Phát thanh", "Tin tức", "Câu chuyện", "Tu luyện", "Tuyển tập", "Một niệm", "Đột phá", "Bài chia sẻ", "Thiên Âm"])
            if "/news/" in href and href.endswith(".html") and is_valid_title and not "/category/" in href:
                full_url = href if href.startswith("http") else base_url + href
                if full_url not in seen:
                    seen.add(full_url)
                    articles.append({"title": title, "url": full_url})
        return articles

    for li in ul.find_all("li"):
        a = li.find("a", href=True)
        if a:
            href = a["href"]
            title = a.get_text(strip=True)
            full_url = href if href.startswith("http") else base_url + href
            articles.append({"title": title, "url": full_url})
            
    return articles

def fetch_mp3_url(session, article_url):
    # Tải nội dung bài viết chi tiết và trích xuất link MP3 thực tế
    try:
        res = session.get(article_url, headers=HEADERS, timeout=12)
        if res.ok:
            mp3_match = re.search(r'(https?:)?//vi\.minghui.org/radio/[a-zA-Z0-9_\-\.\/]+\.mp3', res.text, re.IGNORECASE)
            if mp3_match:
                mp3_url = mp3_match.group(0)
                if mp3_url.startswith("//"):
                    mp3_url = "https:" + mp3_url
                return mp3_url
    except Exception as e:
        pass
    return None

def main():
    base_url = "https://vi.minghui.org"
    session = requests.Session()
    
    print("🚀 BẮT ĐẦU CÀO TOÀN BỘ 1,264 AUDIO MINH HUỆ NET BẰNG THREADPOOL SONG SONG...")
    print("="*80)
    
    all_articles_to_crawl = []
    
    # Bước 1: Quét sạch danh sách bài viết từ toàn bộ phân trang của 18 chuyên mục
    for cat_idx, cat in enumerate(TARGET_CATEGORIES):
        print(f"📂 [{cat_idx+1}/{len(TARGET_CATEGORIES)}] Quét danh mục: {cat['name']}...")
        try:
            res = session.get(cat['url'], headers=HEADERS, timeout=15)
            if not res.ok:
                print(f"   ❌ Không thể tải trang 1 (Status: {res.status_code})")
                continue
                
            soup = BeautifulSoup(res.text, 'html.parser')
            last_page = get_last_page_number(soup)
            
            print(f"   -> Phát hiện {last_page} trang phân trang.")
            
            # Quét tất cả các trang
            for page in range(1, last_page + 1):
                page_url = cat['url'] if page == 1 else f"{cat['url']}/page/{page}"
                # Chỉ tải từ trang 2 trở đi vì trang 1 đã có soup sẵn
                if page > 1:
                    try:
                        p_res = session.get(page_url, headers=HEADERS, timeout=15)
                        if p_res.ok:
                            p_soup = BeautifulSoup(p_res.text, 'html.parser')
                            page_articles = extract_articles_from_page(p_soup, base_url)
                        else:
                            page_articles = []
                    except Exception:
                        page_articles = []
                else:
                    page_articles = extract_articles_from_page(soup, base_url)
                    
                # Gán parent slug để phân loại sau này
                for art in page_articles:
                    art["parent_slug"] = cat["slug"]
                    all_articles_to_crawl.append(art)
                    
                print(f"      Scanned page {page}/{last_page}: Lấy được {len(page_articles)} bài viết.")
                time.sleep(0.1)  # Delay nhẹ khi quét danh mục
                
        except Exception as e:
            print(f"   ❌ Lỗi quét danh mục {cat['name']}: {e}")
            
    total_articles = len(all_articles_to_crawl)
    print("="*80)
    print(f"📋 THU THẬP THÀNH CÔNG: {total_articles} bài viết cần cào MP3.")
    print("🚀 Bắt đầu cào song song 8 luồng lấy file MP3...")
    print("="*80)
    
    playlist = []
    completed_count = 0
    success_count = 0
    
    # Định nghĩa hàm xử lý từng bài viết chạy trong Thread
    def process_task(art):
        mp3_url = fetch_mp3_url(session, art["url"])
        if mp3_url:
            final_cat = refine_category_slug(art["title"], art["parent_slug"])
            return {
                "title": art["title"],
                "url": mp3_url,
                "category": final_cat
            }
        return None

    # Chạy song song bằng ThreadPoolExecutor với 8 workers
    with ThreadPoolExecutor(max_workers=8) as executor:
        # Gửi tất cả các task cào vào ThreadPool
        future_to_art = {executor.submit(process_task, art): art for art in all_articles_to_crawl}
        
        for future in as_completed(future_to_art):
            art = future_to_art[future]
            completed_count += 1
            
            try:
                track = future.result()
                if track:
                    playlist.append(track)
                    success_count += 1
                    if success_count % 10 == 0 or completed_count == total_articles:
                        print(f"   [⏳ {completed_count}/{total_articles}] Cào thành công: {success_count} bài.")
            except Exception as e:
                pass
                
    # Ghi đè trực tiếp kết quả vào file JSON radio-playlist.json
    output_file = "radio-playlist.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(playlist, f, ensure_ascii=False, indent=2)
        
    print("\n" + "="*80)
    print(f"🎉 HOÀN THÀNH CÀO TOÀN BỘ DỮ LIỆU CỰC KỲ THÀNH CÔNG!")
    print(f"💾 Tổng số bài viết quét được: {total_articles} bài.")
    print(f"💾 Tổng số audio cào thành công: {success_count} bài.")
    print(f"💾 Danh sách playlist đã lưu đè tại: '{output_file}'")
    print("="*80)

if __name__ == "__main__":
    main()
