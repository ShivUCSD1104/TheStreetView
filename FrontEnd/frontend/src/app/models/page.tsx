'use client';

import { useState } from 'react';
import Modal from '../components/modal';

interface Constraint {
  label: string;
  options: string[];
}

interface CardData {
  title: string;
  constraints: Constraint[];
}

export default function Models() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCardData, setSelectedCardData] = useState<CardData | null>(null);

  const cards: CardData[] = [
    {
      title: 'Implied Volatility Surface',
      constraints: [
        { label: 'Ticker', options: ['AAPL', 'GOOGL', 'MSFT'] },
        { 
          label: 'Time Period', 
          options: ['1 month', '3 months', '6 months', '1 year', 'custom'] 
        },
      ],
    },
    {
      title: 'Order Book Ravine',
      constraints: [
        { label: 'Ticker', options: ['AAPL', 'GOOGL', 'MSFT'] },
        { 
          label: 'Time Period', 
          options: ['1 month', '3 months', '6 months', '1 year', 'custom'] 
        },
      ],
    },
    {
      title: 'US Fix Income Yield Plot',
      constraints: [
        { label: 'Issuer', options: ['US Treasury'] },
        { 
          label: 'Time Period', 
          options: ['1 month', '3 months', '6 months', '1 year', 'custom'] 
        },
      ],
    },
  ];

  const openModal = (cardData: CardData) => {
    setSelectedCardData(cardData);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCardData(null);
  };

  return (
    <div>
      <main className="min-h-screen bg-[url(/paper.jpg)] p-8">
        <section className="max-w-6xl mx-auto py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 bg-white shadow-[8px_8px_16px_#bebebe] group"
                onClick={() => openModal(card)}
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <h3 className="text-xl text-black mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">{card.title}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>
      {selectedCardData && (
        <Modal isOpen={isModalOpen} onClose={closeModal} cardData={selectedCardData} />
      )}
    </div>
  );
}