"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SERVICES } from "@/data/site";

const problems = [
  { id: "website", label: "Tôi cần một website", service: "thiet-ke-website" },
  { id: "chatbot", label: "Tôi muốn có chatbot AI", service: "chatbot-ai" },
  { id: "manual", label: "Tôi đang làm việc thủ công quá nhiều", service: "tu-dong-hoa-quy-trinh" },
  { id: "data", label: "Dữ liệu của tôi đang rời rạc", service: "xu-ly-du-lieu" },
  { id: "content", label: "Tôi cần quản lý nội dung và đăng bài", service: "ho-tro-dang-bai" },
  { id: "interaction", label: "Tôi cần quản lý bình luận, tin nhắn, lead", service: "ho-tro-tuong-tac" },
  { id: "ads", label: "Tôi cần thêm khách từ quảng cáo", service: "quang-cao" },
  { id: "learn", label: "Tôi muốn học sử dụng AI", service: "dao-tao-ai-co-ban" },
  { id: "unknown", label: "Tôi chưa biết nên bắt đầu từ đâu", service: "tu-van-marketing" },
];

const goals = [
  "Có thêm khách hàng",
  "Tiết kiệm thời gian",
  "Làm thương hiệu chuyên nghiệp hơn",
  "Giảm việc lặp lại",
  "Quản lý dữ liệu rõ hơn",
  "Bắt đầu với ngân sách nhỏ",
];

export default function ProblemFinder() {
  const [problem, setProblem] = useState<(typeof problems)[number] | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  const service = useMemo(
    () => SERVICES.find((item) => item.slug === problem?.service),
    [problem]
  );

  if (problem && goal && service) {
    return (
      <div className="finder-result">
        <span className="eyebrow">Gợi ý đầu tiên</span>
        <h2>{service.title}</h2>
        <p>{service.summary}</p>
        <dl>
          <div><dt>Mục tiêu</dt><dd>{goal}</dd></div>
          <div><dt>Chi phí</dt><dd>{service.price}</dd></div>
        </dl>
        <div className="finder-actions">
          <Link className="button button-dark" href={`/dich-vu/${service.slug}`}>
            Xem giải pháp
          </Link>
          <Link className="button button-light" href={`/tu-van-marketing?service=${service.slug}`}>
            Nhận tư vấn miễn phí
          </Link>
        </div>
        <button className="reset-button" type="button" onClick={() => { setProblem(null); setGoal(null); }}>
          Chọn lại
        </button>
      </div>
    );
  }

  return (
    <div className="problem-finder">
      <div className="finder-progress">
        <span>{problem ? "Bước 2/2" : "Bước 1/2"}</span>
        <div><i style={{ width: problem ? "100%" : "50%" }} /></div>
      </div>

      {!problem ? (
        <>
          <span className="eyebrow">Kể Một Ngụm nghe</span>
          <h2>Việc gì đang làm bạn mệt nhất?</h2>
          <div className="choice-grid">
            {problems.map((item) => (
              <button type="button" key={item.id} onClick={() => setProblem(item)}>
                <span>{item.label}</span>
                <b>→</b>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button className="back-button" type="button" onClick={() => setProblem(null)}>← Quay lại</button>
          <span className="eyebrow">Mục tiêu ưu tiên</span>
          <h2>Bạn muốn thay đổi điều gì trước?</h2>
          <div className="choice-grid goal-grid">
            {goals.map((item) => (
              <button type="button" key={item} onClick={() => setGoal(item)}>
                <span>{item}</span>
                <b>→</b>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
