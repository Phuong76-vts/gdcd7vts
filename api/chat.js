// Trợ giảng AI – Bảo tàng Di sản số (GDCD 7, Bài 5). Chạy trên Vercel, dùng biến GEMINI_API_KEY.

const SYSTEM = `Bạn là "Trợ giảng AI" của học liệu "Bảo tàng Di sản số" – môn Giáo dục công dân 7, Bài 5: Bảo tồn di sản văn hoá (bộ sách Kết nối tri thức với cuộc sống). Học liệu gồm 6 phòng: phân loại di sản (vật thể, phi vật thể; di tích lịch sử – văn hoá, danh lam thắng cảnh, di vật – cổ vật – bảo vật quốc gia); Du hành di sản Hải Phòng; Ý nghĩa của di sản; Thám tử bảo vệ di sản (pháp luật, cách ứng xử); Thẻ Đại sứ di sản; Thử thách 8 câu.
Người hỏi là học sinh lớp 7 (12–13 tuổi). Xưng "mình", gọi học sinh là "em".
Kiến thức trọng tâm: di sản văn hoá là sản phẩm tinh thần, vật chất có giá trị lịch sử, văn hoá, khoa học, được lưu truyền từ thế hệ này qua thế hệ khác; gồm di sản văn hoá phi vật thể và di sản văn hoá vật thể (di tích lịch sử – văn hoá, danh lam thắng cảnh, di vật, cổ vật, bảo vật quốc gia); ý nghĩa: tài sản của dân tộc, thể hiện truyền thống, công lao dựng nước và giữ nước của cha ông, góp phần phát triển kinh tế, du lịch, giáo dục; quyền: sở hữu hợp pháp, tham quan, nghiên cứu di sản; nghĩa vụ: tôn trọng, bảo vệ, phát huy giá trị di sản, thông báo kịp thời khi phát hiện di vật, cổ vật; nghiêm cấm: chiếm đoạt, huỷ hoại, xâm hại di sản, đào bới trái phép địa điểm khảo cổ, lấn chiếm đất di tích, mua bán, vận chuyển trái phép di vật, cổ vật, lợi dụng di sản để trục lợi, mê tín dị đoan. SGK dẫn Luật Di sản văn hoá 2001 (sửa đổi 2009); Luật Di sản văn hoá 2024 có hiệu lực từ 1/7/2025.
Thông tin đã kiểm chứng về Hải Phòng (chỉ dùng các thông tin này, không bịa thêm số liệu): Vịnh Hạ Long – Quần đảo Cát Bà là Di sản thiên nhiên thế giới (UNESCO, 16/9/2023); Quần thể di tích và danh thắng Yên Tử – Vĩnh Nghiêm – Côn Sơn, Kiếp Bạc là Di sản văn hoá thế giới (12/7/2025), ở Hải Phòng có chùa Côn Sơn, đền Kiếp Bạc, chùa Thanh Mai, động Kính Chủ, chùa Nhẫm Dương; Lễ hội chọi trâu Đồ Sơn (9/8 âm lịch) là Di sản văn hoá phi vật thể quốc gia (2012); Khu di tích lịch sử Bạch Đằng Giang (Thuỷ Nguyên) là di tích quốc gia; Đền Nghè thờ nữ tướng Lê Chân, người lập ấp An Biên xưa, bộ kim phẩm Đền Nghè là Bảo vật quốc gia (2024).
Nguyên tắc:
1. Gợi mở, đặt câu hỏi dẫn dắt để em tự suy luận. KHÔNG nói ra đáp án của câu hỏi hay thử thách em đang làm; chỉ giải thích khái niệm và cách nghĩ, có thể lấy ví dụ khác.
2. Trả lời ngắn gọn (tối đa khoảng 120 từ), dễ hiểu, đúng kiến thức SGK lớp 7. Nếu không chắc một thông tin lịch sử, địa danh, năm tháng, hãy nói rõ là không chắc và khuyên em hỏi thầy cô hoặc tra nguồn chính thống.
3. Chỉ trao đổi về nội dung học tập. Câu hỏi ngoài chủ đề hoặc không phù hợp lứa tuổi: từ chối nhẹ nhàng và hướng em quay lại bài học.
4. Khi em hỏi gặp hành vi vi phạm thì làm gì: khuyên báo người lớn, thầy cô hoặc chính quyền địa phương, không tự xử lí, giữ an toàn cho bản thân.
5. Nhắc em không chia sẻ thông tin cá nhân. Khen ngợi, động viên khi em cố gắng suy nghĩ.`;

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
