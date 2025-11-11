// chatbot.js - simple frontend-only chatbot with keyword responses, FAQ buttons, typing indicator, auto-scroll
(function () {
  function createBot() {
    const container = document.createElement('div');
    container.id = 'nm-chatbot';
    container.innerHTML = `
      <div class="nm-chatbot-backdrop" id="nmChatback"></div>
      <div class="nm-chatbot-window" id="nmChatWindow">
        <div class="nm-chatbot-header">
          <div class="nm-title">NetMood 고객센터</div>
          <div class="nm-status" id="nmStatus">온라인</div>
          <button class="nm-close" id="nmCloseBtn">✕</button>
        </div>
        <div class="nm-chat-body" id="nmChatBody"></div>
        <div class="nm-faq" id="nmFaq">
          <button class="faq-btn">업로드 오류</button>
          <button class="faq-btn">위험 알림</button>
          <button class="faq-btn">감정 분석 기준</button>
        </div>
        <div class="nm-input-area">
          <input id="nmInput" placeholder="메시지를 입력하세요..." />
          <button id="nmSend">전송</button>
          <button id="nmReset" title="대화 초기화">초기화</button>
        </div>
      </div>`;
    document.body.appendChild(container);

    // Elements
    const win = document.getElementById('nmChatWindow');
    const body = document.getElementById('nmChatBody');
    const input = document.getElementById('nmInput');
    const send = document.getElementById('nmSend');
    const close = document.getElementById('nmCloseBtn');
    const back = document.getElementById('nmChatback');
    const status = document.getElementById('nmStatus');
    const faq = document.getElementById('nmFaq');
    const reset = document.getElementById('nmReset');

    function appendMessage(who, text) {
      const msg = document.createElement('div');
      msg.className = 'nm-msg ' + (who === 'bot' ? 'bot' : 'user');
      msg.innerHTML = `<div class="nm-text">${text}</div>`;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function botReply(text) {
      // typing indicator
      const t = document.createElement('div');
      t.className = 'nm-typing';
      t.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
      body.appendChild(t); body.scrollTop = body.scrollHeight;
      setTimeout(() => {
        t.remove();
        appendMessage('bot', text);
      }, 700 + Math.random() * 800);
    }

    function smartAnswer(text) {
      const t = text.toLowerCase();
      if (t.includes('업로드') || t.includes('파일')) return 'CSV나 PCAP 파일은 최대 10MB까지 업로드 가능합니다. 업로드가 실패하면 파일명과 크기를 확인해 주세요.';
      if (t.includes('위험') || t.includes('알림')) return '위험 감지 알림은 위험 임계값을 넘었을 때 발송됩니다. 설정 페이지에서 알림 임계값을 조정할 수 있습니다.';
      if (t.includes('감정') || t.includes('분석')) return '감정 분석은 패킷 크기, 지연 및 패턴 기반 규칙을 사용합니다. 상세 규칙은 설정에서 확인하세요.';
      if (t.includes('모니터') || t.includes('실시간')) return '실시간 모니터링은 연결 상태와 지연을 5초 단위로 갱신합니다. 모니터링을 시작/중지할 수 있습니다.';
      if (t.includes('안녕하세요') || t.includes('hi') || t.includes('hello')) return '안녕하세요! 무엇을 도와드릴까요?';
      return '죄송합니다. 요청하신 내용을 정확히 이해하지 못했습니다. 자주 묻는 질문 버튼을 눌러보세요.';
    }

    send.onclick = () => {
      const v = input.value.trim(); if (!v) return;
      appendMessage('user', v); input.value = '';
      const reply = smartAnswer(v);
      botReply(reply);
    };

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { send.click(); } });
    close.onclick = () => { container.remove(); };
    back.onclick = () => { container.remove(); };
    faq.addEventListener('click', (e) => { if (e.target.classList.contains('faq-btn')) { const q = e.target.textContent; appendMessage('user', q); botReply(smartAnswer(q)); } });
    reset.onclick = () => { body.innerHTML = ''; appendMessage('bot', '대화를 초기화했습니다. 무엇을 도와드릴까요?'); };

    // initial greeting
    appendMessage('bot', '안녕하세요! NetMood 고객센터입니다. 궁금하신 점을 입력하시거나 아래 자주 묻는 질문을 눌러주세요.');
    return container;
  }

  // export function to open chatbot
  window.openNetMoodChat = function () {
    if (document.getElementById('nm-chatbot')) return; createBot();
  };
})();
