import { useState } from 'react';
import Title from '@/Components/atoms/Title';
import { useTranslation } from 'react-i18next';
import { JsonWrapper } from '../../../Components/JsonDisplay';
import TransactionData = App.DataTransferObjects.TransactionData;

interface MetadataCardProps {
    transaction: TransactionData;
}

export default function MetadataCard({ transaction }: MetadataCardProps) {
  const { t } = useTranslation();
  const [showRawData, setShowRawData] = useState(false);

  return (
    <div className="bg-background rounded-lg p-6 mb-6">
      <div className='flex justify-between items-center border-b border-background-lighter pb-4'>
        <Title className='text-content font-bold' level='3'>{t('transactions.metadata')}</Title>
        <div className="flex items-center">
          <span className="text-sm text-gray-persist mr-2">{t('transactions.rawData')}</span>
          <div 
            onClick={() => setShowRawData(!showRawData)}
            className={
                `w-7 h-4 p-1 ${showRawData ? 'bg-primary' :
                'bg-background-lighter shadow-[inset_0px_2px_5px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-light-persist'} rounded-[30px] inline-flex ${showRawData ? 'justify-end' : 
                'justify-start'} items-center gap-2.5 cursor-pointer transition-colors duration-300`
            }
            data-public-profile-switch={showRawData ? "on" : "off"}
          >
            <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${
                      showRawData ? 'translate-x-1' : 'translate-x-0'
                  }`}
            />
          </div>
        </div>
      </div>
      
      {transaction.raw_metadata && !showRawData && (
        <div className="space-y-4 pt-4">
          {Object.entries(transaction.raw_metadata).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="text-gray-persist w-24">{key}</span>
              <span className="text-content font-bold bg-background-lighter px-2 py-1 rounded-sm break-all">
                {typeof value === 'object' 
                  ? JSON.stringify(value) 
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {transaction.raw_metadata && showRawData && (
        <div className="p-4 mt-4 rounded-xl bg-background-json">
          {Object.entries(transaction.raw_metadata).map(([key, value]) => (
            <div key={key} className="mb-6">
              <div className="text-light-persist font-bold text-lg pb-2 border-b border-background-lighter mb-4">{key}</div>
              <div className="p-4 rounded-md text-light-persist overflow-hidden">
                {typeof value === 'object' ? (
                  <pre className="whitespace-pre-wrap text-sm">
                    <JsonWrapper data={value} />
                  </pre>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm">
                    {'{'}
                    <div className="pl-4">
                      <span className="text-json-key">"{key}"</span>:
                      {typeof value === 'number' ? (
                        <span className="text-primary"> {value}</span>
                      ) : (
                        <span className="text-json-string"> "{String(value)}"</span>
                      )}
                    </div>
                    {'}'}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
