// src/app/thank-you/page.tsx
export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ขอบคุณสำหรับการสั่งซื้อ
          </h1>
          <p className="text-gray-600 mb-8">
            ระบบปิดรับออเดอร์แล้ว ขอบคุณทุกท่านที่ให้ความสนใจ
          </p>
          <div className="inline-flex items-center justify-center">
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
