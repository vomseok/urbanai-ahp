// 1단계: 전문가 정보 입력
import { useState } from "react";
import { useSurvey } from "@/contexts/SurveyContext";
import { ExpertInfo } from "@/lib/ahp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, User } from "lucide-react";

const EXPERTISE_OPTIONS = [
  "도시계획 및 공간정보",
  "보건의료 및 공중보건",
  "사회복지 및 돌봄서비스",
  "지역개발 및 농촌계획",
  "행정 및 정책",
  "데이터 분석 및 AI",
  "기타",
];

const EXPERIENCE_OPTIONS = [
  "5년 미만",
  "5~10년",
  "10~15년",
  "15~20년",
  "20년 이상",
];

export default function StepExpert() {
  const { state, setExpert, nextStep, prevStep } = useSurvey();
  const [form, setForm] = useState<ExpertInfo>(state.expert);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpertInfo, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof ExpertInfo, string>> = {};
    if (!form.name.trim()) newErrors.name = "성명을 입력해 주세요.";
    if (!form.organization.trim()) newErrors.organization = "소속 기관을 입력해 주세요.";
    if (!form.position.trim()) newErrors.position = "직위를 입력해 주세요.";
    if (!form.expertise) newErrors.expertise = "전문 분야를 선택해 주세요.";
    if (!form.experience) newErrors.experience = "경력을 선택해 주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setExpert(form);
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-in">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 rounded-full" style={{ background: "oklch(0.26 0.08 255)" }} />
          <span className="text-sm font-medium" style={{ color: "oklch(0.45 0.08 255)" }}>
            1단계 / 전문가 정보
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground">응답자 기본 정보</h2>
        <p className="text-sm text-muted-foreground mt-1 serif-body">
          설문 결과의 신뢰성 확보를 위해 응답자 정보를 입력해 주세요.
          수집된 정보는 연구 목적으로만 활용됩니다.
        </p>
      </div>

      {/* 폼 */}
      <div className="result-card space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <User size={16} style={{ color: "oklch(0.26 0.08 255)" }} />
          <h3 className="text-sm font-semibold text-foreground">기본 정보</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 성명 */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              성명 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="홍길동"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* 소속 기관 */}
          <div className="space-y-1.5">
            <Label htmlFor="organization" className="text-sm font-medium">
              소속 기관 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="organization"
              placeholder="경상북도청"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              className={errors.organization ? "border-destructive" : ""}
            />
            {errors.organization && (
              <p className="text-xs text-destructive">{errors.organization}</p>
            )}
          </div>

          {/* 직위 */}
          <div className="space-y-1.5">
            <Label htmlFor="position" className="text-sm font-medium">
              직위 / 직책 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="position"
              placeholder="연구위원"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className={errors.position ? "border-destructive" : ""}
            />
            {errors.position && (
              <p className="text-xs text-destructive">{errors.position}</p>
            )}
          </div>

          {/* 이메일 (선택) */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              이메일 <span className="text-muted-foreground text-xs">(선택)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gb.go.kr"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* 전문 분야 */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            전문 분야 <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.expertise}
            onValueChange={(v) => setForm({ ...form, expertise: v })}
          >
            <SelectTrigger className={errors.expertise ? "border-destructive" : ""}>
              <SelectValue placeholder="전문 분야를 선택해 주세요" />
            </SelectTrigger>
            <SelectContent>
              {EXPERTISE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.expertise && (
            <p className="text-xs text-destructive">{errors.expertise}</p>
          )}
        </div>

        {/* 경력 */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            관련 분야 경력 <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.experience}
            onValueChange={(v) => setForm({ ...form, experience: v })}
          >
            <SelectTrigger className={errors.experience ? "border-destructive" : ""}>
              <SelectValue placeholder="경력을 선택해 주세요" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.experience && (
            <p className="text-xs text-destructive">{errors.experience}</p>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft size={16} className="mr-2" />
          이전
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-[2] text-white font-semibold"
          style={{ background: "oklch(0.26 0.08 255)" }}
        >
          다음 단계
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
