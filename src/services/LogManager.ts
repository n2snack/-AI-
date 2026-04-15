import { GoogleGenerativeAI } from '@google/generative-ai';

// 주의: 원래 프론트엔드 코드에 API 키를 두는 것은 위험합니다.
// 이 코드는 데모용으로 작성되었습니다.

export class LogManager {
  static async generateNarrativeLog(day: number, systemLogs: string[], survivorsInfo: string, apiKey: string | null): Promise<string> {
    const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!activeKey || activeKey === 'your_api_key_here') {
      return `[SYSTEM] 설정 메뉴나 환경 변수(.env)에 Gemini API 키가 설정되지 않았습니다.\n\n[원본 이벤트 기록]\n${systemLogs.join('\n')}`;
    }

    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

      const prompt = `
너는 인간 내면의 어둠과 질투를 묘사하는 데 탁월한 하드코어 생존 소설가이다. 
제공된 시스템 데이터와 현재 인물 간의 심리 상태를 바탕으로 1인칭 관찰자 혹 전지적 작가 시점에서 긴박하고 사실적인 생존 일지를 작성하라.

[현재 상황 요약 و 심리 상태]
- 생존 일차: ${day}일차
- 캠프 생존자 (현재 상태 및 인물 간 호감도):
${survivorsInfo}

[오늘 발생한 핵심 사건들]
${systemLogs.join('\n')}

위의 실제 발생한 이벤트들과 인물들의 심리(수치)를 바탕으로 몰입감 넘치는 하나의 문단 혹은 짧은 이야기를 작성해줘. 
특히 단순한 수치 변화보다는 생존자들 사이의 미묘한 시선 교환, 기류, 질투심, 배신감, 그리고 신뢰의 붕괴나 단합 등 인간 관계와 심리적 긴장감에 집중해서 묘사해라. 거짓이나 제공되지 않은 사실은 절대로 지어내지 말되, 있는 감정 수치를 극한으로 끌어올려 문학적으로 훌륭하게 서술하라. (한국어 우선)
`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("AI Narrative Generation Error:", error);
      return `[AI 오류] 서사를 생성하는 데 실패했습니다. 통신 상태나 API 키를 확인하세요.\n\n[원본 기록]\n${systemLogs.join('\n')}`;
    }
  }
}
