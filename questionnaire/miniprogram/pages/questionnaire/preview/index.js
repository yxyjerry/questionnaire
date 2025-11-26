// questionnaire/preview/index.js
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
    answers: [], // 存储用户答案
    questionnaireId: ''
  },

  onLoad(options) {
    const id = options.id;
    this.setData({
      questionnaireId: id
    });
    
    this.loadQuestionnaire(id);
    this.initAnswers();
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

  // 初始化答案数组
  initAnswers() {
    const { questionnaire } = this.data;
    const answers = questionnaire.questions.map(question => {
      if (question.type === 'single') {
        return { value: null };
      } else if (question.type === 'multiple') {
        return { value: [] };
      } else {
        return { value: '' };
      }
    });
    
    this.setData({
      answers
    });
  },

  // 单选题选择变化
  onRadioChange(e) {
    const index = e.currentTarget.dataset.index;
    const value = parseInt(e.detail.value);
    const answers = [...this.data.answers];
    
    answers[index] = { value };
    this.setData({
      answers
    });
  },

  // 多选题选择变化
  onCheckboxChange(e) {
    const index = e.currentTarget.dataset.index;
    const values = e.detail.value.map(val => parseInt(val));
    const answers = [...this.data.answers];
    
    answers[index] = { value: values };
    this.setData({
      answers
    });
  },

  // 检查多选项是否被选中
  isChecked(value, optionIndex) {
    if (Array.isArray(value)) {
      return value.includes(optionIndex);
    }
    return false;
  },

  // 填空题输入
  onFillInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const answers = [...this.data.answers];
    
    answers[index] = { value };
    this.setData({
      answers
    });
  },

  // 提交问卷
  submitQuestionnaire() {
    const { questionnaire, answers } = this.data;
    const requiredQuestions = questionnaire.questions.filter(q => q.isRequired);
    let hasUnansweredRequired = false;
    
    // 检查必填问题是否已回答
    for (let i = 0; i < questionnaire.questions.length; i++) {
      const question = questionnaire.questions[i];
      const answer = answers[i];
      
      if (question.isRequired) {
        if (question.type === 'single' && (answer.value === null || answer.value === undefined)) {
          hasUnansweredRequired = true;
          break;
        } else if (question.type === 'multiple' && (!answer.value || answer.value.length === 0)) {
          hasUnansweredRequired = true;
          break;
        } else if (question.type === 'fill' && (!answer.value || answer.value.trim() === '')) {
          hasUnansweredRequired = true;
          break;
        }
      }
    }
    
    if (hasUnansweredRequired) {
      wx.showToast({
        title: '请回答所有必填问题',
        icon: 'none'
      });
      return;
    }
    
    // 保存提交记录（可以扩展为提交到服务器）
    this.saveSubmission();
    
    wx.showToast({
      title: '提交成功！',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  // 保存提交记录
  saveSubmission() {
    try {
      const submissions = wx.getStorageSync('submissions') || {};
      const submission = {
        questionnaireId: this.data.questionnaireId,
        answers: this.data.answers,
        submitTime: this.formatTime(new Date())
      };
      
      if (!submissions[this.data.questionnaireId]) {
        submissions[this.data.questionnaireId] = [];
      }
      
      submissions[this.data.questionnaireId].push(submission);
      wx.setStorageSync('submissions', submissions);
    } catch (e) {
      console.error('保存提交记录失败', e);
    }
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