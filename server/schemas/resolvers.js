const { AuthenticationError } = require('apollo-server-express');
const { User, Site, Note } = require('../models');
const { signToken } = require('../utils/auth');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      console.log('context', context.user);
      if (context.user) {
        const user = await User.findById({ _id: context.user._id });
        //   .populate({
        //     path: 'site.notes',
        //     populate: 'site',
        //   });

        return user;
      }

      // throw new AuthenticationError('Not logged in');
    },
    sites: async () => {
      return await Site.find();
    },
    notes: async () => {
      return await Note.find();
    },

    users: async () => {
      return await User.find();
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    createNote: async (parent, args, context, info) => {
      const { author, content } = args.note;
      const note = await new Note({ author, content }).save();
      return note;
    },
    updateNote: async (parent, args, context, info) => {
      const { id } = args;
      const { author, content } = args.note;
      const note = await Note.findByIdAndUpdate(
        id,
        { author, content },
        { new: true }
      );
      return note;
    },
    deleteNote: async (parent, args, context, info) => {
      const { id } = args;
      await Note.findByIdAndDelete(id);
      return 'Deleted';
    },
  },
};

module.exports = resolvers;

// products: async (parent, { category, name }) => {
//   const params = {};

//   if (category) {
//     params.category = category;
//   }

//   if (name) {
//     params.name = {
//       $regex: name
//     };
//   }

//   return await Product.find(params).populate('category');
// },
// product: async (parent, { _id }) => {
//   return await Product.findById(_id).populate('category');
// },
// user: async (parent, args, context) => {
//   if (context.user) {
//     const user = await User.findById(context.user._id).populate({
//       path: 'orders.products',
//       populate: 'category'
//     });

//     user.orders.sort((a, b) => b.purchaseDate - a.purchaseDate);

//     return user;
//   }

//   throw new AuthenticationError('Not logged in');
// },
// order: async (parent, { _id }, context) => {
//   if (context.user) {
//     const user = await User.findById(context.user._id).populate({
//       path: 'orders.products',
//       populate: 'category'
//     });

//     return user.orders.id(_id);
//   }

//   throw new AuthenticationError('Not logged in');
// },
// checkout: async (parent, args, context) => {
//   const url = new URL(context.headers.referer).origin;
//   const order = new Order({ products: args.products });
//   const line_items = [];

//   const { products } = await order.populate('products');

//   for (let i = 0; i < products.length; i++) {
//     const product = await stripe.products.create({
//       name: products[i].name,
//       description: products[i].description,
//       images: [`${url}/images/${products[i].image}`]
//     });

//     const price = await stripe.prices.create({
//       product: product.id,
//       unit_amount: products[i].price * 100,
//       currency: 'usd',
//     });

//     line_items.push({
//       price: price.id,
//       quantity: 1
//     });
//   }

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     line_items,
//     mode: 'payment',
//     success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${url}/`
//   });

//   return { session: session.id };
// }
// },
