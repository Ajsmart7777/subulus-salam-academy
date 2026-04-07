import { forwardRef } from "react";

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  courseNameAr?: string;
  certificateNumber: string;
  issuedDate: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, courseName, courseNameAr, certificateNumber, issuedDate }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-[900px] h-[636px] bg-[#FDFBF5] overflow-hidden"
        style={{ fontFamily: "'Amiri', serif" }}
      >
        {/* Outer ornamental border */}
        <div className="absolute inset-3 border-2 border-[#C8A95E]/60 rounded-sm" />
        <div className="absolute inset-5 border border-[#C8A95E]/30 rounded-sm" />

        {/* Corner ornaments */}
        {[
          "top-6 left-6",
          "top-6 right-6 rotate-90",
          "bottom-6 left-6 -rotate-90",
          "bottom-6 right-6 rotate-180",
        ].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-16 h-16`}>
            <svg viewBox="0 0 64 64" className="w-full h-full text-[#C8A95E]/50">
              <path
                d="M0 0 Q32 4 32 32 Q4 32 0 0Z"
                fill="currentColor"
              />
              <path
                d="M8 0 Q32 8 32 24 Q8 24 8 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </svg>
          </div>
        ))}

        {/* Top geometric Islamic pattern band */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2D5A3D] via-[#C8A95E] to-[#2D5A3D]" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2D5A3D] via-[#C8A95E] to-[#2D5A3D]" />

        {/* Subtle watermark pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="28" fill="none" stroke="#2D5A3D" strokeWidth="0.5" />
                <circle cx="30" cy="30" r="20" fill="none" stroke="#2D5A3D" strokeWidth="0.5" />
                <line x1="30" y1="2" x2="30" y2="58" stroke="#2D5A3D" strokeWidth="0.3" />
                <line x1="2" y1="30" x2="58" y2="30" stroke="#2D5A3D" strokeWidth="0.3" />
                <line x1="10" y1="10" x2="50" y2="50" stroke="#2D5A3D" strokeWidth="0.3" />
                <line x1="50" y1="10" x2="10" y2="50" stroke="#2D5A3D" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-16 text-center">
          {/* Bismillah */}
          <p className="text-[#C8A95E] text-lg mb-1" style={{ fontFamily: "'Amiri', serif" }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Academy name */}
          <div className="mb-2">
            <h2 className="text-[#2D5A3D] text-sm font-bold tracking-[0.3em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
              Subulus-Salam Academy
            </h2>
            <p className="text-[#C8A95E] text-xs tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              سُبُل السَّلام
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-3 w-80">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C8A95E]" />
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#C8A95E]">
              <path d="M12 2L14.5 9.5H22L16 14L18 21.5L12 17L6 21.5L8 14L2 9.5H9.5L12 2Z" fill="currentColor" />
            </svg>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C8A95E]" />
          </div>

          {/* Certificate title */}
          <h1 className="text-[#2D5A3D] text-4xl font-bold mb-1" style={{ fontFamily: "'Amiri', serif" }}>
            Certificate of Completion
          </h1>
          <p className="text-[#C8A95E]/80 text-base mb-4" style={{ fontFamily: "'Amiri', serif" }}>
            شهادة إتمام
          </p>

          {/* Presented to */}
          <p className="text-[#6B7B6E] text-sm mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            This is to certify that
          </p>

          {/* Student name */}
          <div className="mb-2">
            <h2
              className="text-[#2D5A3D] text-3xl font-bold px-8 pb-1 border-b-2 border-[#C8A95E]/40"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {studentName}
            </h2>
          </div>

          {/* Course completion text */}
          <p className="text-[#6B7B6E] text-sm max-w-lg leading-relaxed mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            has successfully completed all modules, assessments, and requirements of the course
          </p>

          {/* Course name */}
          <div className="mb-1">
            <h3 className="text-[#2D5A3D] text-xl font-bold" style={{ fontFamily: "'Amiri', serif" }}>
              {courseName}
            </h3>
            {courseNameAr && (
              <p className="text-[#C8A95E]/70 text-sm" style={{ fontFamily: "'Amiri', serif" }}>
                {courseNameAr}
              </p>
            )}
          </div>

          <p className="text-[#6B7B6E] text-xs mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            offered by Subulus-Salam Academy
          </p>

          {/* Footer details */}
          <div className="flex items-end justify-between w-full mt-2 px-8">
            <div className="text-left">
              <p className="text-[#6B7B6E] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                Date of Issue
              </p>
              <p className="text-[#2D5A3D] text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {issuedDate}
              </p>
            </div>

            {/* Seal */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#C8A95E]/50 flex items-center justify-center bg-[#C8A95E]/5">
                <svg viewBox="0 0 48 48" className="w-10 h-10 text-[#C8A95E]/60">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <text x="24" y="20" textAnchor="middle" fill="currentColor" fontSize="6" fontFamily="Amiri">سُبُل</text>
                  <text x="24" y="30" textAnchor="middle" fill="currentColor" fontSize="6" fontFamily="Amiri">السَّلام</text>
                </svg>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[#6B7B6E] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                Certificate No.
              </p>
              <p className="text-[#2D5A3D] text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {certificateNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;
