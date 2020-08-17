require('dotenv').config();

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.static('public'));

app.get('/products', async (_request, response) => {
  // Ask stripe for all of the products
  const products = await stripe.products.list({
    limit: 100,
  });
  // Ask stripe for all of the prices
  const prices = await stripe.prices.list({
    limit: 100,
  });
  // Associate the products with the prices
  prices.data.forEach(price => {
    // find the product associated with this price.
    const theAssociatedProduct = products.data.find(
      product => product.id === price.product
    );
    // associate the product with the price
    theAssociatedProduct.price = price;
  });
  // Send back a list of all the products and their associated prices
  const cleanedUpProducts = products.data.map(product => ({
    name: product.name,
    description: product.description,
    image: product.images[0],
    category: product.metadata.category,
    currency: product.price.currency,
    price_cents: product.price.unit_amount,
    price_id: product.price.id,
  }));
  response.json(cleanedUpProducts);
});

app.listen(3000, () => console.log(`Server is on!`));
