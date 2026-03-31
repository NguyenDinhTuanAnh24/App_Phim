export interface RedirectPageParams {
  success: boolean;
  message: string;
  subMessage?: string;
  deepLink: string;
  countdown?: number;  // mặc định 5 giây
}

export function buildRedirectPage(params: RedirectPageParams): string {
  const {
    success,
    message,
    subMessage = 'Ứng dụng sẽ tự động mở sau',
    deepLink,
    countdown = 5,
  } = params;

  const icon    = success ? '✅' : '❌';
  const color   = success ? '#10B981' : '#EF4444';
  const bgColor = success ? '#064E3B' : '#7F1D1D';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${message}</title>
  <!-- Tự động đánh thức app sau 1s nếu thanh toán thành công -->
  ${success ? `<meta http-equiv="refresh" content="1;url=${deepLink}">` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont,
        'Segoe UI', sans-serif;
      background: #0A0A0A;
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      text-align: center;
      padding: 40px 24px;
      max-width: 380px;
      width: 100%;
    }

    .icon-box {
      width: 80px;
      height: 80px;
      background: ${color}22;
      border: 2px solid ${color};
      color: ${color};
      font-size: 40px;
      border-radius: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .title {
      font-size: 24px;
      font-weight: 700;
      color: ${color};
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: #9CA3AF;
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .countdown-box {
      background: #1A1A1A;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
      border: 1px solid #333;
    }

    .countdown-number {
      font-size: 56px;
      font-weight: 700;
      color: ${color};
      line-height: 1;
      margin-bottom: 12px;
    }

    .open-btn {
      display: block;
      background: ${color};
      color: #FFFFFF;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      cursor: pointer;
      border: none;
      width: 100%;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .open-btn:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    .close-btn {
      display: block;
      background: #374151;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      cursor: pointer;
      border: none;
      width: 100%;
    }

    .close-btn:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    .hint {
      font-size: 13px;
      color: #6B7280;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon-box">${icon}</div>
    <div class="title">${message}</div>
    <div class="subtitle">${subMessage}</div>

    <div class="countdown-box">
      <div style="font-size: 13px; color: #888; margin-bottom: 12px;">Đang quay lại app sau...</div>
      <div class="countdown-number" id="count">${countdown}</div>
    </div>

    <button type="button" onclick="openApp()" class="open-btn">
      TIẾP TỤC TRÊN APP
    </button>

    <div class="hint">
      ${success 
        ? 'Thanh toán thành công! Vui lòng đóng cửa sổ này để quay về ứng dụng.'
        : 'Đã xảy ra lỗi. Vui lòng đóng cửa sổ và thử lại.'
      }
    </div>
  </div>

  <script>
    const deepLink = '${deepLink}';
    let countdown = ${countdown};

    function openApp() {
      // Thử mở app bằng Deep Link
      window.location.href = deepLink;
    }

    function closeWindow() {
      if (window.close) window.close();
      window.location.href = 'about:blank';
    }

    // Bộ đếm ngược tự động đóng
    const timer = setInterval(() => {
      countdown--;
      document.getElementById('count').textContent = countdown;
      
      if (countdown <= 0) {
        clearInterval(timer);
        closeWindow();
      }
    }, 1000);

    // Dừng đếm nếu window bị ẩn (user đã chuyển tab)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer);
    });

    // Tự động đóng khi tải xong (sau 1s)
    window.onload = function() {
      setTimeout(() => {
        // Chỉ auto close nếu là success
        if (${success}) {
          closeWindow();
        }
      }, 1000);
    };
  </script>
</body>
</html>
  `;
}
