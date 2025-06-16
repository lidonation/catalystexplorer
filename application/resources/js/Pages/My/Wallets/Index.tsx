import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Paginator from '@/Components/Paginator'
import MyLayout from '../MyLayout'
import Card from '@/Components/Card'
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext'
import RecordsNotFound from '@/Layouts/RecordsNotFound'
import Button from '@/Components/atoms/Button'
import Paragraph from '@/Components/atoms/Paragraph'
import CopyIcon from '@/Components/svgs/CopyIcon'
import CheckIcon from '@/Components/svgs/CheckIcon'

interface WalletStats {
  all_time_votes: number;
  stakeAddress: string;
  funds_participated: string[];
  balance: string;
  status?: boolean;
}

const Wallets = () => {
  const {
    connectedWallets,
    openConnectWalletSlider,
    disconnectWallet
  } = useConnectWallet()

  const [copySuccesses, setCopySuccesses] = useState<Record<string, boolean>>({})
  const [walletStats, setWalletStats] = useState<Record<string, WalletStats>>({})
  const [isInitializing, setIsInitializing] = useState(true)
  const { t } = useTranslation();

  const PAGE_SIZE = 4

  const [currentPage, setCurrentPage] = useState(1)
  const total = connectedWallets.length
  const last_page = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = (currentPage - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  const paginatedWallets = connectedWallets.slice(start, end)

  const pagination = {
    data: paginatedWallets,
    current_page: currentPage,
    last_page,
    per_page: PAGE_SIZE,
    total,
    from: total === 0 ? 0 : start + 1,
    to: total === 0 ? 0 : Math.min(end, total),
  }

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false)
    }, 800)

    if (connectedWallets.length > 0) {
      connectedWallets.forEach(wallet => {
        if (wallet.stakeAddress && !walletStats[wallet.id]) {
          const currentLocale = window.location.pathname.split('/')[1] || 'en';
          const lookupUrl = `/${currentLocale}/my/wallets/${wallet.stakeAddress}/lookup-json`;

          fetch(lookupUrl, {
            headers: { Accept: 'application/json' },
          })
            .then((res) => res.json())
            .then((data) => {
              setWalletStats(prev => ({
                ...prev,
                [wallet.id]: data.walletDetails
              }))
            })
            .catch((err) => {
              console.error(`Failed to fetch wallet data for ${wallet.name}:`, err)
              setWalletStats(prev => ({
                ...prev,
                [wallet.id]: {
                  all_time_votes: 0,
                  stakeAddress: wallet.stakeAddress,
                  funds_participated: [],
                  balance: 'N/A',
                  status: false
                }
              }))
            })
        }
      })
    }

    return () => clearTimeout(initTimer)
  }, [connectedWallets])

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopySuccesses(prev => ({ ...prev, [value]: true }))
      setTimeout(() => {
        setCopySuccesses(prev => ({ ...prev, [value]: false }))
      }, 2000)
    })
  }

  const handleDisconnectWallet = (walletId: string) => {
    disconnectWallet(walletId)
    setWalletStats(prev => {
      const updated = { ...prev }
      delete updated[walletId]
      return updated
    })
  }

  const formatWalletName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  if (isInitializing) {
    return (
      <MyLayout>
        <div className="mx-auto px-4 py-4 max-w-8xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-content">{t('my.wallets')}</h1>
              <Paragraph className="text-sm text-slate-500">
                {t('my.manageWallets')}
              </Paragraph>
            </div>
            <Button
              onClick={openConnectWalletSlider}
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-md"
            >
             {t('my.addWallet')}
            </Button>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="text-sm text-slate-500">{t('my.loadWallets')}</div>
          </div>
        </div>
      </MyLayout>
    )
  }

  return (
    <MyLayout>
      <div className="mx-auto px-4 py-4 max-w-8xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-content">{t('my.wallets')}</h1>
            <Paragraph className="text-sm text-slate-500">
              {t('my.manageWallets')}
            </Paragraph>
          </div>
          <Button
            onClick={openConnectWalletSlider}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            {t('my.addWallet')}
          </Button>
        </div>

        {connectedWallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RecordsNotFound />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedWallets.map((wallet) => {
                const stats = walletStats[wallet.id]

                return (
                  <Card
                    key={wallet.id}
                    className="bg-white rounded-xl shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex justify-between items-center h-14 px-5 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-content">
                          {formatWalletName(wallet.name)}
                        </h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {wallet.networkName}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDisconnectWallet(wallet.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-5 py-2 rounded-md"
                      >
                        <Paragraph className="text-3 text-white group-hover:text-error">
                                                {t('wallet.connect.disconnect')}
                        </Paragraph>
                      </Button>
                    </div>

                    <div className="divide-y divide-gray-100 px-5 text-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 py-4">
                        <WalletItem
                          label={t('my.balance')}
                          value={stats?.balance || 'Loading...'}
                        />
                        <WalletItem
                        label={t('transactions.drepStatus')}>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-md outline outline-1 outline-offset-[-1px] ${
                              stats?.status
                                ? 'bg-green-100 text-green-600 outline-green-300/50'
                                : 'bg-red-100 text-red-600 outline-red-300/50'
                            }`}
                          >
                            {stats ? (stats.status ? 'Active' : 'Inactive') : 'Loading...'}
                          </span>
                        </WalletItem>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 py-4">
                        <WalletItem
                          label={t('transactions.allTimeVotes')}
                          badge
                          value={stats ? `${stats.all_time_votes.toLocaleString()} votes` : 'Loading...'}
                        />
                        <WalletItem
                          label={t('transactions.fundsParticipated')}
                          badge
                          value={stats ? (stats.funds_participated?.length || 0).toString() : 'Loading...'}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 py-4">
                        <WalletItem label={t('transactions.table.stakeAddress')}>
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-mono text-sm text-slate-800 dark:text-content font-medium truncate">
                              {wallet.stakeAddress || 'N/A'}
                            </span>
                            {wallet.stakeAddress && (
                              <Button
                                onClick={() => handleCopy(wallet.stakeAddress)}
                                className="text-content-light hover:text-content p-1 hover:bg-gray-100 rounded"
                              >
                                {copySuccesses[wallet.stakeAddress] ? (
                                  <CheckIcon className="h-4 w-4 text-green-600" />
                                ) : (
                                  <CopyIcon className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </WalletItem>

                        <WalletItem label={t('transactions.paymentAddress')}>
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-mono text-sm text-slate-800 dark:text-content font-medium truncate">
                              {wallet.userAddress}
                            </span>
                            <Button
                              onClick={() => handleCopy(wallet.userAddress)}
                              className="text-content-light hover:text-content p-1 hover:bg-gray-100 rounded"
                            >
                              {copySuccesses[wallet.userAddress] ? (
                                <CheckIcon className="h-4 w-4 text-green-600" />
                              ) : (
                                <CopyIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </WalletItem>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                        {t('my.moreWalletsDetails')}
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
              <div className="mt-8 w-full">
                <div className="flex items-center w-full">
                  <div className="flex-1 flex justify-start">
                    <Button
                      className="text-sm flex items-center gap-1"
                      onClick={() => setCurrentPage(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <span className="text-xs">
                      Showing {pagination.from} - {pagination.to} of <span className="font-bold">{pagination.total}</span>
                    </span>
                  </div>
                  <div className="flex-1 flex justify-end">
                    <Button
                      className="text-sm flex items-center gap-1"
                      onClick={() => setCurrentPage(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>



          </>
        )}
      </div>
    </MyLayout>
  )
}

const WalletItem = ({
  label,
  value,
  badge = false,
  children,
  className = ""
}: {
  label: string
  value?: string
  badge?: boolean
  children?: React.ReactNode
  className?: string
}) => (
  <div className={`flex items-start min-w-0 ${className}`}>
    <div className="w-32 sm:w-40 text-slate-500 text-sm flex-shrink-0 pt-0.5">
      {label}
    </div>
    <div className="min-w-0 flex-1">
      {children ? (
        children
      ) : badge && value ? (
        <span className="px-2 py-0.5 bg-gray-50 text-xs text-slate-700 font-medium rounded-md outline outline-1 outline-offset-[-1px] outline-gray-200">
          {value}
        </span>
      ) : (
        <div className="text-slate-800 dark:text-content font-medium">
          {value || <span className="text-slate-400">—</span>}
        </div>
      )}
    </div>
  </div>
)

export default Wallets
