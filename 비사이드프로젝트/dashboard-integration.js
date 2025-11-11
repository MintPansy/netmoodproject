/**
 * NetMood Analyzer - 통합 대시보드 JavaScript
 * 새로운 대시보드와 기존 실시간 시스템을 연결하는 클라이언트 코드
 */

class NetMoodDashboard {
  constructor() {
    // Use relative API base by default so frontend calls '/api/*' on same host.
    // You can override by setting window.API_BASE_URL before this script loads.
    this.apiBaseUrl = (window.API_BASE_URL || '/api');
    this.updateInterval = 5000; // 5초마다 업데이트
    this.isMonitoring = false;
    this.currentTab = 'overview';

    // 차트 인스턴스들
    this.hourlyChart = null;
    this.emotionChart = null;
    this.emotionDetailChart = null;

    // 데이터 캐시
    this.cachedData = {
      health: null,
      emotions: null,
      monitoring: null,
      threats: null,
      history: null,
      csvRows: [] // 업로드된 CSV 데이터 캐시
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.startAutoUpdate();
    this.startTimeUpdate();
    this.setupNetworkMonitoring();
    this.setupDeployButton();
    this.setupVercelSetupModal();
    console.log('NetMood 대시보드가 초기화되었습니다.');
  }

  setupEventListeners() {
    // 탭 전환 이벤트
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.switchTab(tabName);
      });
    });

    // 액션 버튼 이벤트
    this.setupActionButtons();

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            this.switchTab('overview');
            break;
          case '2':
            e.preventDefault();
            this.switchTab('emotions');
            break;
          case '3':
            e.preventDefault();
            this.switchTab('monitoring');
            break;
          case '4':
            e.preventDefault();
            this.switchTab('threats');
            break;
          case '5':
            e.preventDefault();
            this.switchTab('history');
            break;
        }
      }
    });

    // CSV 업로드 처리
    const csvInput = document.getElementById('csvFileInput');
    if (csvInput) {
      csvInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          this.cachedData.csvRows = this.parseCsv(text);
          this.showSuccess('CSV 데이터가 로드되었습니다.');
          this.applyCsvToChartsAndCards();
        } catch (err) {
          console.error('CSV 파싱 실패:', err);
          this.showError('CSV 파싱에 실패했습니다.');
        }
      });
    }

    // 시간 범위 버튼
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.time-range-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyCsvToChartsAndCards();
      });
    });
    // 상세 분석 탭: 업로드 입력들과 버튼
    const csvAnalysis1 = document.getElementById('csvFileInputAnalysis');
    const csvAnalysis2 = document.getElementById('csvFileInputAnalysis2');
    [csvAnalysis1, csvAnalysis2].forEach(i => {
      if (i) i.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          this.cachedData.csvRows = this.parseCsvAuto(text);
          this.showSuccess('CSV 데이터가 상세 분석에 로드되었습니다.');
          this.renderAnalysisView();
          this.applyCsvToChartsAndCards();
        } catch (err) {
          console.error('CSV 파싱 실패:', err);
          this.showError('CSV 파싱에 실패했습니다.');
        }
      });
    });

    const refreshBtn = document.getElementById('analysisRefreshBtn');
    if (refreshBtn) refreshBtn.onclick = () => {
      this.handleDataRefresh();
    };
    const exportBtn = document.getElementById('analysisExportBtn');
    if (exportBtn) exportBtn.onclick = () => this.exportData();
  }

  setupActionButtons() {
    // 시스템 점검
    const systemCheckBtn = document.querySelector('[onclick="runSystemCheck()"]');
    if (systemCheckBtn) {
      systemCheckBtn.onclick = () => this.runSystemCheck();
    }

    // 데이터 내보내기
    const exportBtn = document.querySelector('[onclick="exportData()"]');
    if (exportBtn) {
      exportBtn.onclick = () => this.exportData();
    }

    // 모니터링 시작/중지
    this.setupMonitoringControls();
  }

  setupDeployButton() {
    const deployBtn = document.getElementById('deployBtn');
    const statusEl = document.getElementById('deployStatus');
    if (!deployBtn) return;
    deployBtn.onclick = async () => {
      try {
        deployBtn.disabled = true;
        const original = deployBtn.textContent;
        deployBtn.textContent = '🚀 배포 중...';
        if (statusEl) statusEl.textContent = '';

        // 환경 구성에서 웹훅/엔드포인트 로드
        const cfg = (window.DEPLOYMENT_CONFIG || {});
        const endpoint = cfg.webhookUrl || cfg.deployEndpoint;
        if (!endpoint) {
          throw new Error('배포 엔드포인트가 설정되지 않았습니다. deployment-config.js를 확인하세요.');
        }

        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(cfg.headers || {}) },
          body: JSON.stringify({
            source: 'NetMood-Analyzer',
            ref: cfg.ref || 'main',
            provider: cfg.provider || 'netlify',
            timestamp: new Date().toISOString()
          })
        });

        const result = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          throw new Error(result.message || `배포 요청 실패 (${resp.status})`);
        }

        const url = result.url || result.deploy_url || result.previewUrl || result.logs_url;
        const msg = url ? `배포 요청 완료. URL: ${url}` : '배포 요청 완료.';
        this.showSuccess(msg);
        if (statusEl) {
          statusEl.innerHTML = url ? `✅ 배포 성공: <a href="${url}" target="_blank" rel="noopener">열기</a>` : '✅ 배포 요청 완료';
        }
        deployBtn.textContent = '✅ 배포 완료';
      } catch (e) {
        console.error(e);
        this.showError(e.message || '배포에 실패했습니다.');
        const statusEl = document.getElementById('deployStatus');
        if (statusEl) statusEl.textContent = '❌ 배포 실패';
      } finally {
        const deployBtn = document.getElementById('deployBtn');
        if (deployBtn) deployBtn.disabled = false;
      }
    };
  }

  setupVercelSetupModal() {
    const openBtn = document.getElementById('vercelSetupBtn');
    if (openBtn) {
      openBtn.onclick = () => openModal('vercelSetupOverlay');
    }
    const logs = () => document.getElementById('vercelSetupLogs');
    const appendLog = (m) => { const el = logs(); if (el) { el.textContent += `\n${m}`; el.scrollTop = el.scrollHeight; } };

    const createBtn = document.getElementById('createVercelHookBtn');
    if (createBtn) {
      createBtn.onclick = async () => {
        const token = document.getElementById('vercelTokenInput')?.value.trim();
        const teamId = document.getElementById('vercelTeamIdInput')?.value.trim();
        const projectId = document.getElementById('vercelProjectIdInput')?.value.trim();
        const hookName = document.getElementById('deployHookNameInput')?.value.trim() || 'netmood-deploy-hook';
        appendLog('Vercel Deploy Hook 생성 시작...');
        if (!token) { this.showError('Vercel Token이 필요합니다.'); return; }
        try {
          // 서버 프록시 경유 시도
          const res = await fetch(`${this.apiBaseUrl}/vercel/create-deploy-hook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, teamId, projectId, hookName })
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || !out.success) throw new Error(out.error || `HTTP ${res.status}`);
          appendLog(`생성 완료: ${out.hookUrl}`);
          // 설정 저장에 반영
          this.saveDeployConfig({ provider: 'vercel', webhookUrl: out.hookUrl });
          this.showSuccess('Deploy Hook이 생성되고 설정에 반영되었습니다.');
        } catch (e) {
          appendLog(`서버 프록시 실패: ${e.message}`);
          this.showError('서버를 통해 Deploy Hook을 생성하지 못했습니다. 수동으로 입력하거나 서버 설정을 확인하세요.');
        }
      };
    }

    const saveBtn = document.getElementById('saveDeployConfigBtn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const ref = document.getElementById('deployRefInput')?.value.trim() || 'main';
        const cfg = window.DEPLOYMENT_CONFIG || {};
        const webhook = cfg.webhookUrl || '';
        await this.saveDeployConfig({ provider: 'vercel', webhookUrl: webhook, ref });
      };
    }

    const testBtn = document.getElementById('testDeployBtn');
    if (testBtn) {
      testBtn.onclick = async () => {
        const deployBtn = document.getElementById('deployBtn');
        if (deployBtn) deployBtn.click();
      };
    }
  }

  async saveDeployConfig(partial) {
    const cfg = Object.assign({}, window.DEPLOYMENT_CONFIG || {}, partial || {});
    const payload = { provider: cfg.provider || 'vercel', webhookUrl: cfg.webhookUrl || '', headers: cfg.headers || {}, ref: cfg.ref || 'main' };
    try {
      // 서버에 저장 시도
      const res = await fetch(`${this.apiBaseUrl}/config/deployment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.success) throw new Error(out.error || `HTTP ${res.status}`);
      window.DEPLOYMENT_CONFIG = payload;
      this.showSuccess('배포 설정이 서버에 저장되었습니다.');
      return true;
    } catch (e) {
      // 서버 저장 불가 시 파일 다운로드 제공
      const blob = new Blob([`window.DEPLOYMENT_CONFIG = ${JSON.stringify(payload, null, 2)};\n`], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'deployment-config.js'; a.click(); URL.revokeObjectURL(url);
      this.showError('서버에 저장할 수 없어 파일을 다운로드로 제공했습니다. 프로젝트 루트에 덮어쓰기 해주세요.');
      return false;
    }
  }

  setupMonitoringControls() {
    // 모니터링 버튼들 찾기 (실시간 대시보드에서)
    const startBtn = document.querySelector('[onclick="startMonitoring()"]');
    const stopBtn = document.querySelector('[onclick="stopMonitoring()"]');

    if (startBtn) {
      startBtn.onclick = () => this.startMonitoring();
    }
    if (stopBtn) {
      stopBtn.onclick = () => this.stopMonitoring();
    }
  }

  switchTab(tabName) {
    // 모든 탭 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });

    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.remove('active');
    });

    // 선택된 탭 표시
    const targetTab = document.getElementById(tabName);
    const targetBtn = document.querySelector(`[onclick*="${tabName}"]`);

    if (targetTab) {
      targetTab.classList.add('active');
      targetBtn.classList.add('active');
      this.currentTab = tabName;

      // 탭별 초기화
      this.initializeTab(tabName);

      console.log(`탭 전환: ${tabName}`);
    }
  }

  initializeTab(tabName) {
    switch (tabName) {
      case 'monitoring':
        this.initHourlyChart();
        break;
      case 'emotions':
        this.updateEmotionCards();
        this.renderAnalysisView();
        break;
      case 'threats':
        this.updateThreatDetection();
        break;
      case 'history':
        this.updateHistoryList();
        break;
    }
  }

  async loadInitialData() {
    try {
      // 모든 데이터를 병렬로 로드
      const [healthData, emotionData, monitoringData, threatData, historyData] = await Promise.all([
        this.fetchHealthData(),
        this.fetchEmotionData(),
        this.fetchMonitoringData(),
        this.fetchThreatData(),
        this.fetchHistoryData()
      ]);

      // UI 업데이트
      this.updateHealthDashboard(healthData);
      this.updateEmotionCards(emotionData);
      this.updateMonitoringStatus(monitoringData);
      this.updateThreatDetection(threatData);
      this.updateHistoryList(historyData);

      console.log('초기 데이터 로드 완료');
      // 상세 분석 초기 렌더 및 더미 스트림 시작 (CSV 기반)
      this.renderAnalysisView();
      if (this.cachedData.csvRows && this.cachedData.csvRows.length > 0) {
        this.startDummyStreamFromCsvSeed();
      }
      // 더미 CSV 자동 로드 시도 (실패 시 무시)
      this.loadCsvFromPath('dummy_network_emotion.csv').catch(() => { });
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      this.showError('데이터 로드를 실패했습니다.');
    }
  }

  startAutoUpdate() {
    setInterval(() => {
      this.updateCurrentTab();
    }, this.updateInterval);

    console.log('자동 업데이트가 시작되었습니다.');
  }

  startTimeUpdate() {
    // 실시간 시간 업데이트
    setInterval(() => {
      this.updateCurrentTime();
    }, 1000);

    // 초기 시간 설정
    this.updateCurrentTime();
  }

  updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const ampm = hours >= 12 ? '오후' : '오전';
      const displayHours = hours % 12 || 12;

      const timeString = `${year}. ${month}. ${date}. ${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      timeElement.textContent = timeString;
    }
  }

  // 네트워크 모니터링 설정
  setupNetworkMonitoring() {
    if (!window.networkMonitor) {
      console.warn('네트워크 모니터가 로드되지 않았습니다.');
      return;
    }

    // 네트워크 데이터 업데이트 콜백
    window.networkMonitor.onDataUpdate((dataPoint, emotionResult) => {
      this.handleNetworkDataUpdate(dataPoint, emotionResult);
    });

    // 위험 감지 콜백
    window.networkMonitor.onThreatDetected((emotionResult) => {
      this.handleThreatDetected(emotionResult);
    });

    console.log('네트워크 모니터링이 설정되었습니다.');
  }

  // 네트워크 데이터 업데이트 처리
  handleNetworkDataUpdate(dataPoint, emotionResult) {
    // 현재 탭에 따라 다른 업데이트 수행
    switch (this.currentTab) {
      case 'overview':
        this.updateOverviewWithNetworkData(dataPoint, emotionResult);
        break;
      case 'emotions':
        this.updateEmotionAnalysis(emotionResult);
        break;
      case 'monitoring':
        this.updateRealtimeMonitoring(dataPoint, emotionResult);
        break;
      case 'threats':
        this.updateThreatDetection(emotionResult);
        break;
    }
  }

  // 개요 페이지 네트워크 데이터 업데이트
  updateOverviewWithNetworkData(dataPoint, emotionResult) {
    // 건강도 점수 업데이트
    const healthScore = this.calculateHealthScore(dataPoint, emotionResult);
    const healthScoreEl = document.getElementById('healthScore');
    if (healthScoreEl) {
      healthScoreEl.textContent = healthScore;
      healthScoreEl.style.color = this.getHealthScoreColor(healthScore);
    }

    // 건강도 상태 업데이트
    const healthStatus = this.getHealthStatus(healthScore);
    const healthStatusEl = document.getElementById('healthStatus');
    if (healthStatusEl) {
      healthStatusEl.textContent = healthStatus;
      healthStatusEl.style.color = this.getHealthStatusColor(healthStatus);
    }

    // 감정 카드 업데이트
    this.updateEmotionCardsFromNetwork(emotionResult);

    // 데이터 통계 업데이트
    this.updateDataStats(dataPoint);
  }

  // 실시간 모니터링 업데이트
  updateRealtimeMonitoring(dataPoint, emotionResult) {
    // 현재 감정 상태 업데이트
    this.updateCurrentEmotionStatus(emotionResult);

    // 감정 강도 업데이트
    this.updateEmotionIntensity(emotionResult);

    // 감정 피드 업데이트
    this.updateEmotionFeed(emotionResult);

    // 네트워크 성능 지표 업데이트
    this.updateNetworkPerformance(dataPoint);

    // 정보 바 업데이트
    this.updateInfoBar(dataPoint, emotionResult);
  }

  // 감정 분석 페이지 업데이트
  updateEmotionAnalysis(emotionResult) {
    // 감정 요약 카드 업데이트
    this.updateEmotionSummaryCards(emotionResult);

    // 감정 변화 추이 차트 업데이트
    this.updateEmotionTrendChart(emotionResult);

    // 분석 정보 업데이트
    this.updateAnalysisInfo(emotionResult);
  }

  // 현재 감정 상태 업데이트
  updateCurrentEmotionStatus(emotionResult) {
    const emotionEmoji = document.querySelector('.emotion-emoji');
    const emotionName = document.querySelector('.emotion-name');
    const emotionIntensity = document.querySelector('.emotion-intensity');
    const lastUpdate = document.querySelector('.last-update');

    if (emotionEmoji) {
      const emojiMap = {
        'calm': '😊',
        'happy': '😁',
        'anxious': '😟',
        'angry': '😡',
        'stressed': '😰',
        'sad': '😢'
      };
      emotionEmoji.textContent = emojiMap[emotionResult.emotion] || '😊';
    }

    if (emotionName) {
      const nameMap = {
        'calm': '평온',
        'happy': '기쁨',
        'anxious': '불안',
        'angry': '화남',
        'stressed': '스트레스',
        'sad': '슬픔'
      };
      emotionName.textContent = nameMap[emotionResult.emotion] || '평온';
    }

    if (emotionIntensity) {
      const intensity = Math.round(emotionResult.intensity * 10);
      emotionIntensity.textContent = `강도: ${intensity}/10`;
    }

    if (lastUpdate) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR');
      lastUpdate.textContent = `마지막 업데이트: ${timeString}`;
    }
  }

  // 감정 강도 업데이트
  updateEmotionIntensity(emotionResult) {
    const intensityBars = document.querySelectorAll('.intensity-fill');
    const intensityValues = document.querySelectorAll('.intensity-value');

    if (intensityBars.length >= 2) {
      // 현재 강도
      const currentIntensity = Math.round(emotionResult.intensity * 100);
      intensityBars[0].style.width = `${currentIntensity}%`;
      if (intensityValues[0]) {
        intensityValues[0].textContent = `${Math.round(emotionResult.intensity * 10)}/10`;
      }

      // 평균 강도 (최근 5분)
      const avgIntensity = this.calculateAverageIntensity();
      const avgPercentage = Math.round(avgIntensity * 100);
      intensityBars[1].style.width = `${avgPercentage}%`;
      if (intensityValues[1]) {
        intensityValues[1].textContent = `${Math.round(avgIntensity * 10)}/10`;
      }
    }
  }

  // 감정 피드 업데이트
  updateEmotionFeed(emotionResult) {
    const feedContainer = document.querySelector('.emotion-feed');
    if (!feedContainer) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');

    const emojiMap = {
      'calm': '😊',
      'happy': '😁',
      'anxious': '😟',
      'angry': '😡',
      'stressed': '😰',
      'sad': '😢'
    };

    const nameMap = {
      'calm': '평온',
      'happy': '기쁨',
      'anxious': '불안',
      'angry': '화남',
      'stressed': '스트레스',
      'sad': '슬픔'
    };

    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';
    feedItem.innerHTML = `
      <div class="feed-emoji">${emojiMap[emotionResult.emotion] || '😊'}</div>
      <div class="feed-content">
        <div class="feed-emotion">${nameMap[emotionResult.emotion] || '평온'}</div>
        <div class="feed-intensity">강도 ${Math.round(emotionResult.intensity * 10)}</div>
      </div>
      <div class="feed-time">${timeString}</div>
    `;

    // 최신 항목을 맨 위에 추가
    feedContainer.insertBefore(feedItem, feedContainer.firstChild);

    // 최대 10개 항목만 유지
    const feedItems = feedContainer.querySelectorAll('.feed-item');
    if (feedItems.length > 10) {
      feedContainer.removeChild(feedItems[feedItems.length - 1]);
    }
  }

  // 네트워크 성능 지표 업데이트
  updateNetworkPerformance(dataPoint) {
    const performanceNumbers = document.querySelectorAll('.performance-number');
    const performanceLabels = document.querySelectorAll('.performance-label');

    if (performanceNumbers.length >= 3) {
      // 패킷 수
      performanceNumbers[0].textContent = dataPoint.activeConnections || '0';

      // 지연시간
      performanceNumbers[1].textContent = `${dataPoint.latency || 0}ms`;

      // 대역폭
      const bandwidth = Math.round((dataPoint.bandwidth || 0) / 1000);
      performanceNumbers[2].textContent = `${bandwidth}Mbps`;
    }
  }

  // 정보 바 업데이트
  updateInfoBar(dataPoint, emotionResult) {
    // 데이터 포인트 수 업데이트
    const dataPointElement = document.querySelector('.info-item:nth-child(3) .info-value');
    if (dataPointElement) {
      const dataCount = window.networkMonitor ? window.networkMonitor.dataPoints.length : 0;
      dataPointElement.innerHTML = `${dataCount} <span class="info-sub">최근 5분</span>`;
    }

    // 위험 감지 수 업데이트
    const threatElement = document.querySelector('.info-item:nth-child(4) .info-value');
    if (threatElement && emotionResult.threatLevel > 0.5) {
      const currentThreats = parseInt(threatElement.textContent) || 0;
      threatElement.innerHTML = `${currentThreats + 1} <span class="info-sub">건</span>`;
    }
  }

  // 감정 요약 카드 업데이트
  updateEmotionSummaryCards(emotionResult) {
    const emotionCards = document.querySelectorAll('.emotion-summary-card');

    if (emotionCards.length === 0) return;

    // 현재 감정에 따른 비율 계산
    const currentEmotion = emotionResult.emotion;
    const intensity = emotionResult.intensity;

    // 기본 비율 설정
    const baseRatios = {
      'stressed': 0.2,
      'happy': 0.3,
      'angry': 0.2,
      'anxious': 0.3
    };

    // 현재 감정에 따라 비율 조정
    if (currentEmotion === 'stressed') {
      baseRatios.stressed = Math.min(0.8, 0.2 + intensity * 0.6);
      baseRatios.happy = Math.max(0.1, 0.3 - intensity * 0.2);
    } else if (currentEmotion === 'happy') {
      baseRatios.happy = Math.min(0.8, 0.3 + intensity * 0.5);
      baseRatios.stressed = Math.max(0.1, 0.2 - intensity * 0.1);
    } else if (currentEmotion === 'angry') {
      baseRatios.angry = Math.min(0.8, 0.2 + intensity * 0.6);
      baseRatios.happy = Math.max(0.1, 0.3 - intensity * 0.2);
    } else if (currentEmotion === 'anxious') {
      baseRatios.anxious = Math.min(0.8, 0.3 + intensity * 0.5);
      baseRatios.happy = Math.max(0.1, 0.3 - intensity * 0.1);
    }

    // 비율 정규화
    const total = Object.values(baseRatios).reduce((sum, val) => sum + val, 0);
    Object.keys(baseRatios).forEach(key => {
      baseRatios[key] = baseRatios[key] / total;
    });

    // 카드 업데이트
    emotionCards.forEach((card, index) => {
      const emotionTypes = ['stressed', 'happy', 'angry', 'anxious'];
      const emotionType = emotionTypes[index];
      const percentage = Math.round(baseRatios[emotionType] * 100);

      const percentageEl = card.querySelector('.emotion-percentage');
      if (percentageEl) {
        percentageEl.textContent = `${percentage}%`;

        // 카드 색상 업데이트
        card.className = `emotion-summary-card ${emotionType}`;
      }
    });
  }

  // 감정 비율 계산
  calculateEmotionRatios(emotionResult) {
    const ratios = {
      'stressed': 0.2,
      'happy': 0.3,
      'angry': 0.2,
      'anxious': 0.3
    };

    // 현재 감정에 따라 비율 조정
    const currentEmotion = emotionResult.emotion;
    const intensity = emotionResult.intensity;

    if (currentEmotion === 'stressed') {
      ratios.stressed = Math.min(0.8, 0.2 + intensity * 0.6);
    } else if (currentEmotion === 'happy') {
      ratios.happy = Math.min(0.8, 0.3 + intensity * 0.5);
    } else if (currentEmotion === 'angry') {
      ratios.angry = Math.min(0.8, 0.2 + intensity * 0.6);
    } else if (currentEmotion === 'anxious') {
      ratios.anxious = Math.min(0.8, 0.3 + intensity * 0.5);
    }

    // 비율 정규화
    const total = Object.values(ratios).reduce((sum, val) => sum + val, 0);
    Object.keys(ratios).forEach(key => {
      ratios[key] = ratios[key] / total;
    });

    return ratios;
  }

  // 평균 강도 계산
  calculateAverageIntensity() {
    if (!window.networkMonitor) return 0.5;

    const recentData = window.networkMonitor.getRecentData(5);
    if (recentData.length === 0) return 0.5;

    const totalIntensity = recentData.reduce((sum, data) => {
      return sum + (data.emotionIntensity || 0);
    }, 0);

    return totalIntensity / recentData.length;
  }

  // 건강도 점수 계산
  calculateHealthScore(dataPoint, emotionResult) {
    let score = 10;

    // 지연시간 기반 점수 감소
    if (dataPoint.latency > 200) score -= 3;
    else if (dataPoint.latency > 100) score -= 1;

    // 패킷 손실 기반 점수 감소
    if (dataPoint.packetLoss > 0.5) score -= 3;
    else if (dataPoint.packetLoss > 0.1) score -= 1;

    // 위험 수준 기반 점수 감소
    if (emotionResult.threatLevel > 0.7) score -= 2;
    else if (emotionResult.threatLevel > 0.3) score -= 1;

    return Math.max(1, Math.min(10, score));
  }

  // 건강도 상태 반환
  getHealthStatus(score) {
    if (score >= 8) return '매우 양호';
    if (score >= 6) return '양호';
    if (score >= 4) return '주의 필요';
    return '위험';
  }

  // 위험 감지 처리
  handleThreatDetected(emotionResult) {
    this.showThreatAlert(emotionResult);
  }

  // 위험 알림 표시
  showThreatAlert(emotionResult) {
    const alertMessage = `위험한 네트워크 패턴이 감지되었습니다!\n감정: ${emotionResult.emotion}\n강도: ${Math.round(emotionResult.intensity * 10)}/10\n위험 수준: ${Math.round(emotionResult.threatLevel * 100)}%`;

    this.showError(alertMessage);

    // 위험 감지 탭으로 자동 전환
    if (this.currentTab !== 'threats') {
      this.switchTab('threats');
    }
  }

  // 감정 카드 업데이트 (네트워크 데이터 기반)
  updateEmotionCardsFromNetwork(emotionResult) {
    const emotionCards = document.querySelectorAll('.emotion-card');
    const emotionRatios = this.calculateEmotionRatios(emotionResult);

    emotionCards.forEach((card, index) => {
      const emotionTypes = ['calm', 'happy', 'anxious', 'angry', 'sad'];
      const emotionType = emotionTypes[index];
      let percentage = 0;

      if (emotionType === 'calm') {
        percentage = Math.round(emotionRatios.happy * 100);
      } else if (emotionType === 'happy') {
        percentage = Math.round(emotionRatios.happy * 100);
      } else if (emotionType === 'anxious') {
        percentage = Math.round(emotionRatios.anxious * 100);
      } else if (emotionType === 'angry') {
        percentage = Math.round(emotionRatios.angry * 100);
      } else if (emotionType === 'sad') {
        percentage = Math.round(emotionRatios.stressed * 100);
      }

      const percentageEl = card.querySelector('.emotion-percentage');
      if (percentageEl) {
        percentageEl.textContent = `${percentage}%`;
      }
    });
  }

  // 데이터 통계 업데이트
  updateDataStats(dataPoint) {
    const totalDataPointsEl = document.getElementById('totalDataPoints');
    if (totalDataPointsEl && window.networkMonitor) {
      totalDataPointsEl.textContent = window.networkMonitor.dataPoints.length;
    }

    const activeConnectionsEl = document.getElementById('activeConnections');
    if (activeConnectionsEl) {
      activeConnectionsEl.textContent = dataPoint.activeConnections || 0;
    }

    const threatLevelEl = document.getElementById('threatLevel');
    if (threatLevelEl) {
      const threatLevel = dataPoint.threatLevel || 0;
      if (threatLevel > 0.7) threatLevelEl.textContent = '높음';
      else if (threatLevel > 0.3) threatLevelEl.textContent = '중간';
      else threatLevelEl.textContent = '낮음';
    }
  }

  // 감정 변화 추이 차트 업데이트
  updateEmotionTrendChart(emotionResult) {
    if (!this.emotionDetailChart) return;

    // 최근 데이터 포인트들을 차트에 추가
    const recentData = window.networkMonitor ? window.networkMonitor.getRecentData(20) : [];
    if (recentData.length === 0) return;

    const labels = recentData.map(data => {
      const date = new Date(data.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    });

    const emotionData = {
      'calm': [],
      'happy': [],
      'anxious': [],
      'angry': [],
      'stressed': []
    };

    recentData.forEach(data => {
      const emotion = data.emotion || 'calm';
      const intensity = data.intensity || 0;

      Object.keys(emotionData).forEach(key => {
        emotionData[key].push(key === emotion ? intensity * 10 : 0);
      });
    });

    const datasets = Object.keys(emotionData).map(emotion => ({
      label: emotion,
      data: emotionData[emotion],
      borderColor: this.getEmotionColor(emotion),
      backgroundColor: this.getEmotionColor(emotion) + '22',
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4
    }));

    this.emotionDetailChart.data.labels = labels;
    this.emotionDetailChart.data.datasets = datasets;
    this.emotionDetailChart.update('none');
  }

  // 분석 정보 업데이트
  updateAnalysisInfo(emotionResult) {
    const analysisTotal = document.getElementById('analysisTotal');
    const analysisPeriod = document.getElementById('analysisPeriod');
    const analysisRisks = document.getElementById('analysisRisks');
    const analysisLastUpdate = document.getElementById('analysisLastUpdate');

    if (analysisTotal && window.networkMonitor) {
      analysisTotal.textContent = `${window.networkMonitor.dataPoints.length}개`;
    }

    if (analysisPeriod) {
      analysisPeriod.textContent = '실시간 모니터링';
    }

    if (analysisRisks) {
      const threatCount = window.networkMonitor ?
        window.networkMonitor.dataPoints.filter(data => data.threatLevel > 0.5).length : 0;
      analysisRisks.textContent = `${threatCount}건`;
    }

    if (analysisLastUpdate) {
      analysisLastUpdate.textContent = new Date().toLocaleTimeString('ko-KR');
    }
  }

  // 감정 색상 반환
  getEmotionColor(emotion) {
    const colors = {
      'calm': '#28a745',
      'happy': '#17a2b8',
      'anxious': '#ffc107',
      'angry': '#dc3545',
      'stressed': '#6f42c1',
      'sad': '#6c757d'
    };
    return colors[emotion] || '#6c757d';
  }

  async updateCurrentTab() {
    try {
      switch (this.currentTab) {
        case 'overview':
          await this.updateOverviewTab();
          break;
        case 'monitoring':
          await this.updateMonitoringTab();
          break;
        case 'threats':
          await this.updateThreatsTab();
          break;
        case 'history':
          await this.updateHistoryTab();
          break;
      }
    } catch (error) {
      console.error('탭 업데이트 실패:', error);
    }
  }

  async updateOverviewTab() {
    const [healthData, emotionData] = await Promise.all([
      this.fetchHealthData(),
      this.fetchEmotionData()
    ]);

    this.updateHealthDashboard(healthData);
    this.updateEmotionCards(emotionData);
  }

  async updateMonitoringTab() {
    const monitoringData = await this.fetchMonitoringData();
    this.updateMonitoringStatus(monitoringData);
    // CSV 데이터가 있으면 차트를 CSV 기반으로, 없으면 API 데이터 사용
    if (this.cachedData.csvRows && this.cachedData.csvRows.length > 0) {
      const chartData = this.buildChartDataFromCsv();
      this.updateHourlyChart(chartData);
    } else {
      this.updateHourlyChart(monitoringData.hourly_chart_data);
    }
  }

  async updateThreatsTab() {
    const threatData = await this.fetchThreatData();
    this.updateThreatDetection(threatData);
  }

  async updateHistoryTab() {
    const historyData = await this.fetchHistoryData();
    this.updateHistoryList(historyData);
  }

  // API 호출 메서드들

  async fetchHealthData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      const result = await response.json();
      if (result.success) {
        this.cachedData.health = result.data;
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      // Fallback: mock data
      const mock = {
        health_score: 7,
        health_status: '주의 필요',
        health_message: '로컬 API에 연결되지 않아 더미 데이터를 표시합니다.',
        total_data_points: (window.networkMonitor ? window.networkMonitor.dataPoints.length : 0),
        active_connections: (window.networkMonitor ? window.networkMonitor.getCurrentData()?.activeConnections || 0 : 0),
        threat_level: '중간',
        last_update: new Date().toISOString()
      };
      this.cachedData.health = mock;
      return mock;
    }
  }

  async fetchEmotionData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/emotions`);
      const result = await response.json();
      if (result.success) {
        this.cachedData.emotions = result.data;
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      const mock = [
        { key: 'calm', percentage: 62, message: 'API 불가: 더미 비율', last_update: '지금' },
        { key: 'happy', percentage: 18, message: 'API 불가: 더미 비율', last_update: '지금' },
        { key: 'anxious', percentage: 12, message: 'API 불가: 더미 비율', last_update: '지금' },
        { key: 'angry', percentage: 5, message: 'API 불가: 더미 비율', last_update: '지금' },
        { key: 'sad', percentage: 3, message: 'API 불가: 더미 비율', last_update: '지금' }
      ];
      this.cachedData.emotions = mock;
      return mock;
    }
  }

  async fetchMonitoringData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/monitoring`);
      const result = await response.json();
      if (result.success) {
        this.cachedData.monitoring = result.data;
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      const labels = Array.from({ length: 24 }, (_, i) => `${i}`);
      const rand = () => labels.map(() => Math.round(40 + Math.random() * 40));
      const mock = {
        is_monitoring: true,
        current_packets: (window.networkMonitor ? window.networkMonitor.getCurrentData()?.dataTransferred || 0 : 0),
        hourly_chart_data: {
          labels,
          datasets: [
            { label: '평온', data: rand(), borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.1)', tension: 0.4 },
            { label: '불안', data: rand(), borderColor: '#ffc107', backgroundColor: 'rgba(255,193,7,0.1)', tension: 0.4 },
            { label: '화남', data: rand(), borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.1)', tension: 0.4 }
          ]
        }
      };
      this.cachedData.monitoring = mock;
      return mock;
    }
  }

  async fetchThreatData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/threats`);
      const result = await response.json();
      if (result.success) {
        this.cachedData.threats = result.data;
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      const mock = {
        threat_detected: false,
        emotion_type: 'calm',
        intensity: 10,
        detailed_message: 'API 오프라인 - 위험 없음(모의)'
      };
      this.cachedData.threats = mock;
      return mock;
    }
  }

  async fetchHistoryData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/history`);
      const result = await response.json();
      if (result.success) {
        this.cachedData.history = result.data;
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      const mock = [
        { type: 'threat', severity: 'high', timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), description: '모의: 높은 지연 감지' },
        { type: 'warning', severity: 'medium', timestamp: new Date(Date.now() - 7200 * 1000).toISOString(), description: '모의: 불안정한 패턴' },
        { type: 'normal', severity: 'low', timestamp: new Date(Date.now() - 10800 * 1000).toISOString(), description: '모의: 정상 상태 복구' }
      ];
      this.cachedData.history = mock;
      return mock;
    }
  }

  // UI 업데이트 메서드들

  updateHealthDashboard(data) {
    if (!data) return;

    // 건강도 점수
    const healthScoreEl = document.getElementById('healthScore');
    if (healthScoreEl) {
      healthScoreEl.textContent = data.health_score;
      healthScoreEl.style.color = this.getHealthScoreColor(data.health_score);
    }

    // 건강도 상태
    const healthStatusEl = document.getElementById('healthStatus');
    if (healthStatusEl) {
      healthStatusEl.textContent = data.health_status;
      healthStatusEl.style.color = this.getHealthStatusColor(data.health_status);
    }

    // 건강도 메시지
    const healthMessageEl = document.getElementById('healthMessage');
    if (healthMessageEl) {
      healthMessageEl.textContent = data.health_message;
    }

    // 통계 데이터
    const totalDataPointsEl = document.getElementById('totalDataPoints');
    if (totalDataPointsEl) {
      totalDataPointsEl.textContent = data.total_data_points;
    }

    const activeConnectionsEl = document.getElementById('activeConnections');
    if (activeConnectionsEl) {
      activeConnectionsEl.textContent = data.active_connections;
    }

    const threatLevelEl = document.getElementById('threatLevel');
    if (threatLevelEl) {
      threatLevelEl.textContent = data.threat_level;
    }

    // 마지막 업데이트 시간
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
      lastUpdateEl.textContent = this.formatRelativeTime(data.last_update);
    }
  }

  updateEmotionCards(emotions) {
    if (!emotions) return;

    // 감정 카드 업데이트
    emotions.forEach(emotion => {
      const card = document.querySelector(`.emotion-card.${emotion.key}`);
      if (card) {
        // 퍼센트 업데이트
        const percentageEl = card.querySelector('.emotion-percentage');
        if (percentageEl) {
          percentageEl.textContent = `${emotion.percentage}%`;
          percentageEl.style.color = this.getEmotionColor(emotion.key);
        }

        // 메시지 업데이트
        const messageEl = card.querySelector('.emotion-message');
        if (messageEl) {
          messageEl.textContent = emotion.message;
        }

        // 업데이트 시간
        const updateEl = card.querySelector('.emotion-update span:last-child');
        if (updateEl) {
          updateEl.textContent = emotion.last_update;
        }

        // 애니메이션 효과
        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
          card.style.transform = 'scale(1)';
        }, 200);
      }
    });
  }

  updateMonitoringStatus(data) {
    if (!data) return;

    // 패킷 수 업데이트
    const currentPacketsEl = document.getElementById('currentPackets');
    if (currentPacketsEl) {
      currentPacketsEl.textContent = data.current_packets;
    }

    // 모니터링 상태 업데이트
    const statusIndicators = document.querySelectorAll('.indicator-dot');
    statusIndicators.forEach(indicator => {
      if (data.is_monitoring) {
        indicator.classList.add('green');
        indicator.classList.remove('yellow', 'red');
      } else {
        indicator.classList.add('yellow');
        indicator.classList.remove('green', 'red');
      }
    });
  }

  updateThreatDetection(data) {
    if (!data) return;

    const threatSection = document.querySelector('.threat-detection');
    if (!threatSection) return;

    if (data.threat_detected) {
      // 위험 감지됨
      threatSection.style.display = 'block';
      threatSection.classList.add('threat-active');

      // 위험 정보 업데이트
      const threatEmotionEl = document.getElementById('threatEmotion');
      if (threatEmotionEl) {
        threatEmotionEl.textContent = data.emotion_type;
      }

      // 강도 게이지 업데이트
      const gaugeFill = threatSection.querySelector('.gauge-fill');
      if (gaugeFill) {
        gaugeFill.style.width = `${data.intensity}%`;
      }

      // 상세 메시지 업데이트
      const detailedMessage = threatSection.querySelector('.threat-detection > div:last-child');
      if (detailedMessage) {
        detailedMessage.innerHTML = `<strong>상세 메시지:</strong><br>${data.detailed_message}`;
      }
    } else {
      // 위험 감지되지 않음
      threatSection.style.display = 'none';
      threatSection.classList.remove('threat-active');
    }
  }

  updateHistoryList(historyData) {
    if (!historyData) return;

    const historyListEl = document.getElementById('historyList');
    if (!historyListEl) return;

    // 기존 항목 제거
    historyListEl.innerHTML = '';

    // 새 항목 추가
    historyData.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = `history-item ${item.type}`;

      const severityClass = {
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
      }[item.severity] || 'low';

      historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-time">${item.timestamp}</div>
                    <div class="history-desc">${item.description}</div>
                </div>
                <div class="history-severity ${severityClass}">${this.getSeverityText(item.severity)}</div>
            `;

      historyListEl.appendChild(historyItem);
    });
  }

  initHourlyChart() {
    const ctx = document.getElementById('hourlyChart');
    if (!ctx) return;

    if (this.hourlyChart) {
      this.hourlyChart.destroy();
    }

    this.hourlyChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '평온',
            data: [],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4
          },
          {
            label: '불안',
            data: [],
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            tension: 0.4
          },
          {
            label: '화남',
            data: [],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '감정 비율 (%)'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }
  initEmotionDetailChart() {
    const ctx = document.getElementById('emotionDetailChart');
    if (!ctx) return;
    if (this.emotionDetailChart) this.emotionDetailChart.destroy();
    this.emotionDetailChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: { enabled: true }
        },
        elements: { point: { radius: 3 } },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });
  }

  updateEmotionDetailChartFromCsv() {
    this.initEmotionDetailChart();
    if (!this.emotionDetailChart) return;
    const rows = this.cachedData.csvRows || [];
    if (rows.length === 0) return;
    const labels = rows.map(r => r.time);
    const groups = this.groupRowsByType(rows);
    const color = {
      '평온': '#28a745', '기쁨': '#17a2b8', '스트레스': '#6f42c1', '불안': '#ffc107', '화남': '#dc3545'
    };
    const datasets = Object.keys(groups).map(k => ({
      label: k,
      data: groups[k].map(r => r.intensity),
      borderColor: color[k] || '#6c757d',
      backgroundColor: (color[k] || '#6c757d') + '22',
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4
    }));
    this.emotionDetailChart.data.labels = labels;
    this.emotionDetailChart.data.datasets = datasets;
    this.emotionDetailChart.update('none');
  }

  updateEmotionChartByRange(range) {
    if (!this.emotionDetailChart) return;

    const rows = this.cachedData.csvRows || [];
    if (rows.length === 0) return;

    // 시간 범위에 따른 데이터 필터링 및 집계
    let filteredRows = rows;
    let timeFormat = 'MM-DD HH:mm';

    switch (range) {
      case '1d':
        // 1일: 시간별 집계
        filteredRows = this.aggregateDataByTime(rows, 'hour');
        timeFormat = 'MM-DD HH:mm';
        break;
      case '1m':
        // 1달: 일별 집계
        filteredRows = this.aggregateDataByTime(rows, 'day');
        timeFormat = 'MM-DD';
        break;
      case '3m':
        // 3달: 주별 집계
        filteredRows = this.aggregateDataByTime(rows, 'week');
        timeFormat = 'MM-DD';
        break;
    }

    const labels = filteredRows.map(r => this.formatTimeForChart(r.time, timeFormat));
    const groups = this.groupRowsByType(filteredRows);
    const color = {
      '평온': '#28a745', '기쁨': '#17a2b8', '스트레스': '#6f42c1', '불안': '#ffc107', '화남': '#dc3545'
    };

    const datasets = Object.keys(groups).map(k => ({
      label: k,
      data: groups[k].map(r => r.intensity),
      borderColor: color[k] || '#6c757d',
      backgroundColor: (color[k] || '#6c757d') + '22',
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4
    }));

    this.emotionDetailChart.data.labels = labels;
    this.emotionDetailChart.data.datasets = datasets;
    this.emotionDetailChart.update('none');
  }

  aggregateDataByTime(rows, unit) {
    const groups = {};

    rows.forEach(row => {
      const date = new Date(row.time);
      let key;

      switch (unit) {
        case 'hour':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
          break;
      }

      if (!groups[key]) {
        groups[key] = {};
      }

      if (!groups[key][row.type]) {
        groups[key][row.type] = { total: 0, count: 0 };
      }

      groups[key][row.type].total += row.intensity;
      groups[key][row.type].count += 1;
    });

    const result = [];
    Object.keys(groups).sort().forEach(timeKey => {
      Object.keys(groups[timeKey]).forEach(emotionType => {
        const avg = groups[timeKey][emotionType].total / groups[timeKey][emotionType].count;
        result.push({
          time: timeKey,
          type: emotionType,
          intensity: Math.round(avg)
        });
      });
    });

    return result;
  }

  formatTimeForChart(timeStr, format) {
    const date = new Date(timeStr);
    switch (format) {
      case 'MM-DD HH:mm':
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      case 'MM-DD':
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      default:
        return timeStr;
    }
  }

  groupRowsByType(rows) {
    const g = {};
    rows.forEach(r => {
      if (!g[r.type]) g[r.type] = [];
      g[r.type].push(r);
    });
    return g;
  }

  parseCsvAuto(text) {
    // 자동 헤더 탐지: 한국어 헤더 또는 영어 헤더
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (lines.length === 0) return [];
    const header = this.safeSplitCsvLine(lines[0]).map(s => s.trim().toLowerCase());
    const idxTime = header.findIndex(h => ['시간', 'timestamp', 'time'].includes(h));
    const idxEmotion = header.findIndex(h => ['감정_유형', 'emotion', '감정'].includes(h));
    // 강도 소스는 '강도', 'intensity', 없으면 Bytes/PacketRate/Entropy를 조합하여 유추 (0~100 스케일)
    const idxIntensity = header.findIndex(h => ['강도', 'intensity'].includes(h));
    const idxBytes = header.indexOf('bytes');
    const idxRate = header.indexOf('packetrate');
    const idxEntropy = header.indexOf('protocolentropy');
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = this.safeSplitCsvLine(lines[i]);
      if (cols.length < 2) continue;
      const t = (cols[idxTime] || cols[0] || '').trim();
      const type = (cols[idxEmotion] || cols[cols.length - 1] || '').trim();
      let intensity = 0;
      if (idxIntensity >= 0) {
        intensity = parseFloat(cols[idxIntensity] || '0');
      } else {
        const bytes = idxBytes >= 0 ? parseFloat(cols[idxBytes] || '0') : 0;
        const rate = idxRate >= 0 ? parseFloat(cols[idxRate] || '0') : 0;
        const ent = idxEntropy >= 0 ? parseFloat(cols[idxEntropy] || '0') : 0;
        // 간단 정규화: 임의 스케일링 후 0~100로 클램프
        intensity = Math.min(100, Math.max(0, Math.round((ent * 60) + (rate / 10) + (bytes / 10000))));
      }
      rows.push({ time: t, type, intensity: isNaN(intensity) ? 0 : intensity });
    }
    return rows;
  }

  updateHourlyChart(chartData) {
    if (!this.hourlyChart || !chartData) return;

    this.hourlyChart.data.labels = chartData.labels;
    this.hourlyChart.data.datasets = chartData.datasets;
    this.hourlyChart.update('none');
  }

  // CSV 처리 및 적용
  parseCsv(text) {
    // 기대 컬럼: 시간, 감정_유형, 강도, 기타
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (lines.length === 0) return [];
    // 헤더 확인
    const header = lines[0].split(',').map(s => s.trim());
    const idxTime = header.findIndex(h => h === '시간');
    const idxType = header.findIndex(h => h === '감정_유형');
    const idxIntensity = header.findIndex(h => h === '강도');
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = this.safeSplitCsvLine(lines[i]);
      if (cols.length < 3) continue;
      const t = cols[idxTime] || cols[0];
      const type = (cols[idxType] || cols[1] || '').trim();
      const intensity = parseFloat((cols[idxIntensity] || cols[2] || '0').trim());
      if (!type) continue;
      rows.push({ time: t, type, intensity: isNaN(intensity) ? 0 : intensity });
    }
    return rows;
  }

  safeSplitCsvLine(line) {
    // 단순 CSV 분리 (따옴표 포함 필드 최소 처리)
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map(s => s.trim());
  }

  applyCsvToChartsAndCards() {
    const chartData = this.buildChartDataFromCsv();
    if (chartData) this.updateHourlyChart(chartData);
    this.updateEmotionDetailChartFromCsv();
    // 카드 갱신 (간단 합계 비율)
    const totals = this.aggregateEmotionTotalsFromCsv();
    const totalSum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    const emotions = [
      { key: 'calm', label: '평온' },
      { key: 'happy', label: '기쁨' },
      { key: 'anxious', label: '불안' },
      { key: 'angry', label: '화남' },
      { key: 'sad', label: '슬픔' }
    ];
    const mapped = emotions.map(e => {
      const value = totals[e.label] || 0; // CSV는 한글 감정명을 사용할 수 있음
      const pct = Math.round((value / totalSum) * 100);
      return { key: e.key, percentage: pct, message: `${e.label} 비중 업데이트`, last_update: 'CSV' };
    });
    this.updateEmotionCards(mapped);
  }

  buildChartDataFromCsv() {
    const rows = this.cachedData.csvRows || [];
    if (rows.length === 0) return null;
    // 시간 범위 필터
    const activeBtn = document.querySelector('.time-range-btn.active');
    const range = activeBtn ? activeBtn.getAttribute('data-range') : '3h';

    // 시간 축 생성: 단순히 최근 N 포인트 사용
    const limitMap = { '3h': 36, '1d': 24, '1m': 30, '3m': 12 };
    const limit = limitMap[range] || 36;
    const recent = rows.slice(-limit);

    const labels = recent.map(r => r.time);
    const keys = ['평온', '불안', '화남'];
    const colorMap = {
      '평온': { border: '#28a745', bg: 'rgba(40, 167, 69, 0.1)' },
      '불안': { border: '#ffc107', bg: 'rgba(255, 193, 7, 0.1)' },
      '화남': { border: '#dc3545', bg: 'rgba(220, 53, 69, 0.1)' }
    };

    const datasets = keys.map(k => {
      return {
        label: k,
        data: recent.map(r => (r.type === k ? r.intensity : 0)),
        borderColor: colorMap[k].border,
        backgroundColor: colorMap[k].bg,
        tension: 0.4
      };
    });

    return { labels, datasets };
  }

  aggregateEmotionTotalsFromCsv() {
    const rows = this.cachedData.csvRows || [];
    const totals = {};
    for (const r of rows) {
      totals[r.type] = (totals[r.type] || 0) + (r.intensity || 0);
    }
    return totals;
  }

  async loadCsvFromPath(path) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`CSV 요청 실패: ${res.status}`);
      const text = await res.text();
      this.cachedData.csvRows = this.parseCsvAuto(text);
      this.applyCsvToChartsAndCards();
      this.renderAnalysisView();
      this.startDummyStreamFromCsvSeed();
      this.showSuccess('더미 CSV가 로드되어 실시간 반영 중입니다.');
    } catch (e) {
      console.warn('CSV 자동 로드 실패 또는 차단됨:', e);
      // file:// 환경 등에서는 실패할 수 있음. 업로드로 대체.
    }
  }

  // 데이터 새로고침 처리 (로딩 화면 포함)
  async handleDataRefresh() {
    const refreshBtn = document.getElementById('analysisRefreshBtn');
    if (!refreshBtn) return;

    // 새로고침 상태 표시
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = '🔄 새로고침 중...';
    refreshBtn.disabled = true;

    // 로딩 오버레이 표시
    this.showRefreshOverlay();

    try {
      // 데이터 새로고침 시뮬레이션 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 분석 뷰 다시 렌더링
      this.renderAnalysisView();

      // 성공 메시지
      this.showSuccess('데이터가 새로고침되었습니다.');
    } catch (error) {
      console.error('새로고침 실패:', error);
      this.showError('새로고침에 실패했습니다.');
    } finally {
      // 로딩 오버레이 숨기기
      this.hideRefreshOverlay();

      // 버튼 상태 복원
      refreshBtn.textContent = originalText;
      refreshBtn.disabled = false;
    }
  }

  showRefreshOverlay() {
    // 기존 오버레이 제거
    this.hideRefreshOverlay();

    // 새로고침 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'refreshOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="text-align: center;">
        <img src="NetMood Analyzer 로고 이미지.webp" alt="NetMood Analyzer" 
             style="width: 120px; height: 120px; margin-bottom: 20px; border-radius: 12px;">
        <h2 style="margin: 0 0 10px 0; color: #27d3b2;">NetMood Analyzer</h2>
        <p style="margin: 0; color: #ccc;">데이터를 새로고침하고 있습니다...</p>
        <div style="margin-top: 20px;">
          <div style="width: 40px; height: 40px; border: 4px solid #27d3b2; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(overlay);
  }

  hideRefreshOverlay() {
    const overlay = document.getElementById('refreshOverlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // 상세 분석 렌더링 (요약 카드/지표/상태)
  renderAnalysisView() {
    // 요약 카드
    const container = document.getElementById('emotionSummaryCards');
    if (container) {
      container.innerHTML = '';
      const totals = this.aggregateEmotionTotalsFromCsv();
      const totalSum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
      const order = [
        { key: 'stressed', name: '스트레스', icon: '😰' },
        { key: 'calm', name: '평온', icon: '😌' },
        { key: 'angry', name: '화남', icon: '😡' },
        { key: 'anxious', name: '불안', icon: '😟' }
      ];
      const labelMap = { '스트레스': '스트레스', '평온': '평온', '화남': '화남', '불안': '불안', '기쁨': '기쁨', '슬픔': '슬픔' };
      order.forEach(item => {
        const val = totals[labelMap[item.name]] || totals[item.name] || 0;
        const pct = Math.round((val / totalSum) * 100);
        const card = document.createElement('div');
        card.className = 'emotion-card';
        card.innerHTML = `
          <div class="emotion-header">
            <div class="emotion-icon">${item.icon}</div>
            <div class="emotion-info">
              <div class="emotion-name">${item.name}</div>
            </div>
          </div>
          <div class="emotion-percentage">${pct}%</div>
          <div class="emotion-message">최근 데이터 기준</div>
        `;
        container.appendChild(card);
      });
    }

    // 분석 정보 박스
    const rows = this.cachedData.csvRows || [];
    const total = rows.length;
    const analysisTotal = document.getElementById('analysisTotal');
    const analysisPeriod = document.getElementById('analysisPeriod');
    const analysisRisks = document.getElementById('analysisRisks');
    const analysisLastUpdate = document.getElementById('analysisLastUpdate');
    if (analysisTotal) analysisTotal.textContent = `${total}개`;
    if (analysisPeriod) analysisPeriod.textContent = total > 0 ? '가장 오래된 시점 ~ 현재' : '-';
    if (analysisRisks) analysisRisks.textContent = '0건';
    if (analysisLastUpdate) analysisLastUpdate.textContent = new Date().toLocaleTimeString();

    // 상세 추이 차트
    this.updateEmotionDetailChartFromCsv();
  }

  // 더미 데이터 스트림: 1분 간격으로 현재까지 보강하고, 이후 매 분 한 행 추가
  startDummyStreamFromCsvSeed() {
    // seed는 현재 csvRows 끝 시간 이후부터 보강
    if (!this.cachedData.csvRows) this.cachedData.csvRows = [];
    const parseTime = (t) => new Date(t.replace(' ', 'T'));
    const formatTime = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
    const emotionPool = ['평온', '기쁨', '스트레스', '불안', '화남'];
    const last = this.cachedData.csvRows.length > 0 ? parseTime(this.cachedData.csvRows[this.cachedData.csvRows.length - 1].time) : new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();
    const rowsToAdd = [];
    let cursor = new Date(last.getTime() + 60 * 1000);
    while (cursor <= now) {
      const e = emotionPool[Math.floor(Math.random() * emotionPool.length)];
      const intensity = Math.min(100, Math.max(0, Math.round(50 + (Math.random() * 40 - 20))));
      rowsToAdd.push({ time: formatTime(cursor), type: e, intensity });
      cursor = new Date(cursor.getTime() + 60 * 1000);
    }
    if (rowsToAdd.length) this.cachedData.csvRows = this.cachedData.csvRows.concat(rowsToAdd);
    this.applyCsvToChartsAndCards();
    // 이후 매분 추가
    if (this._dummyInterval) clearInterval(this._dummyInterval);
    this._dummyInterval = setInterval(() => {
      const d = new Date();
      d.setSeconds(0, 0);
      const e = emotionPool[Math.floor(Math.random() * emotionPool.length)];
      const intensity = Math.min(100, Math.max(0, Math.round(50 + (Math.random() * 40 - 20))));
      this.cachedData.csvRows.push({ time: formatTime(d), type: e, intensity });
      this.applyCsvToChartsAndCards();
    }, 60 * 1000);
  }

  // 액션 메서드들

  async runSystemCheck() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/actions/system-check`, {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        this.showSuccess(result.message);

        // 상세 정보 표시
        const details = result.details;
        const message = `점검 완료!\n\n네트워크 상태: ${details.network_status}\n보안 상태: ${details.security_status}\n활성 세션: ${details.active_sessions}개\n실패 시도: ${details.failed_attempts}회`;
        alert(message);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('시스템 점검 실패:', error);
      this.showError('시스템 점검에 실패했습니다.');
    }
  }

  async exportData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/actions/export`, {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        // JSON 파일 다운로드
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showSuccess('데이터가 내보내기되었습니다.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      this.showError('데이터 내보내기에 실패했습니다.');
    }
  }

  async startMonitoring() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/actions/start-monitoring`, {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        this.isMonitoring = true;
        this.showSuccess(result.message);
        this.updateMonitoringButton();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('모니터링 시작 실패:', error);
      this.showError('모니터링 시작에 실패했습니다.');
    }
  }

  async stopMonitoring() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/actions/stop-monitoring`, {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        this.isMonitoring = false;
        this.showSuccess(result.message);
        this.updateMonitoringButton();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('모니터링 중지 실패:', error);
      this.showError('모니터링 중지에 실패했습니다.');
    }
  }

  updateMonitoringButton() {
    // 모니터링 버튼 상태 업데이트 (실시간 대시보드에서)
    const startBtn = document.querySelector('[onclick="startMonitoring()"]');
    const stopBtn = document.querySelector('[onclick="stopMonitoring()"]');

    if (startBtn && stopBtn) {
      if (this.isMonitoring) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
      } else {
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
      }
    }
  }

  // 유틸리티 메서드들

  getHealthScoreColor(score) {
    if (score >= 8) return '#28a745';
    if (score >= 6) return '#ffc107';
    return '#dc3545';
  }

  getHealthStatusColor(status) {
    switch (status) {
      case '매우 양호':
      case '양호':
        return '#28a745';
      case '주의 필요':
        return '#ffc107';
      case '위험':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getEmotionColor(emotion) {
    const colors = {
      'calm': '#28a745',
      'happy': '#17a2b8',
      'anxious': '#ffc107',
      'angry': '#dc3545',
      'sad': '#6f42c1'
    };
    return colors[emotion] || '#6c757d';
  }

  getSeverityText(severity) {
    const severityMap = {
      'high': '높음',
      'medium': '중간',
      'low': '낮음'
    };
    return severityMap[severity] || '알 수 없음';
  }

  formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) {
      return `${diff}초 전`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}분 전`;
    } else {
      return `${Math.floor(diff / 3600)}시간 전`;
    }
  }

  showSuccess(message) {
    // 성공 메시지 표시
    this.showNotification(message, 'success');
  }

  showError(message) {
    // 오류 메시지 표시
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // 알림 메시지 표시
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

    const bgColor = {
      'success': '#28a745',
      'error': '#dc3545',
      'info': '#17a2b8'
    }[type] || '#6c757d';

    notification.style.backgroundColor = bgColor;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// 전역 함수들 (기존 HTML과의 호환성을 위해)
function switchTab(tabName) {
  if (window.dashboard) {
    window.dashboard.switchTab(tabName);
  }
}

function runSystemCheck() {
  if (window.dashboard) {
    window.dashboard.runSystemCheck();
  }
}

function exportData() {
  if (window.dashboard) {
    window.dashboard.exportData();
  }
}

function startMonitoring() {
  if (window.dashboard) {
    window.dashboard.startMonitoring();
  }
}

function stopMonitoring() {
  if (window.dashboard) {
    window.dashboard.stopMonitoring();
  }
}

function openEmotionGuide() {
  openModal('emotionGuideModalOverlay');
}

// 초기화
document.addEventListener('DOMContentLoaded', function () {
  window.dashboard = new NetMoodDashboard();
});
