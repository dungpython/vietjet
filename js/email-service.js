/**
 * Email Service Adapter for Vietjet Travel Prototype
 * Conforms to 01_PROJECT_REQUIREMENTS.md (Section 11) & 05_TECHNICAL_ARCHITECTURE.md
 * Never stores Gmail passwords or private secrets in frontend code.
 */

export const RECIPIENT_EMAIL = 'nvhai061993@gmail.com';

/**
 * Send booking confirmation.
 * In safe demo mode, this returns not_configured to prevent insecure credential exposure.
 */
export async function sendBookingConfirmation(booking) {
  // Provider-neutral default safe response
  return {
    success: false,
    status: 'not_configured',
    message: 'Chế độ demo an toàn: Không cấu hình tài khoản gửi trực tiếp trên client để bảo vệ an toàn thông tin mật khẩu.'
  };
}

/**
 * Generates a standard mailto: link for the customer booking confirmation
 */
export function generateMailtoLink(booking) {
  const subject = encodeURIComponent(`[Vietjet Demo] Xác nhận đặt vé & tour - Mã ${booking.booking_reference}`);
  
  let itemsList = '';
  if (booking.items && booking.items.length > 0) {
    itemsList = booking.items.map(i => `- ${i.item_name} (Số lượng: ${i.quantity}, Giá: ${i.unit_price} ₫)`).join('\n');
  }

  const bodyText = `Kính gửi Bộ phận Chăm sóc Khách hàng Vietjet,

Tôi xin gửi thông tin xác nhận đặt chỗ dịch vụ thử nghiệm:

Mã đặt chỗ: ${booking.booking_reference}
Họ và tên: ${booking.customer_name}
Email: ${booking.customer_email}
Số điện thoại: ${booking.customer_phone}
Tổng tiền: ${booking.total_amount} ₫

Danh sách dịch vụ:
${itemsList}

Ghi chú: ${booking.customer_note || 'Không có'}

(Đây là email xác nhận phát sinh từ bản thử nghiệm website Vietjet Travel Prototype)`;

  const body = encodeURIComponent(bodyText);
  return `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
}
