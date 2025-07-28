import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e5e5e5] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#71717a]">
          © {new Date().getFullYear()} kreangsak.com
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-[#71717a] hover:text-[#4f46e5] transition-colors"
          >
            ช่วยเหลือ
          </a>
          <a
            href="#"
            className="text-sm text-[#71717a] hover:text-[#4f46e5] transition-colors"
          >
            นโยบายความเป็นส่วนตัว
          </a>
          <a
            href="#"
            className="text-sm text-[#71717a] hover:text-[#4f46e5] transition-colors"
          >
            เงื่อนไขการใช้งาน
          </a>
        </div>
      </div>
    </footer>
  );
}
