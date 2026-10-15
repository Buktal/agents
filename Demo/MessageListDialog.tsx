import { Message } from '@common/types/message'
import { Box } from '@renderer/components/Layout'
import MessageItem from '@renderer/components/Message/MessageItem'
import { useMessages } from '@renderer/hooks/useMessage'
import { useActiveVisitor } from '@renderer/hooks/useVisitor'
import { FC, memo, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react'
import { ComputeItemKey, FollowOutput, ItemContent, Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import styled from 'styled-components'

// 定义props类型
type PageProps = {}
type Props = PropsWithChildren<PageProps>

const MessageListDialog: FC<Props> = () => {
  const visitor = useActiveVisitor()
  const messages = useMessages()

  const SessionVirtuosoRef = useRef<VirtuosoHandle>(null)
  const [followOutput, setFollowOutput] = useState<FollowOutput>('auto')
  const [atTop, setAtTop] = useState<boolean>(false)
  const [atBottom, setAtBottom] = useState<boolean>(false)

  const { visitorId, loadFirstItemIndex = 1000000 } = visitor

  useEffect(() => {
    window.SessionVirtuosoRef = SessionVirtuosoRef
  }, [])

  useEffect(() => {
    const realAtBottom = atTop ? false : atBottom // atBottom不一定真的在底部（atTop、atBottom可同时为true）
    setFollowOutput(realAtBottom ? 'smooth' : 'auto')
  }, [atBottom, atTop])

  const handleComputeItemKey: ComputeItemKey<Message, any> = useCallback((_: number, item: Message) => {
    return item.msgId
  }, [])

  const handleItemContent: ItemContent<Message, any> = useCallback((_: number, item: Message) => {
    return <MessageItem data={item} />
  }, [])

  return (
    <IDialogMessageList>
      <Virtuoso
        key={visitorId} // 触发 startReached 回调
        ref={SessionVirtuosoRef}
        // 虚拟滚动视口扩展距离，提前加载视口外项目。
        increaseViewportBy={{ bottom: 200, top: 300 }}
        // 滚动时多渲染一些项目，避免滚动时频繁触发 re-render。
        overscan={{ main: 200, reverse: 300 }}
        // 实现反向无限滚动时使用，结合 totalCount 减少此属性值，以向列表顶部追加项（警告：firstItemIndex 应该是一个正数，基于要显示的总项数）
        firstItemIndex={loadFirstItemIndex}
        // 列表初始位置
        initialTopMostItemIndex={{ index: 'LAST', align: 'end', behavior: 'auto' }}
        // 默认情况下，followOutput 只会在列表已经到底部时向下滚动
        followOutput={followOutput}
        // 当列表滚动到顶部或向下滚动时，会调用此回调并传入 true / false
        atTopStateChange={setAtTop}
        // 当列表滚动到底部或向上滚动时，会调用此回调并传入 true / false
        atBottomStateChange={setAtBottom}
        // 快速滚动时显示占位符内容，避免性能下降
        scrollSeekConfiguration={false}
        // 禁用 requestAnimationFrame 包装，优化性能但可能出现警告
        skipAnimationFrameInResizeObserver={true}
        // 要渲染的数据数组。设置这个后，会根据数组长度推断总数量
        data={messages}
        // 自定义列表每项的 key（React key），提升性能，避免重复渲染
        computeItemKey={handleComputeItemKey}
        // 渲染每个项目的回调函数。返回要显示的 React 元素
        itemContent={handleItemContent}
        // 设置默认项目高度，避免首次渲染探测
        defaultItemHeight={200}
      />
    </IDialogMessageList>
  )
}

// 样式定义
const IDialogMessageList = styled(Box)`
  flex: 0 1 auto;
  width: 100%;
  height: 100%;

  // Virtuoso
  & > div:first-child {
    width: 100%;
    height: 100%;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: #dadcdb;
      border-radius: 6px;
    }
  }

  & > div > div > div {
    & > div[data-index='0'] {
      padding-top: 6px;
    }
  }

  // Img
  img {
    &[data-type='IMAGE'] {
      cursor: pointer !important;
    }
  }
`

export default memo(MessageListDialog)
