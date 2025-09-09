import React from 'react';


const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    return (
        <svg
            width="23"
            height="24"
            viewBox="0 0 23 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect y="0.545288" width="23" height="23" rx="4" fill="black" />
            <path
                d="M16.0007 10.9453C16.0007 13.6915 12.885 16.5516 11.8388 17.4349C11.7413 17.5065 11.6227 17.5453 11.5007 17.5453C11.3788 17.5453 11.2601 17.5065 11.1627 17.4349C10.1164 16.5516 7.00073 13.6915 7.00073 10.9453C7.00073 9.77838 7.47484 8.6592 8.31875 7.83403C9.16267 7.00886 10.3073 6.54529 11.5007 6.54529C12.6942 6.54529 13.8388 7.00886 14.6827 7.83403C15.5266 8.6592 16.0007 9.77838 16.0007 10.9453Z"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.5007 12.5453C12.3292 12.5453 13.0007 11.8737 13.0007 11.0453C13.0007 10.2169 12.3292 9.54529 11.5007 9.54529C10.6723 9.54529 10.0007 10.2169 10.0007 11.0453C10.0007 11.8737 10.6723 12.5453 11.5007 12.5453Z"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default LocationIcon;
