import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/db.ts';
import { companies } from './shared/schema.ts';

const sampleCompanies = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Oil & Gas',
    currentPrice: '2500.00',
    marketCap: '1680000.00',
    isActive: true,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    sector: 'Information Technology',
    currentPrice: '3800.00',
    marketCap: '1400000.00',
    isActive: true,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking',
    currentPrice: '1650.00',
    marketCap: '950000.00',
    isActive: true,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    currentPrice: '1450.00',
    marketCap: '600000.00',
    isActive: true,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    sector: 'Banking',
    currentPrice: '950.00',
    marketCap: '650000.00',
    isActive: true,
  },
];

async function seedCompanies() {
  try {
    console.log('Seeding companies...');

    for (const company of sampleCompanies) {
      await db.insert(companies).values(company);
      console.log(`Added company: ${company.name} (${company.symbol})`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding companies:', error);
  } finally {
    process.exit(0);
  }
}

seedCompanies();
