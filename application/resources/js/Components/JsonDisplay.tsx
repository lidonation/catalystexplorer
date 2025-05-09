import React from 'react';

interface JsonDisplayProps {
  data: any;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  if (typeof data !== 'object' || data === null) {
    if (typeof data === 'string') {
      return <span className="text-json-string">"{data}"</span>;
    }
    if (typeof data === 'number') {
      return <span className="text-light-persist">{data}</span>;
    }
    return <span>{String(data)}</span>;
  }

  return (
    <div className="pl-4">
      {Object.entries(data).map(([key, value], index) => (
        <div key={index} className="mb-1">
          <span className="text-json-key">"{key}"</span>: 
          {typeof value === 'object' && value !== null ? (
            <div>
              {Array.isArray(value) ? '[' : '{'}
              <div className="pl-4">
                {Array.isArray(value) ? (
                  value.map((item, i) => (
                    <div key={i} className="mb-1">
                      <JsonDisplay data={item} />
                      {i < value.length - 1 && ','}
                    </div>
                  ))
                ) : (
                  Object.entries(value).map(([nestedKey, nestedValue], i, arr) => (
                    <div key={nestedKey} className="mb-1">
                      <span className="text-json-key">"{nestedKey}"</span>: 
                      <JsonDisplay data={nestedValue} />
                      {i < arr.length - 1 && ','}
                    </div>
                  ))
                )}
              </div>
              {Array.isArray(value) ? ']' : '}'}
            </div>
          ) : (
            <span>
              {typeof value === 'string' ? (
                <span className="text-json-number">"{value}"</span>
              ) : typeof value === 'number' ? (
                <span className="text-primary">{value}</span>
              ) : (
                String(value)
              )}
            </span>
          )}
          {index < Object.entries(data).length - 1 && ','}
        </div>
      ))}
    </div>
  );
};

export const JsonWrapper: React.FC<JsonDisplayProps> = ({ data }) => {
  return (
    <div>
      {'{'}
      <JsonDisplay data={data} />
      {'}'}
    </div>
  );
};
