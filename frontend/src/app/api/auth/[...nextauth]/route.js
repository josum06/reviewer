import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user)           throw new Error('No account found with this email');
        if (!user.password)  throw new Error('This account uses Google Sign-In');

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid)          throw new Error('Invalid password');

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],

  pages: {
    signIn:  '/auth/signin',
    signOut: '/auth/signin',
    error:   '/auth/signin',
  },

  session: { strategy: 'jwt' },

  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };