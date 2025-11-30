import React from 'react';

interface MetricBarSvgProps {
    type: 'submitted' | 'approved' ;
    className?: string;
}

const MetricBarSvg: React.FC<MetricBarSvgProps> = ({ type, className = "" }) => {
    const bars = {
        submitted: (
            <svg width="53" height="11" viewBox="0 0 53 11" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                <path d="M0.500122 10.5L26.5299 3L44.0299 5.5L51.5299 0.5" stroke="#2596BE" strokeLinecap="round"/>
            </svg>
        ),
        approved: (
           <svg width="20" height="26" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3.5L7.06569 7.43432C6.86768 7.63232 6.76867 7.73133 6.65451 7.76842C6.55409 7.80105 6.44591 7.80105 6.34549 7.76842C6.23133 7.73133 6.13232 7.63232 5.93432 7.43431L4.56569 6.06568C4.36768 5.86768 4.26867 5.76867 4.15451 5.73158C4.05409 5.69895 3.94591 5.69895 3.84549 5.73158C3.73133 5.76867 3.63232 5.86768 3.43431 6.06569L1 8.5M11 3.5H7.5M11 3.5V7" stroke="#17B26A" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    };

    return bars[type];
};

export default MetricBarSvg;