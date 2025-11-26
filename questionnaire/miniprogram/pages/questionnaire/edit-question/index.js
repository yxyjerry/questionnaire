// questionnaire/edit-question/index.js
Page({
  data: {
    questionnaireId: '',
    questionType: '', // '单选题', '多选题', '填空题'
    questionIndex: -1, // 编辑时的问题索引，-1表示新增
    questionContent: '',
    options: [], // 选项数组
    isRequired: true, // 是否必填
    type: '' // 'single', 'multiple', 'fill'
  },

  onLoad(options) {
    const { questionnaireId, questionType, type, index } = options;
    this.setData({
      questionnaireId,
      questionType,
      type,
      questionIndex: index ? parseInt(index) : -1
    });
    
    // 如果是编辑模式，加载问题数据
    if (index !== undefined) {
      this.loadQuestionData(parseInt(index));
    } else {
      // 如果是新增模式，初始化默认选项
      if (type !== 'fill') {
        this.setData({
          options: ['', '']
        });
      }
    }
  },

  // 加载问题数据（编辑模式）
  loadQuestionData(index) {
    try {
      const questionnaires = wx.getStorageSync('questionnaires') || [];
      const questionnaire = questionnaires.find(item => item.id === this.data.questionnaireId);
      
      if (questionnaire && questionnaire.questions[index]) {
        const question = questionnaire.questions[index];
        this.setData({
          questionContent: question.content,
          options: question.options || [],
          isRequired: question.isRequired !== undefined ? question.isRequired : true,
          type: question.type
        });
      }
    } catch (e) {
      console.error('加载问题数据失败', e);
    }
  },

  // 输入问题内容
  onContentInput(e) {
    this.setData({
      questionContent: e.detail.value
    });
  },

  // 输入选项内容
  onOptionInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const options = [...this.data.options];
    options[index] = value;
    
    this.setData({
      options
    });
  },

  // 添加选项
  addOption() {
    const options = [...this.data.options, ''];
    this.setData({
      options
    });
  },

  // 删除选项
  removeOption(e) {
    const index = e.currentTarget.dataset.index;
    const options = [...this.data.options];
    options.splice(index, 1);
    
    this.setData({
      options
    });
  },

  // 切换是否必填
  onRequiredChange(e) {
    this.setData({
      isRequired: e.detail.value
    });
  },

  // 保存问题
  saveQuestion() {
    const { questionContent, type, isRequired } = this.data;
    
    if (!questionContent.trim()) {
      wx.showToast({
        title: '请输入问题内容',
        icon: 'none'
      });
      return;
    }
    
    // 对于单选和多选题，需要有至少一个选项
    if (type !== 'fill') {
      const validOptions = this.data.options.filter(option => option.trim() !== '');
      if (validOptions.length === 0) {
        wx.showToast({
          title: '请至少添加一个选项',
          icon: 'none'
        });
        return;
      }
    }
    
    // 构建问题对象
    const question = {
      type,
      content: questionContent.trim(),
      isRequired,
      ...(type !== 'fill' && { options: this.data.options.filter(option => option.trim() !== '') })
    };
    
    try {
      const questionnaires = wx.getStorageSync('questionnaires') || [];
      const questionnaireIndex = questionnaires.findIndex(item => item.id === this.data.questionnaireId);
      
      if (questionnaireIndex !== -1) {
        const questionnaire = questionnaires[questionnaireIndex];
        const questions = [...questionnaire.questions];
        
        if (this.data.questionIndex === -1) {
          // 新增问题
          questions.push(question);
        } else {
          // 更新问题
          questions[this.data.questionIndex] = question;
        }
        
        questionnaire.questions = questions;
        questionnaire.updateTime = this.formatTime(new Date());
        questionnaires[questionnaireIndex] = questionnaire;
        
        wx.setStorageSync('questionnaires', questionnaires);
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      } else {
        wx.showToast({
          title: '问卷不存在',
          icon: 'none'
        });
      }
    } catch (e) {
      console.error('保存问题失败', e);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
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