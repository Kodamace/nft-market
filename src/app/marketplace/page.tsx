// src/app/discover/closet/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import {
  getAssetsByOwner,
  fetchNFTDetails,
  extractGroupAddress,
} from '@/utils/getAssets';
import Image from 'next/image';
import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import { getNFTDetail, getNFTList } from '@/utils/nftMarket';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface NFTDetail {
  name: string;
  symbol: string;
  image?: string;
  group?: string;
  mint: string;
  seller: string;
  price: string;
  listing: string;
  collection: string;
}

const trimAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

const Closet: React.FC = () => {
  const { publicKey } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [filters, setFilters] = useState({
    price: '',
    collection: '',
  });
  const [assets, setAssets] = useState<NFTDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const fetchNFTs = async () => {
    setIsLoading(true);
    const provider = new AnchorProvider(connection, wallet as Wallet, {});

    try {
      const listings = await getNFTList(provider, connection);
      // const mint = new PublicKey(listings[0].mint);
      // const detail = await getNFTDetail(mint, connection);
      const promises = listings
        .filter((list) => list.isActive)
        .map((list) => {
          const mint = new PublicKey(list.mint);
          return getNFTDetail(
            mint,
            connection,
            list.seller,
            list.price,
            list.pubkey
          );
        });
      const detailedListings = await Promise.all(promises);
      const hasFilters = filters.price || filters.collection;
      let finalAssets = hasFilters
        ? detailedListings.filter(
            (nftDetail) =>
              filters.price === nftDetail.price ||
              filters.collection === nftDetail.collection ||
              filters.price === nftDetail.price
          )
        : detailedListings;
      setAssets(finalAssets);
    } catch (errr) {
      console.log(errr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedWalletAddress = sessionStorage.getItem('walletAddress');
    const storedAssets = sessionStorage.getItem('assets');

    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }

    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
    fetchNFTs();
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, [wallet]);

  useEffect(() => {
    sessionStorage.setItem('walletAddress', walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    sessionStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  return (
    <div className="p-4 pt-20 bg-white dark:bg-black min-h-screen">
      <div className="flex flex-row items-center justify-evenly mb-12">
        <div className="flex flex-row items-center">
          <input
            type="text"
            value={filters.price}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder="Price"
            className="border border-gray-300 p-2 rounded w-1/2 bg-white dark:bg-black dark:text-gray-200 mr-8"
          />
          <input
            type="text"
            value={filters.collection}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, collection: e.target.value }))
            }
            placeholder="Collection"
            className="border border-gray-300 p-2 rounded w-1/2 bg-white dark:bg-black dark:text-gray-200 mr-8"
          />
          <button
            onClick={fetchNFTs}
            disabled={isLoading}
            className={`ml-2 p-2 rounded w-full ${
              isLoading ? 'bg-gray-300' : 'bg-blue-500 text-white'
            }`}
          >
            {isLoading ? 'Loading...' : 'Filter NFTs'}
          </button>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-center text-black dark:text-white">
        NFTs on sale
      </h1>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset: NFTDetail) => (
            <div
              key={asset.mint}
              className="relative p-4 border rounded shadow hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer bg-white dark:bg-black group"
            >
              <Link href={`/marketplace/${asset.mint}`}>
                <div className="relative h-64 w-full mb-4">
                  {asset.image ? (
                    <Image
                      src={asset.image}
                      alt={`Asset ${asset.mint}`}
                      layout="fill"
                      objectFit="contain"
                      className="rounded"
                    />
                  ) : (
                    <p>No Image Available</p>
                  )}
                </div>
              </Link>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex flex-col justify-end items-center opacity-0 group-hover:opacity-100 text-white text-xs p-2">
                <p className="font-semibold">{asset.name || 'Unknown'}</p>
                <Link
                  href={`https://solana.fm/address/${asset.mint}`}
                  target="_blank"
                  className="hover:text-gray-300 flex items-center"
                >
                  {trimAddress(asset.mint)}{' '}
                  <FaExternalLinkAlt className="ml-1" />
                </Link>
                {asset.group && (
                  <Link
                    href={`https://solana.fm/address/${asset.group}`}
                    target="_blank"
                    className="hover:text-gray-300 flex items-center"
                  >
                    Group: {trimAddress(asset.group)}{' '}
                    <FaExternalLinkAlt className="ml-1" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <h2 className="text-2xl font-bold mb-4 text-center text-red-500 dark:text-yellow">
          No NFTs on sale
        </h2>
      )}
    </div>
  );
};

export default Closet;
