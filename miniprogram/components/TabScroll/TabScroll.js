// components/TabScroll/TabScroll.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        tabItem: {                  // 传入的标签数组
            type: Array,
            value: []
        },
        type: {                     // 调用组件类型
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        tabItemConfig: [],             // 每个标签的字符长度
        activeItem: 0,                 // 当前被选中标签的下标 

        underLine_left: [],            // 下划线偏移
        underLine_width: [],           // 下划线宽度
    },

    lifetimes: {
        ready: function () {
            let tabItem = this.properties.tabItem;
            let tabItemLength = [];
            let underLine_width = [];      // 下划线宽度 = 字符数 * 单个字符宽度 
            let underLine_left = [];       // 下划线偏移 = (2n+1)*内间距 + 前n个宽度; n = 下标
            tabItem.map((item,index) => {
                // 处理得到 tabItemLength
                const SHUANG_ZI_JIE = item["title"].match(/[\u4e00-\u9fa5+]/g) || '';
                const DAN_ZI_JIE = item["title"].match(/[\w]/g) || '';
                const Emoji = item["title"].match(/[^\w\u4e00-\u9fa5+][^\s]/g) || '';
                if(SHUANG_ZI_JIE || DAN_ZI_JIE) {
                    tabItemLength[index] = SHUANG_ZI_JIE.length * 2 + DAN_ZI_JIE.length * 0.8 + Emoji.length * 0.8
                }
                console.log(Emoji,Emoji.length);
                // 处理得到 underLine_width ------ 18是多次实验得到，30是内边距
                underLine_width[index] = tabItemLength[index] * 18 + 28;
                // console.log(underLine_width);
                // 处理得到 underLine_left
                const accumulate_Width = () => {
                    let accumulate_Width = 0;
                    for(let i = 0; i< tabItemLength.length-1; i++) {
                        accumulate_Width += tabItemLength[i] * 18 + 27;
                    }
                    return accumulate_Width;
                }
                underLine_left[index] = accumulate_Width();
                // console.log(underLine_left,accumulate_Width());
            })

            this.setData({ 
                tabItemLength,
                underLine_width,
                underLine_left
            });
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        setTab(e) {
            this.setData({
                activeItem:e.currentTarget.dataset["index"],
            })
            console.log(this.data.activeItem);
            this.triggerEvent("setTab", e)
        }
    }
})
