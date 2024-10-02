import constructGetUrl from '../utils/constructGetUrl'
import xfetch from '../utils/xfetch';
// const host = process.env.NEXT_PUBLIC_FAUCET_URL ? process.env.NEXT_PUBLIC_FAUCET_URL : "http://192.168.3.247:9211"
const host = process.env.NEXT_PUBLIC_FAUCET_URL ? process.env.NEXT_PUBLIC_FAUCET_URL : "https://faucet-center.artela.network"

// const host = "https://campaign.artela.network"

const getTaskListByAccount = async (account: string, id?: number) => {
    const response = await fetch(constructGetUrl(`${host}/api/goplus/tasks`, { accountAddress: account, id }), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    return data;
}
const getCaptchaData = async () => {
    const response = await xfetch(`${host}/api/captcha/captcha-data`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    return data;
}

const initTaskListByAccount = async (account: string, taskId: string, captPoint: string, captKey: string,disconnect:()=>void) => {
    const response = await xfetch(`${host}/api/goplus/new-task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            accountAddress: account,
            taskId,
            captPoint,
            captKey
        })
    })
    console.log(response)
    if(response.status == 401){
        disconnect()
    }
    const data = await response.json();
    return data;
}
const syncTask = async (account: string, taskId: string) => {
    const response = await xfetch(`${host}/api/goplus/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            accountAddress: account,
            taskId
        })
    })
    const data = await response.json();
    return data;
}

const updateTask = async (account: string, id: number, taskStatus: string, txs?: string, memo?: string) => {
    const response = await xfetch(`${host}/api/goplus/update-task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            accountAddress: account,
            id,
            taskStatus,
            txs,
            memo
        })
    })
    const data = await response.json();
    console.log(data)
    return data;
}
export { getTaskListByAccount, initTaskListByAccount, updateTask, syncTask, getCaptchaData };
