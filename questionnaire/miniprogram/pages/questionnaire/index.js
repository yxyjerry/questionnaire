// questionnaire/index.js
Page({
  data: {
    questionnaireTitle: '',
    questionnaireDesc: '',
    questionnaires: []
  },

  onLoad() {
    // 页面加载时从本地存储获取问卷列表
    this.loadQuestionnaires();
  },

  // 加载本地存储的问卷数据
  loadQuestionnaires() {
    try {
      const questionnaires = wx.getStorageSync('questionnaires') || [];
      this.setData({
        questionnaires: questionnaires
      });
    } catch (e) {
      console.error('加载问卷数据失败', e);
      this.setData({
        questionnaires: []
      });
    }
  },

  // 保存问卷数据到本地存储
  saveQuestionnaires() {
    try {
      wx.setStorageSync('questionnaires', this.data.questionnaires);
    } catch (e) {
      console.error('保存问卷数据失败', e);
    }
  },

  // 输入问卷标题
  onTitleInput(e) {
    this.setData({
      questionnaireTitle: e.detail.value
    });
  },

  // 输入问卷描述
  onDescInput(e) {
    this.setData({
      questionnaireDesc: e.detail.value
    });
  },

  // 创建新问卷
  createQuestionnaire() {
    const { questionnaireTitle } = this.data;
    
    if (!questionnaireTitle.trim()) {
      wx.showToast({
        title: '请输入问卷标题',
        icon: 'none'
      });
      return;
    }

    const newQuestionnaire = {
      id: Date.now().toString(),
      title: questionnaireTitle.trim(),
      description: this.data.questionnaireDesc.trim(),
      questions: [],
      createTime: this.formatTime(new Date()),
      updateTime: this.formatTime(new Date())
    };

    const questionnaires = [...this.data.questionnaires, newQuestionnaire];
    this.setData({
      questionnaires: questionnaires,
      questionnaireTitle: '',
      questionnaireDesc: ''
    });

    this.saveQuestionnaires();

    wx.showToast({
      title: '问卷创建成功',
      icon: 'success'
    });
  },

  // 编辑问卷
  editQuestionnaire(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/questionnaire/edit?id=${id}`
    });
  },

  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
});