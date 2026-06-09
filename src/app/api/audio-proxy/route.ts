import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const audioUrl = searchParams.get("url");

  if (!audioUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Giải mã URL
  const decodedUrl = decodeURIComponent(audioUrl);

  // Chuẩn bị headers gửi tới server đích
  const headers = new Headers();
  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    headers.set("Range", rangeHeader);
  }

  try {
    const response = await fetch(decodedUrl, {
      method: "GET",
      headers: headers,
    });

    // Tạo headers phản hồi để bypass CORS và hỗ trợ Range Requests
    const responseHeaders = new Headers();
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type");
    
    // Copy các headers quan trọng từ server gốc
    const headersToCopy = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
      "etag",
      "last-modified",
    ];

    headersToCopy.forEach((headerName) => {
      const val = response.headers.get(headerName);
      if (val) {
        responseHeaders.set(headerName, val);
      }
    });

    // Đảm bảo các headers cần thiết cho audio player hoạt động mượt mà
    if (!responseHeaders.has("accept-ranges")) {
      responseHeaders.set("accept-ranges", "bytes");
    }
    if (!responseHeaders.has("content-type")) {
      responseHeaders.set("content-type", "audio/mpeg");
    }

    // Trả về luồng dữ liệu (ReadableStream)
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Audio proxy error:", error);
    return new NextResponse("Error fetching audio source", { status: 500 });
  }
}

export async function OPTIONS() {
  const responseHeaders = new Headers();
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type");
  return new NextResponse(null, {
    status: 204,
    headers: responseHeaders,
  });
}
