import { Head, Link } from '@inertiajs/react';
import { Transaction } from './Index';

interface TransactionDetailProps {
  transaction: Transaction;
  metadataLabels: { id: number; name: string }[]; // Array of label objects
  primaryLabel: string;
}

export default function TransactionDetail({ 
  transaction, 
  metadataLabels, 
  primaryLabel 
}: TransactionDetailProps) {
  return (
    <>
      <Head title="Catalyst Transactions Single" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-background overflow-hidden shadow-xl sm:rounded-lg p-6">
            <Link
              href={'/catalyst-txns'}
              className="mb-6 inline-block text-indigo-600"
            >
              &larr; Back to Transactions
            </Link>
            <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Transaction Hash</dt>
                    <dd className="mt-1 text-sm text-content break-all">{transaction.hash}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Block ID</dt>
                    <dd className="mt-1 text-sm text-content">{transaction.block_id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Transaction Index</dt>
                    <dd className="mt-1 text-sm text-content">{transaction.tx_index}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Valid</dt>
                    <dd className="mt-1 text-sm text-content">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.is_valid ? 'Valid' : 'Invalid'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Transaction Type</dt>
                    <dd className="mt-1 text-sm text-content">
                      <div className="flex flex-col flex-wrap gap-1">
                        {metadataLabels && metadataLabels.length > 0 ? (
                          metadataLabels.map((label) => (
                            <span
                              key={label.id}
                              className="inline-flex rounded-full px-2 text-xs font-medium bg-blue-100 text-blue-800 w-fit"
                            >
                              {label.name}
                            </span>
                          ))
                        ) : (
                          <span>{primaryLabel}</span>
                        )}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
                <div className="space-y-4">
                  {transaction.inputs && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Inputs</dt>
                      <dd className="mt-1 text-sm text-content bg-gray-50 p-4 rounded overflow-auto max-h-40 bg-background-lighter">
                        <pre>{JSON.stringify(typeof transaction.inputs === 'string' ? JSON.parse(transaction.inputs) : transaction.inputs, null, 2)}</pre>
                      </dd>
                    </div>
                  )}
                  
                  {transaction.outputs && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Outputs</dt>
                      <dd className="mt-1 text-sm text-content bg-gray-50 p-4 rounded overflow-auto max-h-40 bg-background-lighter">
                        <pre>{JSON.stringify(typeof transaction.outputs === 'string' ? JSON.parse(transaction.outputs) : transaction.outputs, null, 2)}</pre>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Add metadata content visualization */}
            {transaction.metadata && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Metadata Content</h3>
                <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96 bg-background-lighter">
                  <pre className="text-sm text-content">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}