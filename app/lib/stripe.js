import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PRICE_IDS = {
  reader: process.env.STRIPE_PRICE_READER,
  bibliophile: process.env.STRIPE_PRICE_BIBLIOPHILE,
};

export const CREDIT_AMOUNTS = {
  reader: 20,
  bibliophile: 60,
};
