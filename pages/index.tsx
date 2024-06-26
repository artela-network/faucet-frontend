import type { NextPage } from 'next';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import Layout from '../layout';
const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  return (
    <>
      <Head>
        <title>Artela x SecWareX</title>
        <meta
          content="Generated by Atrela"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Layout />
    </>
  );
};

export default Home;
