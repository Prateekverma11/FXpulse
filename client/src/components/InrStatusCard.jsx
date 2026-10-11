import React from 'react';
import CurrencyConverter from './CurrencyConverter';

export default function InrStatusCard({
  baseCurrency = 'AUD',
  quoteCurrency = 'INR',
  onSwapPair,
  onSetPair,
  onChangeBase,
  onChangeQuote,
  currencies = [],
  currentRate,
  change24h = 0,
  referenceCurrency,
  referenceSymbol,
  analytics
}) {
  const activeBase = (baseCurrency || referenceCurrency || 'AUD').toUpperCase();
  const activeQuote = (quoteCurrency || 'INR').toUpperCase();

  const handleSwap = () => {
    if (onSwapPair) {
      onSwapPair();
    } else if (onSetPair) {
      onSetPair(activeQuote, activeBase);
    } else {
      onChangeBase?.(activeQuote);
      onChangeQuote?.(activeBase);
    }
  };

  const handleChangeBase = (code) => {
    if (code === activeQuote) {
      handleSwap();
    } else if (onSetPair) {
      onSetPair(code, activeQuote);
    } else {
      onChangeBase?.(code);
    }
  };

  const handleChangeQuote = (code) => {
    if (code === activeBase) {
      handleSwap();
    } else if (onSetPair) {
      onSetPair(activeBase, code);
    } else {
      onChangeQuote?.(code);
    }
  };

  return (
    <CurrencyConverter
      baseCurrency={activeBase}
      quoteCurrency={activeQuote}
      currencies={currencies}
      currentRate={currentRate}
      change24h={change24h}
      onSwapPair={handleSwap}
      onChangeBase={handleChangeBase}
      onChangeQuote={handleChangeQuote}
      analytics={analytics}
    />
  );
}
