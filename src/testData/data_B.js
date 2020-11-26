let dataB = {
    name: '流程B',
    nodeList: [
        {
            id: 'node0',
            name: '开始',
            type: 'start',
            left: '18px',
            top: '223px',
            state: 0 // 默认状态
        },
        {
            id: 'nodeA',
            name: '节点A',
            type: 'chat',
            left: '168px',
            top: '223px',
            state: 3 // 已完成
        },
        {
            id: 'nodeB',
            type: 'task',
            name: '流程B-节点B',
            left: '411px',
            top: '96px',
            state: 1 // 已过期
        },
        {
            id: 'nodeC',
            name: '流程B-节点C',
            type: 'task',
            left: '414px',
            top: '351px',
            state: 2 // 快过期
        }, {
            id: 'nodeD',
            name: '流程B-节点D',
            type: 'task',
            left: '643px',
            top: '215px',
            state: 4 // 待审核
        }, {
            id: 'nodeE',
            name: '结束',
            type: 'end',
            left: '883px',
            top: '215px',
            state: ''
        }
    ],
    lineList: [{
        from: 'node0',
        to: 'nodeA',
        label: ''
    },{
        from: 'nodeA',
        to: 'nodeB',
        label: '条件A'
    }, {
        from: 'nodeA',
        to: 'nodeC',
        label: '条件B'
    }, {
        from: 'nodeB',
        to: 'nodeD'
    }, {
        from: 'nodeC',
        to: 'nodeD'
    }, {
      from: 'nodeD',
      to: 'nodeE',
      label: ''
    }
    ]
}

export function getDataB () {
    return dataB
}
