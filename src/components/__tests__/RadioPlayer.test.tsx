import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import RadioPlayer from "../RadioPlayer";

// Dữ liệu mock playlist phát thanh
const mockTracks = [
  {
    title: "Phát thanh Minh Huệ: Trừ bỏ chấp trước vào điện thoại số 1",
    url: "https://vi.minghui.org/radio/20250926-TDTH-1.mp3",
    category: "tru-bo-chap-truoc-vao-dien-thoai",
  },
  {
    title: "Cửu Bình bài bình luận 1",
    url: "https://vi.minghui.org/radio/cuu-binh-1.mp3",
    category: "cuu-binh",
  },
  {
    title: "Bài chia sẻ về Ngày Pháp Luân Đại Pháp",
    url: "https://vi.minghui.org/radio/ngay-phap-luan-1.mp3",
    category: "ngay-phap-luan-dai-phap-the-gioi-radio",
  },
];

describe("RadioPlayer Component", () => {
  beforeEach(() => {
    // 1. Mock fetch để trả về playlist giả lập
    jest.spyOn(window, "fetch").mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockTracks),
        ok: true,
      } as Response)
    );

    // 2. Giả lập localStorage
    let store: { [key: string]: string } = {
      // Cho qua thông báo bản quyền để dễ test giao diện chính
      "minhhue_copyright_accepted": "true",
    };
    
    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => store[key] || null);
    jest.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      store[key] = String(value);
    });
    jest.spyOn(Storage.prototype, "clear").mockImplementation(() => {
      store = {};
    });
  });

  afterEach(() => {
    cleanup(); // Đảm bảo dọn sạch DOM sau mỗi bài test
    jest.restoreAllMocks();
  });

  // Helper function để render và đợi component mount hoàn tất
  const renderAndMount = async () => {
    const view = render(<RadioPlayer />);
    
    // Đợi component mount (isMounted thành true) bằng cách kiểm tra sự xuất hiện của nút "Ngẫu nhiên"
    await waitFor(() => {
      expect(screen.getByText("Ngẫu nhiên")).toBeInTheDocument();
    });
    
    return view;
  };

  test("hiển thị trạng thái tải ban đầu và tải danh sách thành công", async () => {
    // 1. Render ban đầu (chưa mount)
    render(<RadioPlayer />);
    
    // Ban đầu isMounted là false, heading là h3
    expect(screen.getByRole("heading", { name: "Phát Thanh Minh Huệ", level: 3 })).toBeInTheDocument();

    // 2. Đợi mount xong và hiển thị playlist
    await waitFor(() => {
      // Sau khi mount, heading là h1
      expect(screen.getByRole("heading", { name: "Phát Thanh Minh Huệ", level: 1 })).toBeInTheDocument();
    });

    // Kiểm tra bài hát đầu tiên được render trong danh sách (sử dụng getAllByText vì có thể trùng với text đang phát)
    expect(screen.getAllByText("Trừ bỏ chấp trước vào điện thoại số 1").length).toBeGreaterThan(0);
  });

  test("hiển thị modal thông báo bản quyền nếu chưa đồng ý", async () => {
    // Ghi đè để chưa chấp nhận bản quyền
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

    render(<RadioPlayer />);

    // Đợi modal bản quyền hiển thị sau khi mount
    await waitFor(() => {
      expect(screen.getByText("Thông báo Bản quyền")).toBeInTheDocument();
    });

    // Click nút Tiếp tục
    const continueBtn = screen.getByRole("button", { name: "Tiếp tục" });
    fireEvent.click(continueBtn);

    // Modal biến mất
    await waitFor(() => {
      expect(screen.queryByText("Thông báo Bản quyền")).not.toBeInTheDocument();
    });
  });

  test("tương tác nút Play/Pause hoạt động và thay đổi trạng thái phát nhạc", async () => {
    await renderAndMount();

    // Tìm nút play chính trên bản Desktop (có class custom-play-main-btn)
    const playButtons = screen.getAllByRole("button", { name: /Phát nhạc/i });
    const desktopPlayBtn = playButtons.find(btn => btn.className.includes("custom-play-main-btn")) || playButtons[0];

    // Click Play
    await act(async () => {
      fireEvent.click(desktopPlayBtn);
    });

    // Kiểm tra xem nút có đổi thành Tạm dừng hay không
    await waitFor(() => {
      const pauseButtons = screen.getAllByRole("button", { name: /Tạm dừng/i });
      expect(pauseButtons.length).toBeGreaterThan(0);
    });

    // Kiểm tra trạng thái hiển thị text
    expect(screen.getByText("Đang phát")).toBeInTheDocument();

    // Click Pause
    const pauseBtn = screen.getAllByRole("button", { name: /Tạm dừng/i })[0];
    await act(async () => {
      fireEvent.click(pauseBtn);
    });

    // Đổi lại thành nút phát nhạc
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Phát nhạc/i }).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Đang dừng")).toBeInTheDocument();
  });

  test("tính năng tìm kiếm hoạt động và lọc đúng danh sách bài", async () => {
    await renderAndMount();

    const playlist = document.querySelector("#playlist");
    expect(playlist).not.toBeNull();

    // Ban đầu cả 2 bài trong group Minh Huệ phải hiển thị trong playlist
    expect(playlist).toHaveTextContent("Trừ bỏ chấp trước vào điện thoại số 1");
    expect(playlist).toHaveTextContent("Bài chia sẻ về Ngày Pháp Luân Đại Pháp");

    // Bấm nút Tìm kiếm để hiển thị ô nhập
    const searchToggleBtn = screen.getByRole("button", { name: "Tìm kiếm phát thanh" });
    fireEvent.click(searchToggleBtn);

    // Tìm ô input tìm kiếm
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm trong 3,400\+ phát thanh/i);
    expect(searchInput).toBeInTheDocument();

    // Nhập từ khóa "điện thoại"
    fireEvent.change(searchInput, { target: { value: "điện thoại" } });

    // Chỉ bài 1 chứa từ "điện thoại" nên chỉ bài 1 hiển thị trong playlist
    expect(playlist).toHaveTextContent("Trừ bỏ chấp trước vào điện thoại số 1");
    expect(playlist).not.toHaveTextContent("Bài chia sẻ về Ngày Pháp Luân Đại Pháp");
  });

  test("chuyển tab hoạt động và hiển thị đúng danh mục", async () => {
    await renderAndMount();

    const playlist = document.querySelector("#playlist");
    expect(playlist).not.toBeNull();

    // Mặc định ở tab "Phát thanh Minh Huệ"
    expect(playlist).toHaveTextContent("Trừ bỏ chấp trước vào điện thoại số 1");
    expect(playlist).not.toHaveTextContent("Cửu Bình bài bình luận 1"); // Thuộc group tu-kiem

    // Click chuyển sang tab "Tứ kiếm"
    const tuKiemTabBtn = screen.getByRole("button", { name: "Tứ kiếm" });
    fireEvent.click(tuKiemTabBtn);

    // Bây giờ bài thuộc Tứ Kiếm hiển thị trong playlist, bài thuộc Minh Huệ biến mất khỏi playlist
    expect(playlist).toHaveTextContent("Cửu Bình bài bình luận 1");
    expect(playlist).not.toHaveTextContent("Trừ bỏ chấp trước vào điện thoại số 1");
  });
});
