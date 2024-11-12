"use client"
import React, { ReactNode, useEffect, useState } from "react"
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import {
    createAuthenticationAdapter,
    RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { useAccount } from "wagmi";
// const hostUrl = process.env.NEXT_PUBLIC_FAUCET_URL ? process.env.NEXT_PUBLIC_FAUCET_URL : "http://192.168.3.247:9211"
const hostUrl = process.env.NEXT_PUBLIC_FAUCET_URL ? process.env.NEXT_PUBLIC_FAUCET_URL : "https://faucet-center.artela.network"

const Dymic = ({ children }: { children: ReactNode }) => {
    const { address } = useAccount()
    const [AUTHENTICATION_STATUS, setAUTHENTICATION_STATUS] = useState<'loading' | 'unauthenticated' | 'authenticated'>('unauthenticated')
    const authenticationAdapter = createAuthenticationAdapter({
        getNonce: async () => {
            setAUTHENTICATION_STATUS('unauthenticated')
            const response = await fetch(`${hostUrl}/api/auth/nonce/${address}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            return data.nonce
        },

        createMessage: ({ nonce, address, chainId }) => {
            return new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in with Ethereum to the app.',
                uri: window.location.origin,
                version: '1',
                chainId,
                nonce,
            });
        },

        getMessageBody: ({ message }) => {
            return message.prepareMessage();
        },

        verify: async ({ message, signature }) => {
            const verifyRes = await fetch(`${hostUrl}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message.prepareMessage(), signature }),
            });
            const data = await verifyRes.json();
            if (data.success) {
                setAUTHENTICATION_STATUS('authenticated')
                //  把data.jwt 存到local中
                localStorage.setItem('jwt', data.jwt);
            } else {
                setAUTHENTICATION_STATUS("unauthenticated")
            }
            return Boolean(data.success);
        },

        signOut: async () => {
            setAUTHENTICATION_STATUS('unauthenticated')
            localStorage.removeItem('jwt');
            // 获取当前 URL 的查询参数
            const queryParams = window.location.search;
            // 跳转到首页，并保留查询参数
            window.location.href = `/${queryParams}`;
            // await fetch('/api/logout');
        },
    });
    useEffect(() => {
        const token = localStorage.getItem('jwt') || '';
        if (token) {
            setAUTHENTICATION_STATUS('authenticated');
        } else {
            setAUTHENTICATION_STATUS('unauthenticated');
        }
    }, []);
    return (
        <RainbowKitAuthenticationProvider
            adapter={authenticationAdapter}
            status={AUTHENTICATION_STATUS}
        >
            <RainbowKitProvider
            modalSize="compact" locale="en-US" theme={darkTheme()}>
                {children}
            </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
    )
}

export default Dymic