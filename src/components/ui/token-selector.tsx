'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronDown } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';

interface TokenData {
    label: string;
    value: string;
    img: StaticImageData;
    address: string;
    chain_id: number;
    decimals: number;
    chain: string;
    token_type: string;
}

interface TokenSelectorProps {
    selectedToken: string;
    onTokenChange: (token: string) => void;
    supportedTokens: TokenData[];
}

export function TokenSelector({
    selectedToken,
    onTokenChange,
    supportedTokens,
}: TokenSelectorProps) {
    const [open, setOpen] = useState(false);

    const selectedTokenData = supportedTokens.find(
        (token) => token.label === selectedToken
    );

    const handleTokenSelect = (tokenLabel: string) => {
        onTokenChange(tokenLabel);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 rounded-xl px-3 py-2"
                >
                    {selectedTokenData && (
                        <>
                            <Image
                                src={selectedTokenData.img}
                                alt={selectedTokenData.label}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                            <span className="text-white font-medium">
                                {selectedTokenData.label}
                            </span>
                        </>
                    )}
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Select Token</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    {supportedTokens.map((token) => (
                        <Button
                            key={token.label}
                            variant="ghost"
                            onClick={() => handleTokenSelect(token.label)}
                            className="w-full justify-start space-x-3 p-4 hover:bg-slate-800/50 rounded-lg"
                        >
                            <Image
                                src={token.img}
                                alt={token.label}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                            <div className="text-left">
                                <div className="font-medium">{token.label}</div>
                                <div className="text-sm text-slate-400">{token.value}</div>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
