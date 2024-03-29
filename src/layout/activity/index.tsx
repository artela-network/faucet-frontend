import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './activity.css'
import Introduce from '../components/introduce/index'
import TaskList from '../components/TaskList/index'
import FirstTask from '../components/FirstTask/index'
import SecondTask from '../components/SecondTask/index'
import ThirdTask from '../components/ThirdTask/index'
import Explain from '../components/Explain/index'
import { useActiveWeb3React } from '../../hooks'
import { getTaskListByAccount, initTaskListByAccount } from '../../api/activity'

export default function Activity() {
  const { account } = useActiveWeb3React()
  const [taskStatus, setTaskStatus] = useState(0)
  const [taskInfos, setTaskInfos] = useState([])
  const location = useLocation()
  const intervalId = useRef<NodeJS.Timeout | null>(null)

  const getQueryParams = () => {
    const queryParams = new URLSearchParams(location.search)
    const taskId = queryParams.get('taskId')
    if (taskId !== null) {
      return taskId.split('/')[0]
    } else {
      return ''
    }
  }
  const getTaskList = async (attempt = 0): Promise<boolean> => {
    if (account) {
      const res = await getTaskListByAccount(account)
      if (res.success) {
        setTaskStatus(res.data.status)
        if (res.data.taskInfos) {
          setTaskInfos(res.data.taskInfos)

          for (let i = 0; i < res.data.taskInfos.length; i++) {
            if (res.data.taskInfos[i].taskStatus !== 3) {
              return false
            }
          }

          return true
        } else if (attempt < 2) {
          const initRes = await initTaskListByAccount(account, getQueryParams())
          if (initRes.success) {
            return getTaskList(attempt + 1)
          }
        }
      }
    } else {
      setTaskInfos([])
    }

    return false
  }

  useEffect(() => {
    if (!account) {
      return
    }

    const init = async () => {
      let allDone = await getTaskList()

      if (intervalId.current) {
        clearInterval(intervalId.current)
      }

      if (!allDone) {
        intervalId.current = setInterval(async () => {
          allDone = await getTaskList()
          if (allDone && intervalId.current) {
            clearInterval(intervalId.current)
            intervalId.current = null
          }
        }, 8000)
      }
    }

    init()

    return () => {
      if (intervalId.current) clearInterval(intervalId.current)
    }
  }, [account])

  return (
    <div className="activity">
      <Introduce getTaskList={getTaskList} taskInfo={taskInfos[0]} />
      <TaskList />
      <FirstTask taskInfo={taskInfos[1]} />
      <SecondTask taskInfo={taskInfos[2]} />
      <ThirdTask getTaskList={getTaskList} taskInfo={taskInfos[3]} />
      <Explain />
    </div>
  )
}
