// questionnaire/edit/index.js
Page({
  data: {
    questionnaire: {
      id: '',
      title: '',
      description: '',
      questions: [],
      createTime: '',
      updateTime: ''
    },
    questionnaireId: ''
  },

  onLoad(options) {
    const id = options.id;
    this.setData({
      questionnaireId: id
    });
    
    this.loadQuestionnaire(id);
  },

  // 加载问卷数据
  loadQuestionnaire(id) {
    try {
      const questionnaires = wx.getStorageSync('questionnaires') || [];
      const questionnaire = questionnaires.find(item => item.id === id);
      
      if (questionnaire) {
        this.setData({
          questionnaire: questionnaire
        });
      } else {
        wx.showToast({
          title: '问卷不存在',
          icon: 'none'
        });
        wx.navigateBack();
      }
    } catch (e) {
      console.error('加载问卷数据失败', e);
      wx.navigateBack();
    }
  },

  // 保存问卷数据
  saveQuestionnaire() {
    try {
      const questionnaires = wx.getStorageSync('questionnaires') || [];
      const index = questionnaires.findIndex(item => item.id === this.data.questionnaireId);
      
      if (index !== -1) {
        questionnaires[index] = this.data.questionnaire;
        wx.setStorageSync('questionnaires', questionnaires);
      }
    } catch (e) {
      console.error('保存问卷数据失败', e);
    }
  },

  // 添加问题
  addQuestion(e) {
    const type = e.currentTarget.dataset.type;
    const questionTypes = {
      single: '单选题',
      multiple: '多选题',
      fill: '填空题'
    };
    
    wx.navigateTo({
      url: `/pages/questionnaire/edit-question?type=${type}&questionType=${questionTypes[type]}&questionnaireId=${this.data.questionnaireId}`
    });
  },

  // 编辑问题
  editQuestion(e) {
    const index = e.currentTarget.dataset.index;
    const question = this.data.questionnaire.questions[index];
    
    wx.navigateTo({
      url: `/pages/questionnaire/edit-question?type=${question.type}&questionType=${question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '填空题'}&questionnaireId=${this.data.questionnaireId}&index=${index}`
    });
  },

  // 删除问题
  deleteQuestion(e) {
    const index = e.currentTarget.dataset.index;
    const questions = [...this.data.questionnaire.questions];
    questions.splice(index, 1);
    
    const questionnaire = { ...this.data.questionnaire, questions };
    this.setData({
      questionnaire
    });
    
    this.saveQuestionnaire();
    
    wx.showToast({
      title: '问题已删除',
      icon: 'success'
    });
  },

  // 预览问卷
  previewQuestionnaire() {
    wx.navigateTo({
      url: `/pages/questionnaire/preview?id=${this.data.questionnaireId}`
    });
  }
});