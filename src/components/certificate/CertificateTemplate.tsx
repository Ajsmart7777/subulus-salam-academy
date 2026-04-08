import { forwardRef } from "react";
import logoIcon from "@/assets/logo-icon.png";

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
        className="relative w-[900px] h-[636px] overflow-hidden"
        style={{
          fontFamily: "'Amiri', serif",
          background: "linear-gradient(135deg, #f5f5f0 0%, #ffffff 40%, #f0eded 70%, #f5f5f0 100%)",
        }}
      >
        {/* Marble texture overlay */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg width="100%" height="100%">
            <defs>
              <filter id="marble">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="2" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#marble)" opacity="0.5" />
          </svg>
        </div>

        {/* Top-left green curved corner */}
        <div className="absolute top-0 left-0 w-[280px] h-[200px] overflow-hidden">
          <div
            className="absolute w-[500px] h-[400px]"
            style={{
              background: "linear-gradient(135deg, #1a4d2e 0%, #2D5A3D 40%, #3a7a52 100%)",
              borderRadius: "0 0 100% 0",
              top: "-200px",
              left: "-220px",
            }}
          />
          <div
            className="absolute w-[500px] h-[400px]"
            style={{
              background: "linear-gradient(135deg, rgba(200,169,94,0.8) 0%, rgba(200,169,94,0.4) 100%)",
              borderRadius: "0 0 100% 0",
              top: "-195px",
              left: "-215px",
              clipPath: "polygon(100% 95%, 100% 100%, 95% 100%)",
            }}
          />
        </div>

        {/* Bottom-right green curved corner */}
        <div className="absolute bottom-0 right-0 w-[280px] h-[200px] overflow-hidden">
          <div
            className="absolute w-[500px] h-[400px]"
            style={{
              background: "linear-gradient(315deg, #1a4d2e 0%, #2D5A3D 40%, #3a7a52 100%)",
              borderRadius: "100% 0 0 0",
              bottom: "-200px",
              right: "-220px",
            }}
          />
        </div>

        {/* Gold border frame */}
        <div
          className="absolute"
          style={{
            top: "35px",
            left: "55px",
            right: "35px",
            bottom: "55px",
            border: "1.5px solid #C8A95E",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-20 text-center">
          {/* Logo */}
          <div className="mb-2">
            <img src={logoIcon} alt="Sabilul Jannah" className="h-16 w-16 mx-auto rounded-md" />
          </div>

          {/* Bismillah */}
          <p className="text-[#C8A95E] text-base mb-1" style={{ fontFamily: "'Amiri', serif" }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Academy name */}
          <div className="mb-1">
            <h2 className="text-[#2D5A3D] text-sm font-bold tracking-[0.3em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
              Sabilul Jannah Academy
            </h2>
            <p className="text-[#C8A95E] text-xs tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              International Online Islamiyya
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2 w-72">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C8A95E]" />
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#C8A95E]">
              <path d="M12 2L14.5 9.5H22L16 14L18 21.5L12 17L6 21.5L8 14L2 9.5H9.5L12 2Z" fill="currentColor" />
            </svg>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C8A95E]" />
          </div>

          {/* Certificate title */}
          <h1 className="text-[#2D5A3D] text-4xl font-bold mb-0.5" style={{ fontFamily: "'Amiri', serif" }}>
            Certificate of Completion
          </h1>
          <p className="text-[#C8A95E]/70 text-sm mb-3" style={{ fontFamily: "'Amiri', serif" }}>
            شهادة إتمام
          </p>

          {/* Presented to */}
          <p className="text-[#6B7B6E] text-xs mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
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
          <p className="text-[#6B7B6E] text-xs max-w-lg leading-relaxed mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            has successfully completed all modules, assessments, and requirements of the course
          </p>

          {/* Course name */}
          <div className="mb-1">
            <h3 className="text-[#2D5A3D] text-xl font-bold" style={{ fontFamily: "'Amiri', serif" }}>
              {courseName}
            </h3>
            {courseNameAr && (
              <p className="text-[#C8A95E]/60 text-sm" style={{ fontFamily: "'Amiri', serif" }}>
                {courseNameAr}
              </p>
            )}
          </div>

          <p className="text-[#6B7B6E] text-[10px] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            offered by Sabilul Jannah Academy
          </p>

          {/* Footer details */}
          <div className="flex items-end justify-between w-full px-10">
            <div className="text-left">
              <p className="text-[#6B7B6E] text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Date of Issue
              </p>
              <p className="text-[#2D5A3D] text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {issuedDate}
              </p>
            </div>

            {/* Seal */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#C8A95E]/50 flex items-center justify-center bg-[#C8A95E]/5">
                <svg viewBox="0 0 48 48" className="w-9 h-9 text-[#C8A95E]/60">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <text x="24" y="20" textAnchor="middle" fill="currentColor" fontSize="6" fontFamily="Amiri">سبيل</text>
                  <text x="24" y="30" textAnchor="middle" fill="currentColor" fontSize="6" fontFamily="Amiri">الجنة</text>
                </svg>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[#6B7B6E] text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
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
