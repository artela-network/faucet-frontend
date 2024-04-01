import React, { useEffect, useState } from 'react'
import { useActiveWeb3React } from '../../../hooks'
import Swap from '../../../pages/SwapForTask2'
import TaskBox from "../Common/TaskBox";
import { Button } from 'antd';
import { updateTask, getTaskListByAccount } from '../../../api/activity'
import { TaskInfo } from '../../../utils/campaignClient'
import './style.css'
// import { buttonStyle, buttonDisabledStyle } from '../Common/Button'
import SuccessCover from '../Common/SuccessCover'

interface PropsType {
  getTaskList?: () => void;
  taskInfo: TaskInfo;
}
const SecondTask = ({ taskInfo }: PropsType) => {
  const footerWords = `That's how typically rug-pull happens, malicious smart contracts instantly increase a huge amount of token supply for him own, and then swap out your valuable assets.`
  const buttonStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    fontSize: '20px',
    color: '#ffffff',
    background: '#2172E5',
    border: 'none',
    borderRadius: '5px',
    transition: 'background 0.3s ease',
    height: '50px',
    width: '188px',
  };
  const buttonDisabledStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    fontSize: '20px', // 稍微减小字体大小，使按钮看起来更加“静态”
    color: '#dddddd', // 改为灰色，表示不可用
    background: '#8fa2bf', // 使用更暗或更灰的背景色来表示按钮不可点击
    border: 'none',
    borderRadius: '5px',
    transition: 'background 0.3s ease',
    height: '50px',
    width: '188px',
    cursor: 'not-allowed', // 显示一个不允许的光标，进一步指示按钮不可用
    opacity: '0.6', // 降低透明度，增加不可用的视觉效果
    pointerEvents: 'none', // 确保用户不能点击或以其他方式与按钮交互
  };
  const { account } = useActiveWeb3React()
  const [swapLoading, setSwapLoading] = useState(false)
  const [fromVal, setFromVal] = useState('0')
  const [toVal, setToVal] = useState('0')
  const [supplyWords, setSupplyWords] = useState('Total supply: 1B')
  const [taskStatus, setTaskStatus] = useState<number>(5)
  const [loading, setLoading] = useState(false)
  const inreaseRUG = async () => {
    if (account && taskInfo) {
      setLoading(true)
      await updateTask(account, taskInfo.id, '1')
      setLoading(false)
      setSupplyWords('Total supply: 1B -> 3B')
      setFromVal('3B')
      setToVal('1B')
    }

  }
  const updateTaskStatus = async () => {
    if (account && taskInfo) {
      const res = await updateTask(account, taskInfo.id, '3')
      if (res.success) {
        setSwapLoading(true)
        const taskInfoRes = await getTaskListByAccount(account, taskInfo.id)
        if (taskInfoRes.success) {
          setTaskStatus(taskInfoRes.data.taskInfos[0].taskStatus)
        }
        setSwapLoading(false)
      }
    }
  }
  useEffect(() => {
    if (taskInfo) {
      setTaskStatus(taskInfo.taskStatus)
      if (taskInfo.taskStatus == 1 || taskInfo.taskStatus == 3) {
        setSupplyWords('Total supply: 1B -> 3B')
        setFromVal('2,000,000,000 (2 Billion)')
        setToVal('666.7')
      }
    }
  }, [taskInfo])
  return (
    <>
      <div className="head_title">
        Task 2: &nbsp;Simulated experience rug pull
      </div>
      <TaskBox taskStatus={taskStatus} footer={footerWords}>
        <div className="task_guide">
          <div className='subTitle'>Step1: Click 👇 button to Increase 2B $RUG</div>
          <Button loading={loading} disabled={taskStatus == 1 || taskStatus == 3} style={taskStatus == 0 || taskStatus == 4 ? buttonStyle : buttonDisabledStyle} type="primary" onClick={inreaseRUG}> Increase </Button>
          <div className='subDescribe'>{supplyWords} </div>
          <div className='subTitle mt-20'>Step2: Swap 3B $RUG</div>
          <div className='subDescribe'>Click swap button to sell all $Rug 👉</div>
        </div>
        <div className="task_swap" style={{ marginLeft: '15px', position: 'relative' }}>
        {taskStatus == 3 && <SuccessCover />}
          <Swap taskStatus={taskStatus} updateTaskStatus={updateTaskStatus} fromVal={fromVal} toVal={toVal} swapLoading={swapLoading} disabled={taskStatus!=1}/>
        </div> 
      </TaskBox>
    </>
  )
}
export default SecondTask
