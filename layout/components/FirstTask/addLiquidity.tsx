import React, { useCallback, useContext } from 'react'
import { Button } from 'antd'
import styles from '../FirstTask/styles.module.css'
import { Plus } from 'react-feather'
import Image from 'next/image'

interface PropType {
    taskStatus: number,
    updateTaskStatus: any;
    fromVal: string;
    toVal: string;
    swapLoading: boolean;
    disabled: boolean;
}
export default function AddLiquidity({ taskStatus, updateTaskStatus, fromVal, toVal, swapLoading, disabled }: PropType) {

    const buttonStyle = {
        display: 'inline-block',
        padding: '10px 20px',
        fontSize: '20px',
        color: '#ffffff',
        background: '#2172E5',
        border: 'none',
        borderRadius: '15px',
        transition: 'background 0.3s ease',
        height: '60px',
        width: '100%'
    };
    const disButtonStyle = {
        display: 'inline-block',
        padding: '10px 20px',
        fontSize: '20px',
        color: '#dddddd', // 改为灰色，表示不可用
        background: '#59677E', // 使用更暗或更灰的背景色来表示按钮不可点击
        border: 'none',
        borderRadius: '15px',
        transition: 'background 0.3s ease',
        height: '60px',
        width: '100%'
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className={styles.box}>
                <div className={styles.header}>Add Liquidity</div>
                <div className={styles.main}>
                    <div className={styles.input}>
                        <div className={styles.dJQRda}>Input</div>
                        <div className={styles.lldVYp}>
                            <div className={styles.dKIWpo}>
                                1
                            </div>
                            <div className={styles.hempoT}>
                            <Image style={{backgroundColor:'white',borderRadius:'50%',margin:'0 15px'}} alt='logo' width={32} height={32} src={'/artLogo3.png'}></Image>
                                <span>
                                    Art
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.iconBox}>
                        <Plus size="16" />
                    </div>
                    <div className={styles.input}>
                        <div className={styles.dJQRda}>Input</div>
                        <div className={styles.lldVYp}>
                            <div className={styles.dKIWpo}>
                                998009
                            </div>
                            <div className={styles.hempoT}>
                                <div style={{ width: '32px', height: '32px', fontSize: '25px', lineHeight: '32px', margin: '0px 10px' }}>
                                    😈
                                </div>
                                <span>
                                    Rug
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.footer}>
                    <Button disabled={disabled} style={disabled ? disButtonStyle : buttonStyle} onClick={updateTaskStatus} loading={swapLoading}>Supply</Button>
                </div>
            </div>
        </div>
    )
}

