import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
	const audioUrl = url.searchParams.get("url");

	if (!audioUrl || !audioUrl.startsWith("https://vi.minghui.org/")) {
		return new Response("Yêu cầu URL không hợp lệ hoặc thiếu tham số.", { status: 400 });
	}

	try {
		// Nhận tiêu đề Range từ client nếu có (giúp trình phát nhạc có thể tua mượt mà)
		const rangeHeader = request.headers.get("range");

		const headers: Record<string, string> = {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			"Referer": "https://vi.minghui.org/",
		};

		if (rangeHeader) {
			headers["Range"] = rangeHeader;
		}

		const response = await fetch(audioUrl, {
			method: "GET",
			headers: headers,
		});

		// Nếu server trả về lỗi, báo lỗi
		if (!response.ok && response.status !== 206) {
			return new Response("Không thể tải tập tin âm thanh từ nguồn gốc.", { status: response.status });
		}

		// Tạo Headers chuyển tiếp về cho client để đảm bảo tính mượt mà và tua seekable
		const responseHeaders = new Headers();
		responseHeaders.set("Content-Type", response.headers.get("content-type") || "audio/mpeg");
		
		if (response.headers.get("content-length")) {
			responseHeaders.set("Content-Length", response.headers.get("content-length")!);
		}
		if (response.headers.get("accept-ranges")) {
			responseHeaders.set("Accept-Ranges", response.headers.get("accept-ranges")!);
		}
		if (response.headers.get("content-range")) {
			responseHeaders.set("Content-Range", response.headers.get("content-range")!);
		}

		// Trả về luồng âm thanh stream trực tiếp trong bộ nhớ
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error("Audio Proxy Error:", error);
		return new Response("Lỗi kết nối hoặc xử lý luồng âm thanh.", { status: 500 });
	}
};
