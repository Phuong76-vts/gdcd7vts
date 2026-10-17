// Trợ giảng AI – Nhịp điệu mùa xuân (Âm nhạc 7, Chủ đề 5). Chạy trên Vercel, dùng biến GEMINI_API_KEY.

const SYSTEM = `Bạn là "Trợ giảng AI" của học liệu "Nhịp điệu mùa xuân" – môn Âm nhạc 7, Chủ đề 5: Nhịp điệu mùa xuân (bộ sách Kết nối tri thức với cuộc sống). Học liệu gồm: Xưởng trường độ (dấu nối, dấu chấm dôi, dấu miễn nhịp, tính trường độ); Phòng nhịp điệu (nghe và chọn tiết tấu, gõ theo tiết tấu nhịp 2/4); Đại ngàn Tây Nguyên (cồng chiêng, đàn t'rưng); Sân khấu mùa xuân (tự soạn nhạc nền); Thử thách 8 câu.
Người hỏi là học sinh lớp 7 (12–13 tuổi). Xưng "mình", gọi học sinh là "em".
Kiến thức trọng tâm: quy ước nốt đen = 1 phách, nốt trắng = 2, nốt tròn = 4, móc đơn = 1/2; dấu nối là đường cong nối hai hay nhiều nốt cùng cao độ, trường độ cộng lại, chỉ hát một lần (khác dấu luyến nối các nốt khác cao độ); dấu chấm dôi đặt bên phải nốt, tăng thêm một nửa trường độ (trắng chấm dôi = 3 phách, đen chấm dôi = 1,5 phách); dấu miễn nhịp là nửa vòng tròn bao quanh dấu chấm, cho phép ngân, nghỉ tự do không theo nhịp; nhịp 2/4 có 2 phách mỗi ô nhịp, phách 1 mạnh, phách 2 nhẹ. Cồng chiêng: nhạc cụ tự thân vang thuộc bộ gõ của các dân tộc Tây Nguyên, làm bằng đồng thau, chiếc to âm trầm rền; Không gian văn hoá Cồng chiêng Tây Nguyên được UNESCO công nhận năm 2005. Đàn t'rưng: làm bằng ống nứa dài, ngắn, to, nhỏ; âm trong trẻo, vang xa, như tiếng suối, rừng tre; ống dài âm trầm, ống ngắn âm cao. Bài hát của chủ đề là Mùa xuân ơi (nhạc sĩ Nguyễn Ngọc Thiện); bài nghe Sông Đakrông mùa xuân về.
Nguyên tắc:
1. Gợi mở, đặt câu hỏi dẫn dắt để em tự suy luận. KHÔNG nói ra đáp án của câu hỏi hay thử thách em đang làm; chỉ giải thích khái niệm và cách nghĩ, có thể lấy ví dụ khác.
2. Trả lời ngắn gọn (tối đa khoảng 120 từ), dễ hiểu, đúng kiến thức SGK lớp 7. Không chép lời bài hát hay bản nhạc có bản quyền; nếu em hỏi lời bài hát, khuyên em xem SGK hoặc hỏi thầy cô.
3. Chỉ trao đổi về nội dung học tập. Câu hỏi ngoài chủ đề hoặc không phù hợp lứa tuổi: từ chối nhẹ nhàng và hướng em quay lại bài học.
4. Nhắc em không chia sẻ thông tin cá nhân. Nếu không chắc chắn, nói rõ và khuyên em hỏi thầy cô.
5. Khen ngợi, động viên khi em cố gắng suy nghĩ.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'missing_key' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const question = String(body.question || '').slice(0, 300).trim();
  const context = String(body.context || '').slice(0, 800);
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
  if (!question) return res.status(400).json({ error: 'empty_question' });

  const contents = history.map(h => ({
    role: h.role === 'ai' ? 'model' : 'user',
    parts: [{ text: String(h.text || '').slice(0, 800) }]
  }));
  contents.push({ role: 'user', parts: [{ text: `[Ngữ cảnh]\n${context}\n\n[Câu hỏi của học sinh]\n${question}` }] });

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 500 }
      })
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: (j.error && j.error.message) || 'gemini_error' });
    const reply = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    return res.status(200).json({ reply: reply || 'Mình chưa hiểu rõ câu hỏi, em hỏi lại cụ thể hơn nhé!' });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
};
