import { ConnectWalletProvider } from '@/Context/ConnectWalletSliderContext';
import { ThemeProvider } from '@/Context/ThemeContext';
import { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
    return <section><ThemeProvider><ConnectWalletProvider>{children}</ConnectWalletProvider></ThemeProvider></section>;
}
