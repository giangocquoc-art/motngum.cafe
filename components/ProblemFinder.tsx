"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getServiceHref, SERVICES } from "@/data/site";

const problems = [
  { id: "website", label: "Tôi cần một website", service: "thiet-ke-website" },
  { id: "chatbot", label: "Tôi muốn có chatbot AI", service: "chatbot-ai" },
  { id: "manual", label: "Tôi đang làm quá nhiều việc thủ công", service: "tu-dong-hoa-quy-trinh" },
  { id: "data", label: "Dữ liệu của tôi đang rời rạc", service: "xu-ly-du-lieu" },
  { id: "content", label: "Tôi cần quản lý nội dung và đăng bài", service: "ho-tro-dang-bai" },
  { id: "interaction", label: "Tôi cần quản lý bình luận, tin nhắn và khách hàng tiềm năng", service: "ho-tro-tuong-tac" },
  { id: "ads", label: "Tôi muốn có thêm khách từ quảng cáo", service: "quang-cao" },
  { id: "learn", label: "Tôi muốn học cách dùng AI", service: "dao-tao-ai-co-ban" },
  { id: "unknown", label: "Tôi chưa biết nên bắt đầu từ đâu", service: "tu-van-marketing" },
] as const;

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
      <section className="finder-result" aria-label="Gợi ý giải pháp">
        <p className="eyebrow">Gợi ý đầu tiên</p>
        <h2>{service.title}</h2>
        <p>{service.summary}</p>
        <dl>
          <div><dt>Mục tiêu</dt><dd>{goal}</dd></div>
          <div><dt>Chi phí</dt><dd>{service.price}</dd></div>
        </dl>
        <div className="finder-actions">
          <Link className="button button-dark" href={getServiceHref(service.slug)}>
            Xem giải pháp
          </Link>
          <Link className="button button-light" href={`/tu-van-marketing?service=${service.slug}`}>
            Nhận tư vấn miễn phí
          </Link>
        </div>
        <button className="reset-button" type="button" onClick={() => { setProblem(null); setGoal(null); }}>
          Chọn lại
        </button>
      </section>
    );
  }

  const progressValue = problem ? 100 : 50;

  return (
    <section className="problem-finder" aria-labelledby="finder-title">
      <div className="finder-progress">
        <span>{problem ? "Bước 2/2" : "Bước 1/2"}</span>
        <progress
          className="finder-progress-bar"
          value={progressValue}
          max={100}
          aria-label="Tiến trình chọn vấn đề"
        >
          {progressValue}%
        </progress>
      </div>

      {!problem ? (
        <>
          <p className="eyebrow">Kể Một Ngụm nghe nhé</p>
          <h2 id="finder-title">Việc gì đang làm bạn mất thời gian nhất?</h2>
          <ul className="choice-grid" role="list">
            {problems.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => setProblem(item)}>
                  <span>{item.label}</span>
                  <b aria-hidden="true">→</b>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button className="back-button" type="button" onClick={() => setProblem(null)}>← Quay lại</button>
          <p className="eyebrow">Mục tiêu bạn muốn ưu tiên</p>
          <h2 id="finder-title">Bạn muốn cải thiện điều gì trước?</h2>
          <ul className="choice-grid goal-grid" role="list">
            {goals.map((item) => (
              <li key={item}>
                <button type="button" onClick={() => setGoal(item)}>
                  <span>{item}</span>
                  <b aria-hidden="true">→</b>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
