import React, { useState, useEffect, ReactNode, FC, useRef } from 'react';
import { updateTask, getTaskListByAccount, getCaptchaData, initTaskListByAccount } from '../../../api/index'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChainId } from 'artswap'
import { getEtherscanLink } from '../../../utils'
import { ExternalLink } from '../Common/ExternalLink'
import { TaskInfo } from '../../../utils/campaignClient';
import { Button, Spin } from 'antd';
import { failed, ongoing, finish } from '../Common/StatusIcon';
import { buttonStyle, buttonDisabledStyle } from '../Common/Button'
import artelaIcon from '../../../assets/icon/artela.png'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi';
import Image from 'next/image';
import GoCaptcha from 'go-captcha-react';
import { useMutation } from '@tanstack/react-query';
import { message } from "antd"

interface IntroduceProps {
    getTaskList: () => void;
    taskInfo?: TaskInfo;
    captcha: ReactNode;
    initLoading: boolean;
}
// types.ts
export interface Thumbnail {
    thumbX: number;
    thumbY: number;
    thumbWidth: number;
    thumbHeight: number;
    image: string;
    thumb: string;
}
export default function Introduce({ getTaskList, taskInfo, captcha, initLoading }: IntroduceProps) {
    const { address: account, isConnected } = useAccount();
    const [taskStatus, setTaskStatus] = useState(5)
    const [captcha_key, setCaptcha_key] = useState('')
    const location = useRouter()
    const [messageApi, contextHolder] = message.useMessage();
    const captchaRef = useRef<HTMLDivElement>(null);

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false)
    const initialThumbnail: Thumbnail = {
        thumbX: 50,
        thumbY: 50,
        thumbWidth: 100,
        thumbHeight: 100,
        image: '/artLogo3.png',
        thumb: '/completed.svg',
    };
    const newTaskQuery = useMutation({
        mutationFn: (variables: { account: string, taskId: string, captPoint: string, captKey: string }) => {
            return initTaskListByAccount(variables.account, variables.taskId, variables.captPoint, variables.captKey);
        },
        onSuccess: (data) => {

        },
        onError: (error) => {
            console.log(88888, error)
        }
    })
    const [thumbnail, setThumbnail] = useState<Thumbnail>(initialThumbnail);
    const getQueryParams = () => {
        if (Array.isArray(location.query.taskId)) {
            return location.query.taskId[0]
        } else {
            return location.query.taskId || ''
        }

    }
    const formatAddress = (address: string | undefined | null): string => {
        if (!address) {
            return ''
        }
        if (address.length < 20) {
            return ''
        }
        // 提取前11位
        const first11 = address.substr(0, 11);
        // 提取后9位
        const last9 = address.substr(address.length - 9);
        // 返回格式化后的字符串
        return `${first11}...${last9}`;
    }
    const getFaucet = async () => {
        setLoading(true)
        try {
            if (account && taskInfo) {
                const res = await updateTask(account, taskInfo.id, '1');
                if (res.success) {
                    const taskInfoRes = await getTaskListByAccount(account, taskInfo.id);
                    if (taskInfoRes.success) {
                        setTaskStatus(taskInfoRes.data.taskInfos[0].taskStatus);
                        fetchTaskInfo();
                    }
                }
            }
        } catch (error) {
            console.error(error); // 处理或记录错误
        } finally {
            setLoading(false); // 在这里统一停止加载状态
        }
    }
    const fetchTaskInfo = async () => {
        if (account && taskInfo) {
            const taskInfoRes = await getTaskListByAccount(account, taskInfo.id);
            if (taskInfoRes.success) {
                const newTaskStatus = taskInfoRes.data.taskInfos[0].taskStatus;
                setTaskStatus(newTaskStatus);
                if (newTaskStatus === 1 || newTaskStatus === 2) {
                    setTimeout(fetchTaskInfo, 1000); // 如果状态是1或2，1秒后再次查询
                } else if (newTaskStatus === 3) {
                    getTaskList()
                }
            }
        }

    }
    const getCaptcha = async () => {
        const res = await getCaptchaData();
        setCaptcha_key(res.captcha_key)
        setThumbnail({
            thumbX: res.tile_x,
            thumbY: res.tile_y,
            thumbWidth: res.tile_width,
            thumbHeight: res.tile_height,
            image: res.image_base64,
            thumb: res.tile_base64
        })
    }
    useEffect(() => {
        getCaptcha()
    }, [])
    useEffect(() => {
        if (taskInfo) {
            setTaskStatus(taskInfo.taskStatus)
        }
    }, [taskInfo])
    useEffect(() => {
        if (captchaRef.current) {
            // 使用 MutationObserver 监听 DOM 变化，确保目标元素已经渲染完成
            const observer = new MutationObserver(() => {
                const targetElement = captchaRef.current?.querySelector('.gocaptcha-module_header__LjDUC span');
                if (targetElement && targetElement.textContent === '请拖动滑块完成拼图') {
                    targetElement.textContent = 'Please drag the slider to complete the puzzle';
                    observer.disconnect(); // 修改完成后断开观察器
                }
            });

            observer.observe(captchaRef.current, { childList: true, subtree: true });

            // 在组件卸载时断开观察器
            return () => observer.disconnect();
        }
    }, [captchaRef.current]);
    interface SlideCaptchaModalProps {
        show: boolean;
        onClose: () => void;
        account: string;
        newTaskQuery: { mutate: (data: any) => void };
        getCaptcha: () => void;
        thumbnail: {
            thumbX: number;
            thumbY: number;
            thumbWidth: number;
            thumbHeight: number;
            image: string;
            thumb: string;
        };
        captcha_key: string;
    }

    const SlideCaptchaModal: FC<SlideCaptchaModalProps> = ({ show, onClose, account, newTaskQuery, getCaptcha, thumbnail, captcha_key }) => {
        if (!show) {
            return null;
        }

        return (
            <div style={modalBackgroundStyle} ref={captchaRef}>
                <GoCaptcha.Slide
                    config={{
                        showTheme: true,
                        verticalPadding: 15,
                        horizontalPadding: 10,
                        thumbWidth: 1,
                        width: 300,
                        height: 220,
                    }}
                    data={thumbnail}
                    events={{
                        confirm(point) {
                            if (account) {
                                newTaskQuery.mutate({ account, taskId: getQueryParams(), captPoint: `${point.x},${point.y - 7}`, captKey: captcha_key });
                            }
                        },
                        close() {
                            setShowModal(false)
                        },
                        refresh() {
                            getCaptcha();
                        },
                    }}
                />
            </div>
        );
    };

    const modalBackgroundStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };
    return (
        <div className="introduce">
            {contextHolder}
            <div className='bkimg'>
                <div className="img_container text-48px text-bold">
                    <text>
                        Testnet Faucet <br />
                    </text>
                    <div className="icon-container">
                        <Image alt='img' height={32} style={{ height: '30px' }} src={artelaIcon} ></Image>
                    </div>
                </div>
            </div>

            <div className='head_title' style={{ marginTop: '60px' }}>
                Connect Artela Testnet & Claim Test Tokens
            </div>
            <div className='my_card'>
                <div className='claim_box'>
                    <div className='subTitle'>Step1: Connect to Artela Testnet<br /> <text style={{ color: 'gray ', fontSize: '16px' }}>please use Metamask Wallet to finish these tasks.</text></div>
                    <ConnectButton />
                    <div className='subTitle'>Step2: Claim Test Tokens</div>
                    <button onClick={() => setShowModal(true)}>Show Captcha</button>
                    <SlideCaptchaModal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        account={account || ''}
                        newTaskQuery={newTaskQuery}
                        getCaptcha={getCaptcha}
                        thumbnail={thumbnail}
                        captcha_key={captcha_key}
                    />

                    <div style={{ width: '600px' }}>
                        <Button type='primary' disabled={taskStatus !== 0 && taskStatus !== 4&& taskStatus !== 5} style={taskStatus == 5 || taskStatus == 0 || taskStatus === 4 ? buttonStyle : buttonDisabledStyle} loading={loading || initLoading} onClick={() => getFaucet()} className='my_button'>claim tokens</Button>
                    </div>
                    <div className='claim_res'>
                        {taskStatus !== 0 && taskStatus !== 5 && <div className='subTitle'>Claim Transactions</div>}

                        {taskStatus == 1 || taskStatus == 2 ? <>
                            <div style={{ fontSize: '24px' }}>
                                <Spin /> {`Queueing...`}
                            </div>
                        </> : taskInfo ? (taskInfo.txs && (<>
                            <div className='subTitle'>
                                <div className='subDescribe'>
                                    <div>
                                        ART: 2 &nbsp;
                                        <ExternalLink href={getEtherscanLink(ChainId.ARTELATESTNET, taskInfo?.txs?.split(',')[0], 'transaction')}> {formatAddress(taskInfo?.txs?.split(',')[0])} </ExternalLink><text style={{ color: '#2F9E44' }}>{taskStatus == 4 ? failed() : taskStatus == 3 ? finish() : taskStatus == 2 ? ongoing() : ''}</text>
                                        {taskStatus == 4 && <text className='error-message'>Claim token failed, please claim again</text>}
                                    </div>
                                    <div>
                                        To claim more faucets, please Join 🚰 <ExternalLink href='https://docs.artela.network/develop/resources/faucet'>
                                            Artela Discord
                                        </ExternalLink>
                                    </div>
                                </div>
                            </div>
                        </>)) : ''}
                    </div>
                </div>
                <div className='task_swap' style={{ width: '450px' }}>
                    <div>

                    </div>
                </div>
            </div>
        </div>
    );
}
